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
assert((await request("tools/list", {}, "")).status === 401, "Missing token was accepted");
const listResponse = await request("tools/list", {});
assert(listResponse.ok, "tools/list failed");
const list = await listResponse.json();
assert(list.result?.tools?.some(tool => tool.name === "social_post_record"), "social_post_record is missing");

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
