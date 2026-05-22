// Thin Mercado Pago client using direct fetch (avoids the Node MP SDK which
// breaks on Cloudflare Workers with "Cannot read properties of null (reading 'has')").

const MP_BASE = "https://api.mercadopago.com";

function token() {
  const t = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!t) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");
  return t;
}

async function mpFetch<T>(path: string, init: RequestInit & { idempotencyKey?: string } = {}): Promise<T> {
  const { idempotencyKey, headers, ...rest } = init;
  const res = await fetch(`${MP_BASE}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "X-Idempotency-Key": idempotencyKey } : {}),
      ...(headers ?? {}),
    },
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(`MP API ${res.status}: ${json?.message ?? text}`);
    (err as Error & { mp?: unknown; status?: number }).mp = json;
    (err as Error & { mp?: unknown; status?: number }).status = res.status;
    throw err;
  }
  return json as T;
}

export interface MpPreferenceBody {
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
  payer?: { email?: string };
  back_urls?: { success?: string; failure?: string; pending?: string };
  auto_return?: "approved";
  notification_url?: string;
  external_reference?: string;
  statement_descriptor?: string;
}

export interface MpPreferenceResponse {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
}

export function createPreference(body: MpPreferenceBody) {
  return mpFetch<MpPreferenceResponse>("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export interface MpPaymentResponse {
  id: number;
  status: string;
  status_detail?: string;
  external_reference?: string;
}

export function createPayment(body: Record<string, unknown>) {
  return mpFetch<MpPaymentResponse>("/v1/payments", {
    method: "POST",
    body: JSON.stringify(body),
    idempotencyKey: crypto.randomUUID(),
  });
}

export function getPayment(id: string | number) {
  return mpFetch<MpPaymentResponse>(`/v1/payments/${id}`, { method: "GET" });
}
