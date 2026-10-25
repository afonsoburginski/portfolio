import { jsonResponse, oauthError, preflight, readForm } from "@/lib/oauth/http";
import { clientIp, createLimiter } from "@/lib/oauth/rate-limit";
import { revokeToken } from "@/lib/oauth/store";

export const runtime = "nodejs";
const allow = createLimiter(60, 60_000);

export async function POST(request: Request) {
  if (!allow(clientIp(request))) return oauthError("temporarily_unavailable", "Too many requests.", 429);
  const form = await readForm(request);
  const token = form?.get("token");
  if (!form || !token || token.length > 200) return oauthError("invalid_request", "token is required.");
  await revokeToken(token, form.get("client_id"));
  return jsonResponse({});
}
export const OPTIONS = preflight;
