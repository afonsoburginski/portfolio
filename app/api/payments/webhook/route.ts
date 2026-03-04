import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { markPaymentApproved } from "@/lib/dashboard-data";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type !== "payment" || !body.data?.id)
      return NextResponse.json({ ok: true });

    const payment = new Payment(mp);
    const paymentData = await payment.get({ id: body.data.id });

    if (paymentData.status !== "approved")
      return NextResponse.json({ ok: true });

    const requestId = paymentData.external_reference;
    if (!requestId) return NextResponse.json({ ok: true });

    await markPaymentApproved(requestId, String(paymentData.id));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[MP Webhook]", err);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
