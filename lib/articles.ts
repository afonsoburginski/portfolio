import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { articles, type ArticleRow } from "./schema";

export type ArticleStatus = ArticleRow["status"];

export type Article = {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  date: string;
  body: string;
  readingMinutes: number;
  tags: string[];
  status: ArticleStatus;
  linkedinUrl: string | null;
  coverImage: string | null;
};

export type ArticleInput = {
  slug: string;
  title: string;
  subtitle?: string | null;
  description: string;
  body: string;
  tags?: string[];
  status?: ArticleStatus;
  publishedAt?: string | null;
  linkedinUrl?: string | null;
  coverImage?: string | null;
};

type ReadOptions = { preview?: boolean };

const DIR = path.join(process.cwd(), "content", "articles");
const SLUG = /^[a-z0-9-]+$/;

function readingMinutes(body: string): number {
  return Math.max(1, Math.round(body.trim().split(/\s+/).length / 220));
}

function parseFile(slug: string, raw: string): Article {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta: Record<string, string> = {};
  const body = (match ? match[2] : raw).trim();
  if (match) {
    for (const line of match[1].split("\n")) {
      const i = line.indexOf(":");
      if (i === -1) continue;
      meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"|"$/g, "");
    }
  }
  return {
    slug,
    title: meta.title ?? slug,
    subtitle: meta.subtitle ?? null,
    description: meta.description ?? "",
    date: meta.date ?? "",
    body,
    readingMinutes: readingMinutes(body),
    tags: [],
    status: "published",
    linkedinUrl: null,
    coverImage: null,
  };
}

function parseTags(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function fromRow(row: ArticleRow): Article {
  return {
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    date: row.published_at ?? row.created_at,
    body: row.body.trim(),
    readingMinutes: readingMinutes(row.body),
    tags: parseTags(row.tags),
    status: row.status,
    linkedinUrl: row.linkedin_url,
    coverImage: row.cover_image,
  };
}

async function readFileArticle(slug: string): Promise<Article | null> {
  try {
    return parseFile(slug, await readFile(path.join(DIR, `${slug}.md`), "utf8"));
  } catch {
    return null;
  }
}

async function listFileArticles(): Promise<Article[]> {
  const files = (await readdir(DIR).catch(() => [])).filter((f) => f.endsWith(".md"));
  const all = await Promise.all(files.map((f) => readFileArticle(f.replace(/\.md$/, ""))));
  return all.filter((a): a is Article => a !== null);
}

// The database is the source of truth; files in content/articles are only a
// read fallback for slugs the database does not have (e.g. before seeding).
// Public reads swallow database errors so the site keeps serving the files.
export async function getArticle(slug: string, { preview = false }: ReadOptions = {}): Promise<Article | null> {
  if (!SLUG.test(slug)) return null;
  try {
    const [row] = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    if (row) return preview || row.status === "published" ? fromRow(row) : null;
  } catch (error) {
    if (preview) throw error;
  }
  return readFileArticle(slug);
}

export async function listArticles({ preview = false, status }: ReadOptions & { status?: ArticleStatus } = {}): Promise<Article[]> {
  const wanted = preview ? status : "published";
  const result: Article[] = [];
  // A row of any status hides its file twin, so drafts never leak through the fallback.
  const inDb = new Set<string>();
  try {
    for (const row of await db.select().from(articles)) {
      inDb.add(row.slug);
      if (!wanted || row.status === wanted) result.push(fromRow(row));
    }
  } catch (error) {
    if (preview) throw error;
  }
  if (!wanted || wanted === "published") {
    for (const file of await listFileArticles()) if (!inDb.has(file.slug)) result.push(file);
  }
  return result.sort((a, b) => b.date.localeCompare(a.date));
}

export async function upsertArticle(input: ArticleInput): Promise<ArticleRow> {
  const now = new Date().toISOString();
  const values = {
    slug: input.slug,
    title: input.title,
    subtitle: input.subtitle,
    description: input.description,
    body: input.body,
    tags: input.tags === undefined ? undefined : JSON.stringify(input.tags),
    status: input.status,
    published_at: input.publishedAt ?? (input.status === "published" ? now : undefined),
    linkedin_url: input.linkedinUrl,
    cover_image: input.coverImage,
    updated_at: now,
  };
  const updates = Object.fromEntries(Object.entries(values).filter(([key, value]) => key !== "slug" && value !== undefined));
  return db.transaction(async (tx) => {
    const [existing] = await tx.select({ published_at: articles.published_at }).from(articles).where(eq(articles.slug, input.slug)).limit(1);
    // Keep the original publication date when re-publishing without an explicit one.
    if (existing?.published_at && input.publishedAt === undefined) delete updates.published_at;
    const [row] = await tx.insert(articles).values(values).onConflictDoUpdate({ target: articles.slug, set: updates }).returning();
    return row;
  });
}

export async function setArticleStatus(slug: string, status: ArticleStatus, linkedinUrl?: string): Promise<ArticleRow | null> {
  const now = new Date().toISOString();
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    if (!existing) return null;
    const [row] = await tx.update(articles).set({
      status,
      published_at: status === "published" ? existing.published_at ?? now : existing.published_at,
      ...(linkedinUrl ? { linkedin_url: linkedinUrl } : {}),
      updated_at: now,
    }).where(eq(articles.id, existing.id)).returning();
    return row;
  });
}
