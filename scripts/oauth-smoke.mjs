// Pure-logic checks for the OAuth/LinkedIn helpers (no database, no network). Run with Bun, which imports .ts:
//   bun scripts/oauth-smoke.mjs
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { s256, verifyS256 } from "../lib/oauth/pkce.ts";
import { isAllowedRedirectUri, redirectMatches } from "../lib/oauth/redirect.ts";
import { validateAuthorizeRequest } from "../lib/oauth/authorize-request.ts";
import { hasScope, hashToken, normalizeScope, parseScope, randomToken } from "../lib/oauth/tokens.ts";
import { createLimiter } from "../lib/oauth/rate-limit.ts";
import { decrypt, encrypt, signState, verifyState } from "../lib/linkedin/crypto.ts";

// PKCE (RFC 7636 appendix B vector)
const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
assert.equal(s256(verifier), "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
assert.ok(verifyS256(verifier, s256(verifier)));
assert.ok(!verifyS256(verifier, s256(`${verifier}x`)));
assert.ok(!verifyS256("short", s256("short")), "short verifier rejected");
assert.ok(!verifyS256(verifier, verifier), "plain is not accepted");

// Redirect URI allowlist (registration)
for (const ok of ["https://chatgpt.com/connector/oauth/abc", "https://chat.openai.com/aip/g-1/oauth/callback", "https://platform.openai.com/x", "http://localhost:6274/cb", "http://127.0.0.1:1455/auth/callback"])
  assert.ok(isAllowedRedirectUri(ok), ok);
for (const bad of ["http://chatgpt.com/cb", "https://evilchatgpt.com/cb", "https://chatgpt.com.evil.com/cb", "https://evil.com/openai.com", "https://notopenai.com/x", "https://x.openai.com.evil.io/x",
  "https://u:p@chatgpt.com/cb", "https://chatgpt.com/cb#frag", "http://localhost.evil.com/cb", "javascript:alert(1)", "myapp://cb", "", 42])
  assert.ok(!isAllowedRedirectUri(bad), String(bad));
assert.ok(redirectMatches(["https://chatgpt.com/a"], "https://chatgpt.com/a"));
assert.ok(!redirectMatches(["https://chatgpt.com/a"], "https://chatgpt.com/a/"), "exact match only");
assert.ok(!redirectMatches(["https://chatgpt.com/a"], "https://chatgpt.com/a?x=1"));

// Authorization request validation
const client = { redirect_uris: ["https://chatgpt.com/connector/oauth/abc"] };
const good = () => new URLSearchParams({
  client_id: "cl_x", redirect_uri: client.redirect_uris[0], response_type: "code", code_challenge: s256(verifier),
  code_challenge_method: "S256", scope: "mcp:read mcp:write offline_access", state: "st", resource: "https://afonsodev.com/api/mcp",
});
let r = validateAuthorizeRequest(good(), client);
assert.ok(r.ok && r.request.scope.length === 3 && r.request.resource === "https://afonsodev.com/api/mcp");
assert.ok(validateAuthorizeRequest(good(), null).fatal, "unknown client is fatal");
let p = good(); p.set("redirect_uri", "https://chatgpt.com/connector/oauth/other");
assert.ok(validateAuthorizeRequest(p, client).fatal, "unregistered redirect_uri is fatal (never redirected to)");
p = good(); p.delete("code_challenge");
r = validateAuthorizeRequest(p, client); assert.ok(!r.ok && !r.fatal && r.error === "invalid_request", "PKCE is mandatory");
p = good(); p.set("code_challenge_method", "plain");
assert.equal(validateAuthorizeRequest(p, client).error, "invalid_request");
p = good(); p.set("response_type", "token");
assert.equal(validateAuthorizeRequest(p, client).error, "unsupported_response_type");
p = good(); p.set("resource", "https://evil.example/mcp");
assert.equal(validateAuthorizeRequest(p, client).error, "invalid_target");
p = good(); p.set("scope", "mcp:read admin");
assert.equal(validateAuthorizeRequest(p, client).error, "invalid_scope");
p = good(); p.delete("scope");
r = validateAuthorizeRequest(p, client); assert.deepEqual(r.request.scope, ["mcp:read", "mcp:write"]);

// Scopes and tokens
assert.deepEqual(parseScope(" a  b a "), ["a", "b"]);
assert.equal(normalizeScope(["nope"]), null);
assert.ok(hasScope(["mcp:write"], "mcp:read") && !hasScope(["mcp:read"], "mcp:write"));
const t = randomToken("pfa_");
assert.ok(t.length >= 4 + 43 && t !== randomToken("pfa_"), "256-bit tokens");
assert.match(hashToken(t), /^[0-9a-f]{64}$/);

// Rate limiter
const allow = createLimiter(2, 1000);
assert.ok(allow("ip", 0) && allow("ip", 1) && !allow("ip", 2) && allow("ip", 1001));

// LinkedIn crypto + state
const key = randomBytes(32);
const sealed = encrypt("secret-token", key);
assert.equal(decrypt(sealed, key), "secret-token");
assert.ok(!sealed.includes("secret-token"));
assert.notEqual(encrypt("secret-token", key), sealed, "fresh IV per message");
assert.throws(() => decrypt(sealed, randomBytes(32)), "wrong key fails");
const tampered = sealed.split("."); tampered[3] = Buffer.from("x").toString("base64url");
assert.throws(() => decrypt(tampered.join("."), key), "tamper detected");
const state = signState("user-1", key, 1000, 5000);
assert.ok(verifyState(state, "user-1", key, 2000));
assert.ok(!verifyState(state, "user-2", key, 2000), "bound to the user");
assert.ok(!verifyState(state, "user-1", key, 7000), "expires");
assert.ok(!verifyState(`${state}x`, "user-1", key, 2000) && !verifyState(state, "user-1", randomBytes(32), 2000), "signature checked");

console.log("oauth smoke passed");
