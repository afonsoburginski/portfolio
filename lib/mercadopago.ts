// Thin Mercado Pago client using direct fetch (avoids the Node MP SDK which
// breaks on Cloudflare Workers with "Cannot read properties of null (reading 'has')").

const MP_BASE = "https://api.mercadopago.com";

function token() {
  const t = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!t) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");
  return t;
}

async function mpFetch<T>(
  path: string,
  init: RequestInit & { idempotencyKey?: string; accessToken?: string } = {},
): Promise<T> {
  const { idempotencyKey, accessToken, headers, ...rest } = init;
  const res = await fetch(`${MP_BASE}${path}`, {
    ...rest,
    headers: {
      // Split: usa o token do vendedor conectado quando fornecido; senão, o da plataforma.
      Authorization: `Bearer ${accessToken ?? token()}`,
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
  /**
   * Split de pagamento (modelo marketplace MP): comissão retida pela plataforma.
   * A preferência precisa ser criada com o access token do VENDEDOR conectado
   * (MP Connect/OAuth); a plataforma recebe `marketplace_fee` do valor.
   * Quando ausente/0, é um pagamento normal de coletor único (comportamento atual).
   */
  marketplace_fee?: number;
  marketplace?: string;
}

/**
 * Split de pagamento — divisão de uma parcela entre destinatários.
 * `sellerAccessToken` (opcional): token do vendedor conectado (MP Connect). Sem ele,
 * o split não pode ser efetivado pelo MP e a cobrança cai no coletor único.
 */
export interface SplitConfig {
  /** Comissão da plataforma sobre o valor (em BRL). */
  marketplaceFee: number;
  /** Token do vendedor conectado (MP Connect/OAuth); ausente → sem split efetivo. */
  sellerAccessToken?: string;
  /** Identificador do marketplace (app id), quando aplicável. */
  marketplace?: string;
}

/** Calcula a comissão da plataforma a partir de % e/ou valor fixo (clamp em [0, amount]). */
export function computeMarketplaceFee(
  amount: number,
  opts: { pct?: number; fixed?: number },
): number {
  const pct = Number.isFinite(opts.pct) ? Math.max(0, opts.pct ?? 0) : 0;
  const fixed = Number.isFinite(opts.fixed) ? Math.max(0, opts.fixed ?? 0) : 0;
  const fee = (amount * pct) / 100 + fixed;
  return Math.min(Math.max(0, Math.round(fee * 100) / 100), amount);
}

export interface MpPreferenceResponse {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
}

export function createPreference(body: MpPreferenceBody, split?: SplitConfig) {
  const finalBody: MpPreferenceBody =
    split && split.marketplaceFee > 0
      ? {
          ...body,
          marketplace_fee: split.marketplaceFee,
          ...(split.marketplace ? { marketplace: split.marketplace } : {}),
        }
      : body;
  return mpFetch<MpPreferenceResponse>("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify(finalBody),
    // Split efetivo exige o token do vendedor conectado (MP Connect); senão, coletor único.
    ...(split?.sellerAccessToken ? { accessToken: split.sellerAccessToken } : {}),
  });
}

export interface MpPaymentResponse {
  id: number;
  status: string;
  status_detail?: string;
  external_reference?: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
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
