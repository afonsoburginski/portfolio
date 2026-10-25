// One-off, owner-only: store an existing LinkedIn access token encrypted, reading it from stdin.
//   printf '%s' "$TOKEN" | LINKEDIN_TOKEN_KEY=... DATABASE_URL=... node scripts/linkedin-import-token.mjs [expires_in_seconds]
// expires_in defaults to 5183999 (LinkedIn's 60 days). The token never touches argv, logs or disk.
import { createCipheriv, randomBytes } from "node:crypto";
import postgres from "postgres";

const key = Buffer.from(process.env.LINKEDIN_TOKEN_KEY ?? "", "base64");
if (key.length !== 32) throw new Error("LINKEDIN_TOKEN_KEY must be 32 bytes, base64-encoded.");
if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL.");
const expiresIn = Number(process.argv[2] ?? 5183999);
if (!Number.isInteger(expiresIn) || expiresIn <= 0) throw new Error("Invalid expires_in.");

let token = "";
for await (const chunk of process.stdin) token += chunk;
token = token.trim();
if (!token) throw new Error("Pipe the access token on stdin.");

// Same format as lib/linkedin/crypto.ts: v1.<iv>.<tag>.<ciphertext> (base64url, AES-256-GCM).
const iv = randomBytes(12);
const cipher = createCipheriv("aes-256-gcm", key, iv);
const data = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
const encrypted = ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");

const info = await fetch("https://api.linkedin.com/v2/userinfo", { headers: { Authorization: `Bearer ${token}` } });
if (!info.ok) throw new Error(`LinkedIn rejected the token (HTTP ${info.status}).`);
const { sub } = await info.json();
if (!sub) throw new Error("Userinfo returned no member id.");

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
try {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  await sql`insert into linkedin_tokens (member_sub, access_token_enc, expires_at, scopes)
    values (${sub}, ${encrypted}, ${expiresAt}, ${"openid profile email w_member_social"})
    on conflict (member_sub) do update set access_token_enc = excluded.access_token_enc,
      expires_at = excluded.expires_at, updated_at = now()`;
  console.log(`Token stored for member ${sub}, expires ${expiresAt.toISOString()}.`);
} finally { await sql.end(); }
