import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { linkedin_tokens } from "@/lib/schema";
import { baseUrl } from "@/lib/oauth/config";
import { decrypt, encrypt } from "./crypto";

const API = "https://api.linkedin.com";
export const LINKEDIN_SCOPES = "openid profile email w_member_social";
export const linkedinRedirectUri = () => `${baseUrl()}/api/linkedin/callback`;
export class LinkedinError extends Error {}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];

// LinkedIn versions are monthly (YYYYMM); override if the current month is not live yet.
const apiVersion = () => process.env.LINKEDIN_API_VERSION ?? new Date().toISOString().slice(0, 7).replace("-", "");
const restHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`, "LinkedIn-Version": apiVersion(), "X-Restli-Protocol-Version": "2.0.0", "Content-Type": "application/json",
});

export async function saveToken(input: { sub: string; accessToken: string; expiresAt: Date; scopes: string }) {
  const values = { access_token_enc: encrypt(input.accessToken), expires_at: input.expiresAt, scopes: input.scopes, updated_at: new Date() };
  await db.insert(linkedin_tokens).values({ member_sub: input.sub, ...values }).onConflictDoUpdate({ target: linkedin_tokens.member_sub, set: values });
}

async function currentRow() {
  const [row] = await db.select().from(linkedin_tokens).orderBy(desc(linkedin_tokens.updated_at)).limit(1);
  return row ?? null;
}

// Never exposes the token itself.
export async function linkedinStatus() {
  const row = await currentRow();
  if (!row) return { authenticated: false };
  const expired = row.expires_at.getTime() <= Date.now();
  return { authenticated: !expired, expired, expiresAt: row.expires_at.toISOString(), scopes: row.scopes.split(" ") };
}

async function session() {
  const row = await currentRow();
  if (!row) throw new LinkedinError("LinkedIn is not connected. The owner must open /api/linkedin/connect.");
  if (row.expires_at.getTime() <= Date.now()) throw new LinkedinError("LinkedIn token expired. The owner must reconnect at /api/linkedin/connect.");
  return { token: decrypt(row.access_token_enc), author: `urn:li:person:${row.member_sub}`, sub: row.member_sub };
}

async function failure(response: Response, what: string): Promise<never> {
  // Status only: LinkedIn error bodies can echo request data, so they are not surfaced.
  throw new LinkedinError(`${what} failed (LinkedIn HTTP ${response.status}).`);
}

async function fetchImage(url: string): Promise<{ data: Buffer; type: string }> {
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(15_000), cache: "no-store" });
  if (!response.ok) throw new LinkedinError("Could not download imageUrl.");
  const type = (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!IMAGE_TYPES.includes(type)) throw new LinkedinError("imageUrl must be a PNG, JPEG or GIF.");
  const data = Buffer.from(await response.arrayBuffer());
  if (data.length > MAX_IMAGE_BYTES) throw new LinkedinError("imageUrl is larger than 8 MB.");
  return { data, type };
}

async function uploadImage(token: string, owner: string, url: string): Promise<string> {
  const image = await fetchImage(url);
  const init = await fetch(`${API}/rest/images?action=initializeUpload`, {
    method: "POST", headers: restHeaders(token), body: JSON.stringify({ initializeUploadRequest: { owner } }), signal: AbortSignal.timeout(15_000),
  });
  if (!init.ok) return failure(init, "Image upload init");
  const { value } = await init.json() as { value?: { uploadUrl?: string; image?: string } };
  if (!value?.uploadUrl || !value.image) throw new LinkedinError("Image upload init returned no upload URL.");
  const put = await fetch(value.uploadUrl, {
    method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": image.type }, body: new Uint8Array(image.data), signal: AbortSignal.timeout(30_000),
  });
  if (!put.ok) return failure(put, "Image upload");
  return value.image;
}

export type CreatePostInput = {
  text: string; visibility: "PUBLIC" | "CONNECTIONS" | "LOGGED_IN";
  articleUrl?: string; articleTitle?: string; articleDescription?: string; imageUrl?: string;
};

export async function createPost(input: CreatePostInput): Promise<{ urn: string; url: string }> {
  const { token, author } = await session();
  const imageUrn = input.imageUrl ? await uploadImage(token, author, input.imageUrl) : undefined;
  const body: Record<string, unknown> = {
    author, commentary: input.text, visibility: input.visibility,
    distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
    lifecycleState: "PUBLISHED", isReshareDisabledByAuthor: false,
  };
  if (input.articleUrl) {
    body.content = { article: { source: input.articleUrl, title: input.articleTitle, description: input.articleDescription, ...(imageUrn ? { thumbnail: imageUrn } : {}) } };
  } else if (imageUrn) body.content = { media: { id: imageUrn } };
  const response = await fetch(`${API}/rest/posts`, { method: "POST", headers: restHeaders(token), body: JSON.stringify(body), signal: AbortSignal.timeout(20_000) });
  if (!response.ok) return failure(response, "Post creation");
  const urn = response.headers.get("x-restli-id");
  if (!urn) throw new LinkedinError("LinkedIn accepted the post but returned no URN; check LinkedIn manually before retrying.");
  return { urn, url: `https://www.linkedin.com/feed/update/${urn}/` };
}

export async function deletePost(urn: string): Promise<void> {
  const { token } = await session();
  const response = await fetch(`${API}/rest/posts/${encodeURIComponent(urn)}`, { method: "DELETE", headers: restHeaders(token), signal: AbortSignal.timeout(15_000) });
  if (!response.ok && response.status !== 404) await failure(response, "Post deletion");
}

export async function exchangeCode(code: string): Promise<{ accessToken: string; expiresIn: number; scope: string }> {
  const id = process.env.LINKEDIN_CLIENT_ID, secret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!id || !secret) throw new LinkedinError("LinkedIn app credentials are not configured.");
  const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, signal: AbortSignal.timeout(15_000),
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: linkedinRedirectUri(), client_id: id, client_secret: secret }),
  });
  if (!response.ok) return failure(response, "Token exchange");
  const data = await response.json() as { access_token?: string; expires_in?: number; scope?: string };
  if (!data.access_token || !data.expires_in) throw new LinkedinError("Token exchange returned no token.");
  return { accessToken: data.access_token, expiresIn: data.expires_in, scope: (data.scope ?? LINKEDIN_SCOPES).replace(/,/g, " ") };
}

export async function fetchMemberSub(accessToken: string): Promise<string> {
  const response = await fetch(`${API}/v2/userinfo`, { headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) return failure(response, "Userinfo");
  const { sub } = await response.json() as { sub?: string };
  if (!sub) throw new LinkedinError("Userinfo returned no member id.");
  return sub;
}
