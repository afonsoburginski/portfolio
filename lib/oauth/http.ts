export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, MCP-Protocol-Version",
  "Access-Control-Max-Age": "600",
};
const NO_STORE = { "Cache-Control": "no-store", Pragma: "no-cache" };

export function jsonResponse(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { ...CORS, ...NO_STORE, ...extra } });
}
export function oauthError(error: string, description: string, status = 400, extra: Record<string, string> = {}) {
  return jsonResponse({ error, error_description: description }, status, extra);
}
export const preflight = () => new Response(null, { status: 204, headers: CORS });

// Reads a size-capped form body; null when it is too large or malformed.
export async function readForm(request: Request, maxBytes = 8_192): Promise<URLSearchParams | null> {
  const raw = await request.text();
  if (raw.length > maxBytes) return null;
  return new URLSearchParams(raw);
}
