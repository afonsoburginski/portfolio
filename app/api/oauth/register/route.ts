import { jsonResponse, oauthError, preflight } from "@/lib/oauth/http";
import { createLimiter, clientIp } from "@/lib/oauth/rate-limit";
import { isAllowedRedirectUri } from "@/lib/oauth/redirect";
import { SCOPE_READ, SCOPE_WRITE } from "@/lib/oauth/config";
import { registerClient } from "@/lib/oauth/store";

export const runtime = "nodejs";
const allow = createLimiter(10, 60 * 60 * 1000);

// Dynamic Client Registration (RFC 7591). Public clients only, redirect URIs from a fixed allowlist.
export async function POST(request: Request) {
  if (!allow(clientIp(request))) return oauthError("temporarily_unavailable", "Too many registrations.", 429);
  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 8_192) return oauthError("invalid_client_metadata", "Payload too large.", 413);
    body = JSON.parse(raw);
  } catch { return oauthError("invalid_client_metadata", "Invalid JSON."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return oauthError("invalid_client_metadata", "Expected an object.");
  const meta = body as Record<string, unknown>;

  const uris = meta.redirect_uris;
  if (!Array.isArray(uris) || uris.length < 1 || uris.length > 10 || !uris.every(isAllowedRedirectUri))
    return oauthError("invalid_redirect_uri", "redirect_uris must be 1-10 allowed ChatGPT/OpenAI https or localhost URIs.");
  const rawName = typeof meta.client_name === "string" ? meta.client_name : "";
  const name = rawName.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 100) || "Unnamed client";

  const clientId = await registerClient(name, [...new Set(uris)]);
  if (!clientId) return oauthError("temporarily_unavailable", "Client registry is full.", 503);
  return jsonResponse({
    client_id: clientId,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    client_name: name,
    redirect_uris: [...new Set(uris)],
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
    scope: `${SCOPE_READ} ${SCOPE_WRITE}`,
  }, 201);
}
export const OPTIONS = preflight;
