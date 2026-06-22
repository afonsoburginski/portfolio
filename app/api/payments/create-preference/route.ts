import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requests, request_stages } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { isAdminEmail } from "@/lib/admin-helpers";
import { createPreference, computeMarketplaceFee, type SplitConfig } from "@/lib/mercadopago";
import { computeRequestPricing } from "@/lib/services/pricing";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestId, stageId } = await req.json();
  if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });

  const [request] = await db.select().from(requests).where(eq(requests.id, requestId));
  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  const isAdmin =
    isAdminEmail(session.user.email) || (session.user as { isAdmin?: boolean }).isAdmin === true;
  if (!isAdmin && request.user_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Carrega tudo de uma vez e calcula com desconto aplicado
  const allStages = await db
    .select()
    .from(request_stages)
    .where(eq(request_stages.request_id, requestId));
  const pricing = computeRequestPricing(request, allStages);

  let amount: number;
  let title: string;
  let externalReference: string;

  if (stageId) {
    const stage = allStages.find((s) => s.id === stageId);
    if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    if (stage.status === "paid") return NextResponse.json({ error: "Stage already paid" }, { status: 400 });
    if (stage.status === "cancelled") return NextResponse.json({ error: "Stage cancelled" }, { status: 400 });

    const stageBreakdown = pricing.stages.find((s) => s.id === stageId);
    amount = stageBreakdown?.netAmount ?? stage.amount;
    title = `${request.title} — ${stage.title.slice(0, 80)}`;
    externalReference = `${requestId}:${stageId}`;
  } else {
    if (request.paid_at) return NextResponse.json({ error: "Request already paid" }, { status: 400 });
    if (allStages.length > 0) {
      if (pricing.pendingNet <= 0) {
        return NextResponse.json({ error: "All stages already paid" }, { status: 400 });
      }
      amount = pricing.pendingNet;
    } else {
      amount = pricing.netTotal;
    }
    title = request.title;
    externalReference = requestId;
  }

  if (amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

  // Split de pagamento (opcional, via env). Comissão da plataforma sobre a parcela; só ativa
  // quando configurado — sem env, é o coletor único de sempre (comportamento inalterado).
  const marketplaceFee = computeMarketplaceFee(amount, {
    pct: Number(process.env.MERCADOPAGO_MARKETPLACE_FEE_PCT ?? 0),
    fixed: Number(process.env.MERCADOPAGO_MARKETPLACE_FEE_FIXED ?? 0),
  });
  const split: SplitConfig | undefined =
    marketplaceFee > 0
      ? {
          marketplaceFee,
          sellerAccessToken: process.env.MERCADOPAGO_SELLER_ACCESS_TOKEN || undefined,
          marketplace: process.env.MERCADOPAGO_MARKETPLACE_ID || undefined,
        }
      : undefined;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const isPublicUrl = !appUrl.includes("localhost") && !appUrl.includes("127.0.0.1");

  try {
    const result = await createPreference({
      items: [
        {
          id: stageId ?? request.id,
          title,
          quantity: 1,
          unit_price: amount,
          currency_id: "BRL",
        },
      ],
      payer: { email: session.user.email },
      ...(isPublicUrl && {
        back_urls: {
          success: `${appUrl}/dashboard/requests/${requestId}?payment=success`,
          failure: `${appUrl}/dashboard/requests/${requestId}?payment=failure`,
          pending: `${appUrl}/dashboard/requests/${requestId}?payment=pending`,
        },
        auto_return: "approved" as const,
        notification_url: `${appUrl}/api/payments/webhook`,
      }),
      external_reference: externalReference,
      statement_descriptor: "AFONSO BURGINSKI",
    }, split);

    return NextResponse.json({
      preferenceId: result.id,
      amount,
      stageId: stageId ?? null,
      marketplaceFee: split?.marketplaceFee ?? 0,
    });
  } catch (err) {
    console.error("[MP create-preference]", err);
    return NextResponse.json({ error: "Failed to create preference" }, { status: 502 });
  }
}
