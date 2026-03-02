import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

function userClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer "))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = auth.slice(7);

  // Autentica com token do usuário
  const supabase = userClient(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { requestId, formData } = body;

  if (!requestId || !formData)
    return NextResponse.json({ error: "requestId and formData required" }, { status: 400 });

  // Busca o request com cliente autenticado (RLS garante ownership)
  const { data: request, error: reqErr } = await supabase
    .from("requests")
    .select("id, status, user_id, budget")
    .eq("id", requestId)
    .single();

  if (reqErr || !request)
    return NextResponse.json({ error: "Request not found" }, { status: 404 });

  if (request.status !== "quoted")
    return NextResponse.json({ error: "Request is not payable" }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const isPublicUrl = !appUrl.includes("localhost") && !appUrl.includes("127.0.0.1");

  // Cria pagamento no MercadoPago
  const payment = new Payment(mp);
  const paymentData = await payment.create({
    body: {
      ...formData,
      external_reference: requestId,
      ...(isPublicUrl && {
        notification_url: `${appUrl}/api/payments/webhook`,
      }),
    },
  });

  const status = paymentData.status;
  const paymentId = String(paymentData.id);

  if (status === "approved") {
    // Camada 1: update direto via token do usuário (RLS)
    await supabase
      .from("requests")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        mp_payment_id: paymentId,
        paid_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    // Camada 2 (redundância): RPC SECURITY DEFINER como fallback independente
    const anonSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );
    const { error: rpcErr } = await anonSupabase.rpc("mark_payment_approved", {
      p_request_id: requestId,
      p_payment_id: paymentId,
    });
    if (rpcErr) console.error("[Process] RPC fallback error:", rpcErr);

  } else if (status === "pending" || status === "in_process") {
    // Salva o payment_id para que o polling e o webhook possam confirmar depois
    await supabase
      .from("requests")
      .update({ mp_payment_id: paymentId })
      .eq("id", requestId);
  }

  return NextResponse.json({
    status,
    paymentId,
    statusDetail: paymentData.status_detail,
  });
}
