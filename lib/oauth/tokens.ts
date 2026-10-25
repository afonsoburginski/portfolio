import { createHash, randomBytes } from "node:crypto";
import { SCOPE_READ, SCOPE_WRITE, SUPPORTED_SCOPES } from "./config";

// 32 random bytes = 256 bits of entropy; the prefix only helps secret scanners and routing.
export const randomToken = (prefix: string) => `${prefix}${randomBytes(32).toString("base64url")}`;
export const randomId = (prefix: string) => `${prefix}${randomBytes(16).toString("base64url")}`;
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const ACCESS_PREFIX = "pfa_";
export const REFRESH_PREFIX = "pfr_";
export const CODE_PREFIX = "pfc_";

export function parseScope(value: string | null | undefined): string[] {
  return [...new Set((value ?? "").split(/\s+/).filter(Boolean))];
}

// Returns null when an unknown scope is requested; an empty request gets read+write.
export function normalizeScope(requested: string[]): string[] | null {
  if (requested.some(s => !(SUPPORTED_SCOPES as readonly string[]).includes(s))) return null;
  return requested.length ? requested : [SCOPE_READ, SCOPE_WRITE];
}

// mcp:write implies mcp:read.
export function hasScope(granted: readonly string[], needed: string): boolean {
  return granted.includes(needed) || (needed === SCOPE_READ && granted.includes(SCOPE_WRITE));
}
