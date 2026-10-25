// Run only against a local dev server with the 0003 migration applied.
const endpoint = process.env.MCP_SMOKE_URL ?? "http://localhost:3000/api/mcp";
const token = process.env.PORTFOLIO_MCP_TOKEN;
const url = new URL(endpoint);
if (!["localhost", "127.0.0.1", "::1"].includes(url.hostname)) throw new Error("Smoke test only accepts a local endpoint.");
if (!token) throw new Error("Set PORTFOLIO_MCP_TOKEN.");

async function request(method, params, authorization = `Bearer ${token}`) {
  return fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authorization },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
}
function assert(condition, message) { if (!condition) throw new Error(message); }
async function tool(name, args) {
  const response = await request("tools/call", { name, arguments: args });
  assert(response.ok, `${name}: HTTP ${response.status}`);
  const payload = await response.json();
  assert(!payload.error && !payload.result?.isError, `${name}: ${JSON.stringify(payload)}`);
  return JSON.parse(payload.result.content[0].text);
}

assert((await request("tools/list", {}, "Bearer wrong-token")).status === 401, "Wrong token was accepted");
const missing = await request("tools/list", {}, "");
assert(missing.status === 401, "Missing token was accepted");
assert(/^Bearer resource_metadata="[^"]*\/\.well-known\/oauth-protected-resource"/.test(missing.headers.get("www-authenticate") ?? ""), "401 lacks the resource_metadata challenge");
assert((await request("tools/list", {}, "Bearer pfa_not-a-real-token")).status === 401, "Fake OAuth token was accepted");

const origin = url.origin;
const resourceMeta = await (await fetch(`${origin}/.well-known/oauth-protected-resource`)).json();
assert(resourceMeta.resource?.endsWith("/api/mcp") && resourceMeta.authorization_servers?.length, "Protected resource metadata is wrong");
const serverMeta = await (await fetch(`${origin}/.well-known/oauth-authorization-server`)).json();
assert(serverMeta.code_challenge_methods_supported?.join() === "S256" && serverMeta.registration_endpoint && serverMeta.scopes_supported?.includes("offline_access"), "Authorization server metadata is wrong");
const badRegistration = await fetch(`${origin}/api/oauth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ redirect_uris: ["https://evil.example/cb"] }) });
assert(badRegistration.status === 400, "Registration accepted a disallowed redirect URI");
const listResponse = await request("tools/list", {});
assert(listResponse.ok, "tools/list failed");
const list = await listResponse.json();
assert(list.result?.tools?.some(tool => tool.name === "social_post_record"), "social_post_record is missing");
for (const name of ["article_upsert", "article_list", "article_get", "article_publish", "article_export_linkedin", "linkedin_status", "linkedin_create_post", "linkedin_delete_post", "linkedin_list_my_posts"])
  assert(list.result.tools.some(tool => tool.name === name), `${name} is missing`);

// Publishing actions must be refused without confirm: true, before any LinkedIn call.
const unconfirmed = await (await request("tools/call", { name: "linkedin_create_post", arguments: { text: "smoke" } })).json();
assert(unconfirmed.result?.isError && /confirm/.test(unconfirmed.result.content[0].text), "linkedin_create_post ran without confirm");
const unconfirmedPublish = await (await request("tools/call", { name: "article_publish", arguments: { slug: "smoke" } })).json();
assert(unconfirmedPublish.result?.isError && /confirm/.test(unconfirmedPublish.result.content[0].text), "article_publish ran without confirm");

const postUrl = `https://www.linkedin.com/feed/update/smoke-${crypto.randomUUID()}/`;
try {
  const recorded = await tool("social_post_record", { url: postUrl, body: "Local MCP smoke test", publishedAt: new Date().toISOString() });
  assert(recorded.url === postUrl, "Record returned the wrong URL");
  const posts = await tool("social_post_list", { limit: 100 });
  assert(posts.some(post => post.url === postUrl), "Recorded post was not listed");
  console.log("MCP smoke passed: auth, tools/list, record, list");
} finally {
  await tool("social_post_delete", { url: postUrl });
}
