export const SCOPE_READ = "mcp:read";
export const SCOPE_WRITE = "mcp:write";
export const SCOPE_OFFLINE = "offline_access";
export const SUPPORTED_SCOPES = [SCOPE_READ, SCOPE_WRITE, SCOPE_OFFLINE] as const;

export const ACCESS_TTL_MS = 60 * 60 * 1000;
export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const CODE_TTL_MS = 5 * 60 * 1000;

// OAUTH_ISSUER only exists so a local dev server can advertise itself; production uses the default.
export function baseUrl(): string {
  return (process.env.OAUTH_ISSUER ?? "https://afonsodev.com").replace(/\/+$/, "");
}
export const resourceUrl = () => `${baseUrl()}/api/mcp`;
export const resourceMetadataUrl = () => `${baseUrl()}/.well-known/oauth-protected-resource`;

// Accept the resource with or without a trailing slash; clients differ.
export function isOwnResource(value: string): boolean {
  return value.replace(/\/+$/, "") === resourceUrl();
}
