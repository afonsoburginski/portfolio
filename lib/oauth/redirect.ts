const MAX_URI = 2048;

// Registration-time allowlist: ChatGPT/OpenAI callbacks over https, loopback over http.
export function isAllowedRedirectUri(raw: unknown): raw is string {
  if (typeof raw !== "string" || raw.length > MAX_URI) return false;
  let url: URL;
  try { url = new URL(raw); } catch { return false; }
  if (url.username || url.password || url.hash) return false;
  const host = url.hostname.toLowerCase();
  if (url.protocol === "https:") {
    return host === "chatgpt.com" || host === "openai.com" || host.endsWith(".openai.com");
  }
  if (url.protocol === "http:") return host === "localhost" || host === "127.0.0.1";
  return false;
}

// Authorization-time check: exact string match against what the client registered.
export const redirectMatches = (registered: readonly string[], supplied: string) => registered.includes(supplied);
