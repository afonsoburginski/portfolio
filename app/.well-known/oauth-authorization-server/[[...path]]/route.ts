import { jsonResponse, preflight } from "@/lib/oauth/http";
import { SUPPORTED_SCOPES, baseUrl } from "@/lib/oauth/config";

export const dynamic = "force-dynamic";

export function GET() {
  const base = baseUrl();
  return jsonResponse({
    issuer: base,
    authorization_endpoint: `${base}/api/oauth/authorize`,
    token_endpoint: `${base}/api/oauth/token`,
    registration_endpoint: `${base}/api/oauth/register`,
    revocation_endpoint: `${base}/api/oauth/revoke`,
    scopes_supported: [...SUPPORTED_SCOPES],
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none"],
    revocation_endpoint_auth_methods_supported: ["none"],
    code_challenge_methods_supported: ["S256"],
    authorization_response_iss_parameter_supported: true,
    client_id_metadata_document_supported: false,
  }, 200, { "Cache-Control": "public, max-age=300" });
}
export const OPTIONS = preflight;
