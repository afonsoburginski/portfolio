import { jsonResponse, preflight } from "@/lib/oauth/http";
import { SCOPE_READ, SCOPE_WRITE, baseUrl, resourceUrl } from "@/lib/oauth/config";

export const dynamic = "force-dynamic";

export function GET() {
  return jsonResponse({
    resource: resourceUrl(),
    authorization_servers: [baseUrl()],
    scopes_supported: [SCOPE_READ, SCOPE_WRITE],
    bearer_methods_supported: ["header"],
    resource_name: "afonsodev.com portfolio MCP",
  }, 200, { "Cache-Control": "public, max-age=300" });
}
export const OPTIONS = preflight;
