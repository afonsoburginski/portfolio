import { NextRequest, NextResponse } from "next/server";
import { markPaymentApproved } from "@/lib/dashboard-data";
import { getPayment } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type !== "payment" || !body.data?.id)
      return NextResponse.json({ ok: true });

    const paymentData = await getPayment(body.data.id);

    if (paymentData.status !== "approved")
      return NextResponse.json({ ok: true });

    const externalReference = paymentData.external_reference;
    if (!externalReference) return NextResponse.json({ ok: true });

    await markPaymentApproved(externalReference, String(paymentData.id));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[MP Webhook]", err);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
