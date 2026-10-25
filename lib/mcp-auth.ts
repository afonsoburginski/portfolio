import { createHash, timingSafeEqual } from "node:crypto";

// Constant-time check of the PORTFOLIO_MCP_TOKEN bearer; false when the secret is unset.
export function hasMcpBearer(request: Request): boolean {
  const secret = process.env.PORTFOLIO_MCP_TOKEN;
  const authorization = request.headers.get("authorization");
  if (!secret || !authorization?.startsWith("Bearer ")) return false;
  const expectedHash = createHash("sha256").update(secret).digest();
  const suppliedHash = createHash("sha256").update(authorization.slice(7)).digest();
  return timingSafeEqual(expectedHash, suppliedHash);
}
