import { createHash, timingSafeEqual } from "node:crypto";

const VERIFIER = /^[A-Za-z0-9\-._~]{43,128}$/;
const CHALLENGE = /^[A-Za-z0-9_-]{43}$/;

export const isValidChallenge = (value: string) => CHALLENGE.test(value);

export function s256(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

// PKCE S256 only; `plain` is never accepted.
export function verifyS256(verifier: string, challenge: string): boolean {
  if (!VERIFIER.test(verifier) || !CHALLENGE.test(challenge)) return false;
  return timingSafeEqual(Buffer.from(s256(verifier)), Buffer.from(challenge));
}
