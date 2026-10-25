import { createHash, timingSafeEqual } from "node:crypto";
import { SCOPE_READ, SCOPE_WRITE } from "@/lib/oauth/config";
import { authenticateAccessToken } from "@/lib/oauth/store";

function bearer(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
}

function isStaticToken(supplied: string): boolean {
  const secret = process.env.PORTFOLIO_MCP_TOKEN;
  if (!secret) return false;
  const expectedHash = createHash("sha256").update(secret).digest();
  const suppliedHash = createHash("sha256").update(supplied).digest();
  return timingSafeEqual(expectedHash, suppliedHash);
}

// Constant-time check of the PORTFOLIO_MCP_TOKEN bearer; false when the secret is unset.
export function hasMcpBearer(request: Request): boolean {
  const supplied = bearer(request);
  return supplied !== null && isStaticToken(supplied);
}

// The static token is the owner's own credential (all scopes); OAuth access tokens carry their granted scopes.
export async function authenticateMcp(request: Request): Promise<{ scopes: string[] } | null> {
  const supplied = bearer(request);
  if (supplied === null) return null;
  if (isStaticToken(supplied)) return { scopes: [SCOPE_READ, SCOPE_WRITE] };
  return authenticateAccessToken(supplied);
}
