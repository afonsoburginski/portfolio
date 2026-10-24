import { createHash, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { projects } from "@/lib/schema";
import { deleteSocialPost, getSocialPosts, upsertSocialPost } from "@/lib/social-data";

export const runtime = "nodejs";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;
let windowStart = Date.now();
let requestCount = 0;

type Params = Record<string, unknown>;
type RpcId = string | number | null;
class ToolInputError extends Error {}

const tools = [
  { name: "social_post_record", description: "Record or update a published social post by URN or URL.", inputSchema: { type: "object", required: ["url", "body"], properties: {
    platform: { type: "string", enum: ["linkedin", "github", "x", "other"] }, kind: { type: "string", enum: ["post", "article", "link"] },
    url: { type: "string" }, urn: { type: "string" }, title: { type: "string" }, body: { type: "string" }, image: { type: "string" }, publishedAt: { type: "string", format: "date-time" },
  } } },
  { name: "social_post_list", description: "List recent recorded social posts.", inputSchema: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 100 } } } },
  { name: "social_post_delete", description: "Delete a recorded post by ID, URN, or URL.", inputSchema: { type: "object", properties: { id: { type: "string" }, urn: { type: "string" }, url: { type: "string" } } } },
  { name: "project_upsert", description: "Create or update a public portfolio project by slug.", inputSchema: { type: "object", required: ["slug", "title", "description", "category", "status"], properties: {
    slug: { type: "string" }, title: { type: "string" }, description: { type: "string" }, category: { type: "string", enum: ["web", "mobile", "desktop", "full_system", "other"] },
    status: { type: "string", enum: ["development", "production", "archived"] }, image: { type: "string" }, link: { type: "string" }, github: { type: "string" },
    tags: { type: "array", items: { type: "string" } }, techStack: { type: "array", items: { type: "string" } }, featured: { type: "boolean" }, sortOrder: { type: "integer" },
    subtitle: { type: "string" }, role: { type: "string" }, timeline: { type: "string" }, stack: { type: "string" }, story: { type: "string" },
    objectives: { type: "array", items: { type: "string" } }, highlights: { type: "array", items: { type: "string" } }, outcomes: { type: "array", items: { type: "string" } }, challenges: { type: "array", items: { type: "object", required: ["title", "detail"], properties: { title: { type: "string" }, detail: { type: "string" } } } }, sections: { type: "array", items: { type: "object" } },
  } } },
  { name: "project_list", description: "List portfolio project summaries.", inputSchema: { type: "object", properties: {} } },
] as const;

function object(value: unknown): Params {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ToolInputError("Expected an object.");
  return value as Params;
}
function string(value: unknown, name: string, required = true): string | undefined {
  if (value === undefined || value === null) {
    if (required) throw new ToolInputError(`${name} is required.`);
    return undefined;
  }
  if (typeof value !== "string" || (required && !value.trim()) || value.length > 20_000) throw new ToolInputError(`Invalid ${name}.`);
  return value;
}
function choice<T extends string>(value: unknown, name: string, allowed: readonly T[], fallback?: T): T {
  if (value === undefined && fallback) return fallback;
  if (typeof value !== "string" || !allowed.includes(value as T)) throw new ToolInputError(`Invalid ${name}.`);
  return value as T;
}
function httpsUrl(value: unknown, name: string, hostname?: string): string {
  const raw = string(value, name)!;
  let url: URL;
  try { url = new URL(raw); } catch { throw new ToolInputError(`Invalid ${name}.`); }
  if (url.protocol !== "https:" || url.username || url.password || (hostname && url.hostname !== hostname)) throw new ToolInputError(`Invalid ${name}.`);
  return url.toString();
}
function stringArray(value: unknown, name: string): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > 100 || value.some(v => typeof v !== "string" || v.length > 2_000)) throw new ToolInputError(`Invalid ${name}.`);
  return value;
}
function jsonStringArray(value: unknown, name: string): string | undefined {
  const items = stringArray(value, name);
  return items === undefined ? undefined : JSON.stringify(items);
}
function challenges(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > 100) throw new ToolInputError("Invalid challenges.");
  return JSON.stringify(value.map(challenge => {
    const item = object(challenge);
    return { title: string(item.title, "challenges.title"), detail: string(item.detail, "challenges.detail") };
  }));
}
function sections(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > 50) throw new ToolInputError("Invalid sections.");
  const cleaned = value.map(section => {
    const item = object(section);
    if (item.body === undefined) throw new ToolInputError("sections.body is required.");
    return {
      title: string(item.title, "sections.title"),
      body: stringArray(item.body, "sections.body") ?? [],
      image: optional(item.image, "sections.image", (v) => httpsUrl(v, "sections.image", "cdn.afonsodev.com")),
      video: optional(item.video, "sections.video", httpsUrl),
      subsections: stringArray(item.subsections, "sections.subsections"),
    };
  });
  const serialized = JSON.stringify(cleaned);
  if (serialized.length > 100_000) throw new ToolInputError("Sections are too large.");
  return serialized;
}
function optional<T>(value: unknown, name: string, check: (value: unknown, name: string) => T): T | undefined {
  return value === undefined ? undefined : check(value, name);
}
function boolean(value: unknown, name: string): boolean {
  if (typeof value !== "boolean") throw new ToolInputError(`Invalid ${name}.`);
  return value;
}
function integer(value: unknown, name: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) throw new ToolInputError(`Invalid ${name}.`);
  return value;
}

async function publicGithubRepo(raw: unknown) {
  const github = httpsUrl(raw, "github", "github.com");
  const parts = new URL(github).pathname.split("/").filter(Boolean);
  if (parts.length !== 2 || !parts.every(part => /^[a-zA-Z0-9_.-]+$/.test(part))) throw new ToolInputError("github must be a public repository URL.");
  let response: Response;
  try {
    response = await fetch(`https://api.github.com/repos/${parts[0]}/${parts[1]}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "portfolio-mcp" },
      signal: AbortSignal.timeout(5_000), cache: "no-store",
    });
  } catch { throw new ToolInputError("Could not verify GitHub repository visibility."); }
  if (!response.ok) throw new ToolInputError("github must point to a public repository.");
  const repository = await response.json() as { private?: boolean; visibility?: string };
  if (repository.private !== false || repository.visibility !== "public") throw new ToolInputError("github must point to a public repository.");
  return github;
}

async function callTool(name: string, args: Params) {
  switch (name) {
    case "social_post_record": {
      const date = optional(args.publishedAt, "publishedAt", string) ?? new Date().toISOString();
      if (!Number.isFinite(Date.parse(date))) throw new ToolInputError("Invalid publishedAt.");
      const platform = choice(args.platform, "platform", ["linkedin", "github", "x", "other"], "linkedin");
      const url = httpsUrl(args.url, "url");
      if (platform === "linkedin" && !["linkedin.com", "www.linkedin.com"].includes(new URL(url).hostname)) throw new ToolInputError("LinkedIn posts require a LinkedIn URL.");
      const row = await upsertSocialPost({
        platform,
        kind: choice(args.kind, "kind", ["post", "article", "link"], "post"),
        url, urn: optional(args.urn, "urn", string),
        title: optional(args.title, "title", string), body: string(args.body, "body")!,
        image: optional(args.image, "image", httpsUrl), published_at: new Date(date).toISOString(),
      });
      return { id: row.id, url: row.url, urn: row.urn };
    }
    case "social_post_list": {
      const limit = args.limit === undefined ? 20 : integer(args.limit, "limit");
      if (limit < 1 || limit > 100) throw new ToolInputError("limit must be between 1 and 100.");
      return getSocialPosts(limit);
    }
    case "social_post_delete": {
      const id = optional(args.id, "id", string);
      const urn = optional(args.urn, "urn", string);
      const url = optional(args.url, "url", httpsUrl);
      if ([id, urn, url].filter(Boolean).length !== 1) throw new ToolInputError("Provide exactly one of id, urn, or url.");
      return { deleted: Boolean(await deleteSocialPost({ id, urn, url })) };
    }
    case "project_upsert": {
      const slug = string(args.slug, "slug")!;
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) throw new ToolInputError("Invalid slug.");
      const github = args.github === undefined ? undefined : await publicGithubRepo(args.github);
      const link = optional(args.link, "link", httpsUrl);
      const values = {
        slug, title: string(args.title, "title")!, description: string(args.description, "description")!,
        category: choice(args.category, "category", ["web", "mobile", "desktop", "full_system", "other"]),
        status: choice(args.status, "status", ["development", "production", "archived"]),
        image: optional(args.image, "image", (v) => httpsUrl(v, "image", "cdn.afonsodev.com")),
        link, live_url: link, github, github_url: github,
        tags: jsonStringArray(args.tags, "tags"), tech_stack: jsonStringArray(args.techStack, "techStack"),
        featured: optional(args.featured, "featured", boolean), sort_order: optional(args.sortOrder, "sortOrder", integer),
        subtitle: optional(args.subtitle, "subtitle", string), role: optional(args.role, "role", string),
        timeline: optional(args.timeline, "timeline", string), stack: optional(args.stack, "stack", string),
        story: optional(args.story, "story", string),
        objectives: jsonStringArray(args.objectives, "objectives"), highlights: jsonStringArray(args.highlights, "highlights"),
        outcomes: jsonStringArray(args.outcomes, "outcomes"), challenges: challenges(args.challenges),
        sections: sections(args.sections), updated_at: new Date().toISOString(),
      };
      const updates = Object.fromEntries(Object.entries(values).filter(([key, value]) => key !== "slug" && value !== undefined));
      const [row] = await db.insert(projects).values(values).onConflictDoUpdate({ target: projects.slug, set: updates }).returning({ slug: projects.slug });
      return row;
    }
    case "project_list":
      return db.select({ slug: projects.slug, title: projects.title, status: projects.status, featured: projects.featured, image: projects.image }).from(projects);
    default: throw new ToolInputError("Unknown tool.");
  }
}

function rpc(id: RpcId, result?: unknown, error?: { code: number; message: string }) {
  return Response.json({ jsonrpc: "2.0", id, ...(error ? { error } : { result }) }, { headers: { "Cache-Control": "no-store" } });
}
function unauthorized() { return new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } }); }

export async function POST(request: Request) {
  const secret = process.env.PORTFOLIO_MCP_TOKEN;
  const authorization = request.headers.get("authorization");
  if (!secret || !authorization?.startsWith("Bearer ")) return unauthorized();
  const supplied = authorization.slice(7);
  const expectedHash = createHash("sha256").update(secret).digest();
  const suppliedHash = createHash("sha256").update(supplied).digest();
  if (!timingSafeEqual(expectedHash, suppliedHash)) return unauthorized();

  const now = Date.now();
  if (now - windowStart >= WINDOW_MS) { windowStart = now; requestCount = 0; }
  if (++requestCount > MAX_REQUESTS) return new Response("Too Many Requests", { status: 429 });
  let payload: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 128_000) return new Response("Payload Too Large", { status: 413 });
    payload = JSON.parse(raw);
  } catch { return rpc(null, undefined, { code: -32700, message: "Parse error" }); }
  let message: Params;
  try { message = object(payload); } catch { return rpc(null, undefined, { code: -32600, message: "Invalid Request" }); }
  const id = typeof message.id === "string" || typeof message.id === "number" || message.id === null ? message.id as RpcId : null;
  if (message.jsonrpc !== "2.0" || typeof message.method !== "string" || (message.id !== undefined && id === null && message.id !== null))
    return rpc(id, undefined, { code: -32600, message: "Invalid Request" });
  if (message.method === "notifications/initialized") return new Response(null, { status: 202 });
  if (message.id === undefined) return new Response(null, { status: 202 });
  switch (message.method) {
    case "initialize": return rpc(id, { protocolVersion: "2025-06-18", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "afonsodev-portfolio", version: "1.0.0" } });
    case "ping": return rpc(id, {});
    case "tools/list": return rpc(id, { tools });
    case "tools/call": {
      let params: Params;
      try { params = object(message.params); } catch { return rpc(id, undefined, { code: -32602, message: "Invalid params" }); }
      if (typeof params.name !== "string" || !tools.some(tool => tool.name === params.name)) return rpc(id, undefined, { code: -32602, message: "Unknown tool" });
      try {
        const value = await callTool(params.name, params.arguments === undefined ? {} : object(params.arguments));
        return rpc(id, { content: [{ type: "text", text: JSON.stringify(value) }], structuredContent: { result: value } });
      } catch (error) {
        const message = error instanceof ToolInputError ? error.message : "Tool failed.";
        return rpc(id, { isError: true, content: [{ type: "text", text: message }] });
      }
    }
    default: return rpc(id, undefined, { code: -32601, message: "Method not found" });
  }
}

export function GET() { return new Response(null, { status: 405, headers: { Allow: "POST" } }); }
export function DELETE() { return new Response(null, { status: 405, headers: { Allow: "POST" } }); }
