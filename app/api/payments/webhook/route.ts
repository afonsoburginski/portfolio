import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

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

    const { error } = await anonClient().rpc("mark_payment_approved", {
      p_request_id: requestId,
      p_payment_id: String(paymentData.id),
    });

    if (error) console.error("[MP Webhook] RPC error:", error);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[MP Webhook]", err);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
