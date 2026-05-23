// PIX direto, sem brick: aproveita o e-mail da sessão pra pular a tela de
// confirmação de e-mail do PaymentBrick. Cria o pagamento PIX no MP e devolve
// qr_code/qr_code_base64 prontos pra renderizar inline.
//
// Estado de "pago" continua sendo responsabilidade exclusiva da webhook do MP.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requests, request_stages } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { isAdminEmail } from "@/lib/admin-helpers";
import { createPayment } from "@/lib/mercadopago";
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

  // Decide valor a cobrar (etapa específica ou soma das pendentes), com desconto aplicado
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const isPublicUrl = !appUrl.includes("localhost") && !appUrl.includes("127.0.0.1");

  // Cria PIX no MP. Pix tem `date_of_expiration` opcional (~24h) e payer.email obrigatório.
  let payment;
  try {
    payment = await createPayment({
      transaction_amount: amount,
      description: title,
      payment_method_id: "pix",
      external_reference: externalReference,
      payer: { email: session.user.email },
      ...(isPublicUrl && { notification_url: `${appUrl}/api/payments/webhook` }),
    });
  } catch (err) {
    console.error("[pix/create]", err);
    return NextResponse.json({ error: "Failed to create PIX payment" }, { status: 502 });
  }

  const paymentId = String(payment.id);
  const transactionData = payment.point_of_interaction?.transaction_data;
  if (!transactionData?.qr_code_base64) {
    return NextResponse.json({ error: "MP did not return PIX QR data" }, { status: 502 });
  }

  // Guarda mp_payment_id pra polling/webhook poder achar. NÃO marca como pago.
  if (stageId) {
    await db
      .update(request_stages)
      .set({ mp_payment_id: paymentId, updated_at: new Date().toISOString() })
      .where(eq(request_stages.id, stageId));
  } else {
    await db
      .update(requests)
      .set({ mp_payment_id: paymentId, updated_at: new Date().toISOString() })
      .where(eq(requests.id, requestId));
  }

  return NextResponse.json({
    paymentId,
    amount,
    pix: {
      qrCode: transactionData.qr_code,
      qrCodeBase64: transactionData.qr_code_base64,
      ticketUrl: transactionData.ticket_url,
    },
  });
}
