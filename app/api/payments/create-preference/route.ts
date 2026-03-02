import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

function parseBudget(raw: string | null): number {
  if (!raw) return 0;
  const cleaned = raw
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return parseFloat(cleaned) || 0;
}

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

  // Autentica o usuário com o token
  const supabase = userClient(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestId } = await req.json();
  if (!requestId)
    return NextResponse.json({ error: "requestId required" }, { status: 400 });

  // Busca o request usando o cliente autenticado (RLS garante ownership)
  const { data: request, error: reqErr } = await supabase
    .from("requests")
    .select("id, title, budget, status, user_id")
    .eq("id", requestId)
    .single();

  if (reqErr || !request)
    return NextResponse.json({ error: "Request not found" }, { status: 404 });

  if (request.status !== "quoted")
    return NextResponse.json({ error: "Request is not in quoted state" }, { status: 400 });

  const amount = parseBudget(request.budget as string | null);
  if (amount <= 0)
    return NextResponse.json({ error: "Invalid budget amount" }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const isPublicUrl = !appUrl.includes("localhost") && !appUrl.includes("127.0.0.1");

  const preference = new Preference(mp);
  const result = await preference.create({
    body: {
      items: [
        {
          id: request.id as string,
          title: request.title as string,
          quantity: 1,
          unit_price: amount,
          currency_id: "BRL",
        },
      ],
      payer: { email: user.email },
      ...(isPublicUrl && {
        back_urls: {
          success: `${appUrl}/dashboard/requests/${requestId}?payment=success`,
          failure: `${appUrl}/dashboard/requests/${requestId}?payment=failure`,
          pending: `${appUrl}/dashboard/requests/${requestId}?payment=pending`,
        },
        auto_return: "approved" as const,
        notification_url: `${appUrl}/api/payments/webhook`,
      }),
      external_reference: requestId as string,
      statement_descriptor: "AFONSO BURGINSKI",
    },
  });

  return NextResponse.json({ preferenceId: result.id, amount });
}
