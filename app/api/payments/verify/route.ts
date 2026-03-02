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

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

/**
 * GET /api/payments/verify?requestId=xxx
 *
 * Verifica o status real do pagamento no MercadoPago e, se aprovado,
 * chama mark_payment_approved para garantir que o DB reflita o estado correto.
 * Usado como redundância quando o webhook falha ou chega atrasado.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer "))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = auth.slice(7);
  const requestId = req.nextUrl.searchParams.get("requestId");
  if (!requestId)
    return NextResponse.json({ error: "requestId required" }, { status: 400 });

  const supabase = userClient(token);

  // Valida sessão
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Busca o pedido (RLS garante que o usuário é o dono ou admin)
  const { data: request, error: reqErr } = await supabase
    .from("requests")
    .select("id, status, mp_payment_id, mp_preference_id, paid_at")
    .eq("id", requestId)
    .single();

  if (reqErr || !request)
    return NextResponse.json({ error: "Request not found" }, { status: 404 });

  // Já aprovado localmente — nada a fazer
  if (request.status === "approved" || request.paid_at) {
    return NextResponse.json({ status: "approved", alreadyApproved: true });
  }

  // Sem payment_id — sem como verificar ainda
  if (!request.mp_payment_id) {
    return NextResponse.json({ status: request.status, cannotVerify: true });
  }

  try {
    const payment = new Payment(mp);
    const paymentData = await payment.get({ id: Number(request.mp_payment_id) });
    const mpStatus = paymentData.status;

    if (mpStatus === "approved") {
      // Pagamento aprovado no MP mas não refletido no DB — corrige agora
      const { error: rpcErr } = await anonClient().rpc("mark_payment_approved", {
        p_request_id: requestId,
        p_payment_id: request.mp_payment_id,
      });
      if (rpcErr) console.error("[Verify] RPC error:", rpcErr);
      return NextResponse.json({ status: "approved", justApproved: true });
    }

    return NextResponse.json({ status: mpStatus ?? request.status });
  } catch (err) {
    console.error("[Verify] MP API error:", err);
    return NextResponse.json({ status: request.status, error: "mp_api_failed" });
  }
}
