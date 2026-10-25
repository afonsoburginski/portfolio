import { jsonResponse, oauthError, preflight, readForm } from "@/lib/oauth/http";
import { clientIp, createLimiter } from "@/lib/oauth/rate-limit";
import { exchangeCode, getClient, refreshTokens } from "@/lib/oauth/store";
import { normalizeScope, parseScope } from "@/lib/oauth/tokens";

export const runtime = "nodejs";
const allow = createLimiter(60, 60_000);

function clientIdFrom(request: Request, form: URLSearchParams): string | null {
  const basic = request.headers.get("authorization");
  if (basic?.startsWith("Basic ")) {
    try { return decodeURIComponent(Buffer.from(basic.slice(6), "base64").toString().split(":")[0]); } catch { return null; }
  }
  return form.get("client_id");
}

export async function POST(request: Request) {
  if (!allow(clientIp(request))) return oauthError("temporarily_unavailable", "Too many requests.", 429);
  const form = await readForm(request);
  if (!form) return oauthError("invalid_request", "Malformed or oversized body.");
  const clientId = clientIdFrom(request, form);
  if (!clientId || !(await getClient(clientId))) return oauthError("invalid_client", "Unknown client.", 401);

  const resource = form.get("resource");
  const grant = form.get("grant_type");
  let result;
  if (grant === "authorization_code") {
    const code = form.get("code"), redirectUri = form.get("redirect_uri"), verifier = form.get("code_verifier");
    if (!code || !redirectUri || !verifier) return oauthError("invalid_request", "code, redirect_uri and code_verifier are required.");
    result = await exchangeCode({ code, clientId, redirectUri, verifier, resource });
  } else if (grant === "refresh_token") {
    const refreshToken = form.get("refresh_token");
    if (!refreshToken) return oauthError("invalid_request", "refresh_token is required.");
    const requested = form.get("scope") ? normalizeScope(parseScope(form.get("scope"))) : null;
    if (form.get("scope") && !requested) return oauthError("invalid_scope", "Unsupported scope.");
    result = await refreshTokens({ refreshToken, clientId, scope: requested, resource });
  } else return oauthError("unsupported_grant_type", "Use authorization_code or refresh_token.");

  if ("error" in result) return oauthError(result.error, result.description);
  return jsonResponse(result);
}
export const OPTIONS = preflight;
