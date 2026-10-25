import { and, count, eq, gt, isNull, lt, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { oauth_clients, oauth_codes, oauth_tokens } from "@/lib/schema";
import { ACCESS_TTL_MS, CODE_TTL_MS, REFRESH_TTL_MS, isOwnResource } from "./config";
import { verifyS256 } from "./pkce";
import { ACCESS_PREFIX, CODE_PREFIX, REFRESH_PREFIX, hashToken, parseScope, randomId, randomToken } from "./tokens";
import type { AuthorizeRequest } from "./authorize-request";

const MAX_CLIENTS = 200;
const DAY_MS = 24 * 60 * 60 * 1000;

export type TokenResponse = { access_token: string; token_type: "Bearer"; expires_in: number; refresh_token: string; scope: string };
export type GrantError = { error: "invalid_grant" | "invalid_request" | "invalid_target" | "invalid_scope"; description: string };

export async function registerClient(name: string, redirectUris: string[]) {
  const [{ total }] = await db.select({ total: count() }).from(oauth_clients);
  if (total >= MAX_CLIENTS) return null;
  const clientId = randomId("cl_");
  await db.insert(oauth_clients).values({ client_id: clientId, client_name: name, redirect_uris: JSON.stringify(redirectUris) });
  return clientId;
}

export async function getClient(clientId: string) {
  const [row] = await db.select().from(oauth_clients).where(eq(oauth_clients.client_id, clientId)).limit(1);
  if (!row) return null;
  return { client_id: row.client_id, client_name: row.client_name, redirect_uris: JSON.parse(row.redirect_uris) as string[] };
}

export async function createCode(request: AuthorizeRequest): Promise<string> {
  const now = Date.now();
  await db.delete(oauth_codes).where(lt(oauth_codes.expires_at, new Date(now - DAY_MS)));
  const code = randomToken(CODE_PREFIX);
  await db.insert(oauth_codes).values({
    code_hash: hashToken(code), family_id: randomId("fam_"), client_id: request.clientId, redirect_uri: request.redirectUri,
    scope: request.scope.join(" "), resource: request.resource, code_challenge: request.codeChallenge,
    expires_at: new Date(now + CODE_TTL_MS),
  });
  return code;
}

async function revokeFamily(familyId: string) {
  await db.update(oauth_tokens).set({ revoked_at: new Date() }).where(and(eq(oauth_tokens.family_id, familyId), isNull(oauth_tokens.revoked_at)));
}

async function issue(familyId: string, clientId: string, scope: string, resource: string): Promise<TokenResponse> {
  const now = Date.now();
  const access = randomToken(ACCESS_PREFIX);
  const refresh = randomToken(REFRESH_PREFIX);
  await db.delete(oauth_tokens).where(lt(oauth_tokens.refresh_expires_at, new Date(now - DAY_MS)));
  await db.insert(oauth_tokens).values({
    family_id: familyId, client_id: clientId, access_hash: hashToken(access), refresh_hash: hashToken(refresh), scope, resource,
    access_expires_at: new Date(now + ACCESS_TTL_MS), refresh_expires_at: new Date(now + REFRESH_TTL_MS),
  });
  return { access_token: access, token_type: "Bearer", expires_in: ACCESS_TTL_MS / 1000, refresh_token: refresh, scope };
}

// The code is consumed atomically before any check, so a failed or replayed attempt burns it.
export async function exchangeCode(input: { code: string; clientId: string; redirectUri: string; verifier: string; resource: string | null }): Promise<TokenResponse | GrantError> {
  const invalid: GrantError = { error: "invalid_grant", description: "Invalid or expired authorization code." };
  const hash = hashToken(input.code);
  const [row] = await db.update(oauth_codes).set({ used_at: new Date() })
    .where(and(eq(oauth_codes.code_hash, hash), isNull(oauth_codes.used_at))).returning();
  if (!row) {
    const [replayed] = await db.select({ family_id: oauth_codes.family_id }).from(oauth_codes).where(eq(oauth_codes.code_hash, hash)).limit(1);
    if (replayed) await revokeFamily(replayed.family_id); // replay: invalidate anything issued from this code
    return invalid;
  }
  if (row.expires_at.getTime() < Date.now() || row.client_id !== input.clientId || row.redirect_uri !== input.redirectUri) return invalid;
  if (input.resource !== null && !isOwnResource(input.resource)) return { error: "invalid_target", description: "Unknown resource." };
  if (!verifyS256(input.verifier, row.code_challenge)) return invalid;
  return issue(row.family_id, row.client_id, row.scope, row.resource);
}

// Refresh tokens rotate on every use; presenting an already-rotated one revokes the whole family.
export async function refreshTokens(input: { refreshToken: string; clientId: string; scope: string[] | null; resource: string | null }): Promise<TokenResponse | GrantError> {
  const invalid: GrantError = { error: "invalid_grant", description: "Invalid or expired refresh token." };
  const hash = hashToken(input.refreshToken);
  const now = new Date();
  const [row] = await db.update(oauth_tokens).set({ refresh_used_at: now }).where(and(
    eq(oauth_tokens.refresh_hash, hash), eq(oauth_tokens.client_id, input.clientId),
    isNull(oauth_tokens.refresh_used_at), isNull(oauth_tokens.revoked_at), gt(oauth_tokens.refresh_expires_at, now),
  )).returning();
  if (!row) {
    const [old] = await db.select({ family_id: oauth_tokens.family_id, client_id: oauth_tokens.client_id }).from(oauth_tokens).where(eq(oauth_tokens.refresh_hash, hash)).limit(1);
    if (old && old.client_id === input.clientId) await revokeFamily(old.family_id);
    return invalid;
  }
  if (input.resource !== null && !isOwnResource(input.resource)) return { error: "invalid_target", description: "Unknown resource." };
  const granted = parseScope(row.scope);
  if (input.scope && !input.scope.every(s => granted.includes(s))) return { error: "invalid_scope", description: "Scope exceeds the original grant." };
  return issue(row.family_id, row.client_id, (input.scope?.length ? input.scope : granted).join(" "), row.resource);
}

// RFC 7009: unknown tokens are not an error; a token of another client is left alone.
export async function revokeToken(token: string, clientId: string | null) {
  const hash = hashToken(token);
  const [row] = await db.select({ family_id: oauth_tokens.family_id, client_id: oauth_tokens.client_id }).from(oauth_tokens)
    .where(or(eq(oauth_tokens.access_hash, hash), eq(oauth_tokens.refresh_hash, hash))).limit(1);
  if (row && (clientId === null || row.client_id === clientId)) await revokeFamily(row.family_id);
}

export async function authenticateAccessToken(token: string): Promise<{ scopes: string[] } | null> {
  if (!token.startsWith(ACCESS_PREFIX) || token.length > 200) return null;
  const [row] = await db.select({ scope: oauth_tokens.scope, resource: oauth_tokens.resource }).from(oauth_tokens).where(and(
    eq(oauth_tokens.access_hash, hashToken(token)), isNull(oauth_tokens.revoked_at), gt(oauth_tokens.access_expires_at, new Date()),
  )).limit(1);
  if (!row || !isOwnResource(row.resource)) return null;
  return { scopes: parseScope(row.scope) };
}
