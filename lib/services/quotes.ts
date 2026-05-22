// Service: regra de negócio para orçamentos compartilháveis.
//
// Responsabilidades:
// - Gerar / regerar tokens de share únicos
// - Carregar a representação "view-only" pública (sem dados sensíveis)
// - Montar o payload pro link de WhatsApp
//
// Não toca em DB direto — chama o repo. Não conhece HTTP — chama via Route Handler.

import {
  clearShareToken,
  findRequestById,
  isShareTokenInUse,
  loadQuoteByRequestId,
  loadQuoteByShareToken,
  setShareToken,
  type QuoteRecord,
} from "@/lib/repos/quotes";

const TOKEN_BYTES = 18; // 24 chars url-safe base64

function generateRawToken(): string {
  const bytes = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  // base64url sem padding
  let s = btoa(String.fromCharCode(...bytes));
  s = s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return s;
}

async function generateUniqueToken(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const token = generateRawToken();
    if (!(await isShareTokenInUse(token))) return token;
  }
  throw new Error("Failed to generate unique share token after 5 attempts");
}

export class QuoteNotFoundError extends Error {
  constructor() { super("Quote not found"); this.name = "QuoteNotFoundError"; }
}

/** Garante token de share — gera novo se ainda não existir. Retorna o token atual. */
export async function ensureShareToken(requestId: string): Promise<string> {
  const req = await findRequestById(requestId);
  if (!req) throw new QuoteNotFoundError();
  if (req.share_token) return req.share_token;

  const token = await generateUniqueToken();
  await setShareToken(requestId, token);
  return token;
}

/** Força a geração de um novo token, invalidando o anterior. */
export async function rotateShareToken(requestId: string): Promise<string> {
  const req = await findRequestById(requestId);
  if (!req) throw new QuoteNotFoundError();
  const token = await generateUniqueToken();
  await setShareToken(requestId, token);
  return token;
}

/** Revoga o token: link público para de funcionar. */
export async function revokeShareToken(requestId: string): Promise<void> {
  const req = await findRequestById(requestId);
  if (!req) throw new QuoteNotFoundError();
  await clearShareToken(requestId);
}

/** Versão "public view" — remove campos que não devem vazar publicamente. */
export interface PublicQuoteView {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  budget: string | null;
  payment_deadline: string | null;
  delivery_deadline: string | null;
  admin_notes: string | null;
  image_url: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  client: { name: string | null } | null;
  stages: Array<{
    id: string;
    title: string;
    amount: number;
    position: number;
    is_extra: boolean;
    status: string;
    paid_at: string | null;
    work_status: string;
    due_date: string | null;
  }>;
  attachments: Array<{
    id: string;
    url: string;
    name: string;
    kind: "image" | "file";
    position: number;
  }>;
}

function toPublicView(q: QuoteRecord): PublicQuoteView {
  return {
    id: q.id,
    title: q.title,
    description: q.description,
    type: q.type,
    status: q.status,
    budget: q.budget,
    payment_deadline: q.payment_deadline,
    delivery_deadline: q.delivery_deadline,
    admin_notes: q.admin_notes,
    image_url: q.image_url,
    paid_at: q.paid_at,
    created_at: q.created_at,
    updated_at: q.updated_at,
    client: q.client ? { name: q.client.name ?? null } : null,
    stages: q.stages.map((s) => ({
      id: s.id,
      title: s.title,
      amount: s.amount,
      position: s.position,
      is_extra: s.is_extra,
      status: s.status,
      paid_at: s.paid_at,
      work_status: s.work_status,
      due_date: s.due_date,
    })),
    attachments: q.attachments.map((a) => ({
      id: a.id,
      url: a.url,
      name: a.name,
      kind: a.kind,
      position: a.position,
    })),
  };
}

/** View pública por token — usado pela página /quote/[token]. */
export async function getPublicQuoteByToken(token: string): Promise<PublicQuoteView> {
  const q = await loadQuoteByShareToken(token);
  if (!q) throw new QuoteNotFoundError();
  return toPublicView(q);
}

/** View completa por id (admin/owner) — usado pelo painel autenticado. */
export async function getQuoteById(requestId: string): Promise<QuoteRecord> {
  const q = await loadQuoteByRequestId(requestId);
  if (!q) throw new QuoteNotFoundError();
  return q;
}

export function buildPublicQuoteUrl(token: string, appUrl: string): string {
  const base = appUrl.replace(/\/$/, "");
  return `${base}/quote/${token}`;
}

export function buildWhatsAppShareUrl(quote: PublicQuoteView, publicUrl: string, phone?: string): string {
  const budgetLine = quote.budget ? `Valor: ${quote.budget}\n` : "";
  const text =
    `Olá! Compartilho aqui o orçamento referente a: *${quote.title}*\n\n` +
    `${budgetLine}` +
    `Confira os detalhes e formas de pagamento:\n${publicUrl}\n\n` +
    `Qualquer dúvida estou à disposição.`;
  const params = new URLSearchParams({ text });
  return phone ? `https://wa.me/${phone.replace(/\D/g, "")}?${params}` : `https://wa.me/?${params}`;
}
