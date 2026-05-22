// Repository: acesso direto ao D1 via Drizzle. Sem regra de negócio.
//
// Convenção:
// - Funções nomeadas no padrão `<verb><Entity>` (findX, updateY, listZ).
// - Sempre tipadas com tipos do schema; nunca exporta `db` cru.
// - Nada de side effects além do I/O (sem enviar email, sem chamar APIs externas).

import { db } from "@/lib/db";
import {
  requests,
  request_attachments,
  request_stages,
  user,
  type Request,
  type RequestAttachment,
  type RequestStage,
  type User,
} from "@/lib/schema";
import { and, eq } from "drizzle-orm";

export type QuoteRecord = Request & {
  client: Pick<User, "id" | "name" | "email"> | null;
  stages: RequestStage[];
  attachments: RequestAttachment[];
};

export async function findRequestById(id: string): Promise<Request | null> {
  const [row] = await db.select().from(requests).where(eq(requests.id, id)).limit(1);
  return row ?? null;
}

export async function findRequestByShareToken(token: string): Promise<Request | null> {
  const [row] = await db
    .select()
    .from(requests)
    .where(eq(requests.share_token, token))
    .limit(1);
  return row ?? null;
}

export async function setShareToken(requestId: string, token: string): Promise<void> {
  await db
    .update(requests)
    .set({ share_token: token, updated_at: new Date().toISOString() })
    .where(eq(requests.id, requestId));
}

export async function clearShareToken(requestId: string): Promise<void> {
  await db
    .update(requests)
    .set({ share_token: null, updated_at: new Date().toISOString() })
    .where(eq(requests.id, requestId));
}

export async function loadQuoteByRequestId(requestId: string): Promise<QuoteRecord | null> {
  const [withClient] = await db
    .select({ request: requests, client: user })
    .from(requests)
    .leftJoin(user, eq(requests.user_id, user.id))
    .where(eq(requests.id, requestId))
    .limit(1);

  if (!withClient) return null;

  const [stages, attachments] = await Promise.all([
    db
      .select()
      .from(request_stages)
      .where(eq(request_stages.request_id, requestId))
      .orderBy(request_stages.position),
    db
      .select()
      .from(request_attachments)
      .where(eq(request_attachments.request_id, requestId))
      .orderBy(request_attachments.position, request_attachments.created_at),
  ]);

  return {
    ...withClient.request,
    client: withClient.client
      ? { id: withClient.client.id, name: withClient.client.name, email: withClient.client.email }
      : null,
    stages,
    attachments,
  };
}

export async function loadQuoteByShareToken(token: string): Promise<QuoteRecord | null> {
  const req = await findRequestByShareToken(token);
  if (!req) return null;
  return loadQuoteByRequestId(req.id);
}

export async function isShareTokenInUse(token: string): Promise<boolean> {
  const [row] = await db
    .select({ id: requests.id })
    .from(requests)
    .where(eq(requests.share_token, token))
    .limit(1);
  return !!row;
}

export async function findStageByRequestAndId(
  requestId: string,
  stageId: string,
): Promise<RequestStage | null> {
  const [row] = await db
    .select()
    .from(request_stages)
    .where(and(eq(request_stages.id, stageId), eq(request_stages.request_id, requestId)))
    .limit(1);
  return row ?? null;
}
