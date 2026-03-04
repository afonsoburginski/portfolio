import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requests } from "@/lib/schema";
import { eq } from "drizzle-orm";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

function parseBudget(raw: string | null | undefined): number {
  if (!raw) return 0;
  const cleaned = raw
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return parseFloat(cleaned) || 0;
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestId } = await req.json();
  if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });

  const [request] = await db
    .select()
    .from(requests)
    .where(eq(requests.id, requestId));

  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (request.status !== "quoted") return NextResponse.json({ error: "Request is not in quoted state" }, { status: 400 });
  if (request.user_id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const amount = parseBudget(request.budget);
  if (amount <= 0) return NextResponse.json({ error: "Invalid budget amount" }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const isPublicUrl = !appUrl.includes("localhost") && !appUrl.includes("127.0.0.1");

  const preference = new Preference(mp);
  const result = await preference.create({
    body: {
      items: [
        {
          id: request.id,
          title: request.title,
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
      external_reference: requestId,
      statement_descriptor: "AFONSO BURGINSKI",
    },
  });

  return NextResponse.json({ preferenceId: result.id, amount });
}
