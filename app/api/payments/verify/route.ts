import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requests } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { markPaymentApproved } from "@/lib/dashboard-data";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestId = req.nextUrl.searchParams.get("requestId");
  if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });

  const [request] = await db
    .select()
    .from(requests)
    .where(eq(requests.id, requestId));

  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  if (request.status === "approved" || request.paid_at) {
    return NextResponse.json({ status: "approved", alreadyApproved: true });
  }

  if (!request.mp_payment_id) {
    return NextResponse.json({ status: request.status, cannotVerify: true });
  }

  try {
    const payment = new Payment(mp);
    const paymentData = await payment.get({ id: Number(request.mp_payment_id) });
    const mpStatus = paymentData.status;

    if (mpStatus === "approved") {
      await markPaymentApproved(requestId, request.mp_payment_id);
      return NextResponse.json({ status: "approved", justApproved: true });
    }

    return NextResponse.json({ status: mpStatus ?? request.status });
  } catch (err) {
    console.error("[Verify] MP API error:", err);
    return NextResponse.json({ status: request.status, error: "mp_api_failed" });
  }
}
