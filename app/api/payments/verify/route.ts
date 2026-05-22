import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requests, request_stages } from "@/lib/schema";
import { and, eq, isNotNull, ne } from "drizzle-orm";
import { markPaymentApproved } from "@/lib/dashboard-data";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

async function checkMpPayment(paymentId: string) {
  try {
    const payment = new Payment(mp);
    const data = await payment.get({ id: Number(paymentId) });
    return data.status ?? null;
  } catch (err) {
    console.error("[Verify] MP API error:", err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestId = req.nextUrl.searchParams.get("requestId");
  const stageId = req.nextUrl.searchParams.get("stageId");
  if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });

  const [request] = await db
    .select()
    .from(requests)
    .where(eq(requests.id, requestId));

  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  if (request.status === "approved" || request.paid_at) {
    return NextResponse.json({ status: "approved", alreadyApproved: true });
  }

  // Caso 1: verificar etapa específica
  if (stageId) {
    const [stage] = await db
      .select()
      .from(request_stages)
      .where(and(eq(request_stages.id, stageId), eq(request_stages.request_id, requestId)));
    if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    if (stage.status === "paid") return NextResponse.json({ status: "approved", alreadyApproved: true });
    if (!stage.mp_payment_id) return NextResponse.json({ status: "pending", cannotVerify: true });

    const mpStatus = await checkMpPayment(stage.mp_payment_id);
    if (mpStatus === "approved") {
      await markPaymentApproved(`${requestId}:${stageId}`, stage.mp_payment_id);
      return NextResponse.json({ status: "approved", justApproved: true });
    }
    return NextResponse.json({ status: mpStatus ?? "pending" });
  }

  // Caso 2: varre stages pendentes com mp_payment_id e o próprio request
  const pendingStages = await db
    .select()
    .from(request_stages)
    .where(and(eq(request_stages.request_id, requestId), ne(request_stages.status, "paid"), isNotNull(request_stages.mp_payment_id)));

  let anyApproved = false;
  for (const stage of pendingStages) {
    if (!stage.mp_payment_id) continue;
    const mpStatus = await checkMpPayment(stage.mp_payment_id);
    if (mpStatus === "approved") {
      await markPaymentApproved(`${requestId}:${stage.id}`, stage.mp_payment_id);
      anyApproved = true;
    }
  }

  if (request.mp_payment_id) {
    const mpStatus = await checkMpPayment(request.mp_payment_id);
    if (mpStatus === "approved") {
      await markPaymentApproved(requestId, request.mp_payment_id);
      return NextResponse.json({ status: "approved", justApproved: true });
    }
    if (anyApproved) return NextResponse.json({ status: "approved", justApproved: true });
    return NextResponse.json({ status: mpStatus ?? request.status });
  }

  if (anyApproved) return NextResponse.json({ status: "approved", justApproved: true });
  return NextResponse.json({ status: request.status, cannotVerify: pendingStages.length === 0 });
}
