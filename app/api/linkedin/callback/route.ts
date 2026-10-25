import { exchangeCode, fetchMemberSub, saveToken } from "@/lib/linkedin/client";
import { verifyState } from "@/lib/linkedin/crypto";
import { getOwnerState } from "@/lib/owner";

export const runtime = "nodejs";

const page = (title: string, message: string, status = 200) => new Response(
  `<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>${title}</title>` +
  `<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#05070d;color:#fff;font:16px system-ui">` +
  `<main style="max-width:28rem;padding:2rem;border:1px solid #ffffff1a;border-radius:1.5rem;background:#ffffff0f">` +
  `<h1 style="margin:0 0 .5rem;font-size:1.25rem;color:#2dd4bf">${title}</h1><p style="margin:0;color:#ffffffb3">${message}</p></main>`,
  { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } },
);

export async function GET(request: Request) {
  const owner = await getOwnerState(request.headers);
  if (owner.state !== "owner") return page("Not allowed", "Sign in as the site owner first.", 403);
  const params = new URL(request.url).searchParams;
  const state = params.get("state"), code = params.get("code");
  if (!state || !verifyState(state, owner.userId)) return page("Invalid request", "The state is invalid or expired. Start again.", 400);
  if (!code) return page("LinkedIn refused", "Authorization was not granted.", 400);
  try {
    const token = await exchangeCode(code);
    const sub = await fetchMemberSub(token.accessToken);
    await saveToken({ sub, accessToken: token.accessToken, expiresAt: new Date(Date.now() + token.expiresIn * 1000), scopes: token.scope });
  } catch (error) {
    console.error("[linkedin] connect failed:", error instanceof Error ? error.message : "unknown error");
    return page("Connection failed", "Could not store the LinkedIn token. Check the server logs.", 502);
  }
  return page("LinkedIn conectado", "You can close this tab and post from the MCP.");
}
