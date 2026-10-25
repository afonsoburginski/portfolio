import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// LINKEDIN_TOKEN_KEY: 32 random bytes, base64 (`openssl rand -base64 32`).
export function loadKey(raw = process.env.LINKEDIN_TOKEN_KEY): Buffer {
  const key = raw ? Buffer.from(raw, "base64") : Buffer.alloc(0);
  if (key.length !== 32) throw new Error("LINKEDIN_TOKEN_KEY must be 32 bytes, base64-encoded.");
  return key;
}

// Format: v1.<iv>.<tag>.<ciphertext>, each base64url. AES-256-GCM with a fresh 96-bit IV.
export function encrypt(plaintext: string, key = loadKey()): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}

export function decrypt(payload: string, key = loadKey()): string {
  const [version, iv, tag, data] = payload.split(".");
  if (version !== "v1" || !iv || !tag || !data) throw new Error("Unsupported ciphertext.");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
}

// Signed, expiring `state` for the LinkedIn authorization redirect, bound to the owner's user id.
const stateKey = (key: Buffer) => createHmac("sha256", key).update("linkedin-oauth-state-v1").digest();

export function signState(userId: string, key = loadKey(), now = Date.now(), ttlMs = 10 * 60 * 1000): string {
  const payload = Buffer.from(JSON.stringify({ u: userId, n: randomBytes(12).toString("base64url"), e: now + ttlMs })).toString("base64url");
  const sig = createHmac("sha256", stateKey(key)).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyState(state: string, userId: string, key = loadKey(), now = Date.now()): boolean {
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", stateKey(key)).update(payload).digest();
  const supplied = Buffer.from(sig, "base64url");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { u?: string; e?: number };
    return data.u === userId && typeof data.e === "number" && data.e > now;
  } catch { return false; }
}
