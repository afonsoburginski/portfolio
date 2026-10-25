import { isOwnResource, resourceUrl } from "./config";
import { isValidChallenge } from "./pkce";
import { redirectMatches } from "./redirect";
import { normalizeScope, parseScope } from "./tokens";

export type AuthorizeRequest = {
  clientId: string;
  redirectUri: string;
  scope: string[];
  codeChallenge: string;
  state: string | undefined;
  resource: string;
};

// `fatal` errors must never redirect (unknown client or redirect_uri); the others go back to the client.
export type AuthorizeResult =
  | { ok: true; request: AuthorizeRequest }
  | { ok: false; fatal: true; message: string }
  | { ok: false; fatal: false; redirectUri: string; state: string | undefined; error: string; description: string };

const MAX_STATE = 512;

export function validateAuthorizeRequest(
  params: URLSearchParams,
  client: { redirect_uris: readonly string[] } | null,
): AuthorizeResult {
  const clientId = params.get("client_id");
  const redirectUri = params.get("redirect_uri");
  if (!clientId || !client) return { ok: false, fatal: true, message: "Unknown client." };
  if (!redirectUri || !redirectMatches(client.redirect_uris, redirectUri)) return { ok: false, fatal: true, message: "Invalid redirect_uri." };

  const state = params.get("state") ?? undefined;
  const fail = (error: string, description: string): AuthorizeResult =>
    ({ ok: false, fatal: false, redirectUri, state, error, description });

  if (state !== undefined && state.length > MAX_STATE) return fail("invalid_request", "state is too long.");
  if (params.get("response_type") !== "code") return fail("unsupported_response_type", "Only response_type=code is supported.");
  const codeChallenge = params.get("code_challenge");
  if (!codeChallenge || !isValidChallenge(codeChallenge) || params.get("code_challenge_method") !== "S256")
    return fail("invalid_request", "PKCE with code_challenge_method=S256 is required.");
  const resource = params.get("resource");
  if (resource !== null && !isOwnResource(resource)) return fail("invalid_target", "Unknown resource.");
  const scope = normalizeScope(parseScope(params.get("scope")));
  if (!scope) return fail("invalid_scope", "Unsupported scope.");
  return { ok: true, request: { clientId, redirectUri, scope, codeChallenge, state, resource: resourceUrl() } };
}

export function redirectWithParams(redirectUri: string, values: Record<string, string | undefined>): string {
  const url = new URL(redirectUri);
  for (const [key, value] of Object.entries(values)) if (value !== undefined) url.searchParams.set(key, value);
  return url.toString();
}
