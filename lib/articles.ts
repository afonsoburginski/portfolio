import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string;
  body: string;
  readingMinutes: number;
};

const DIR = path.join(process.cwd(), "content", "articles");

function parse(slug: string, raw: string): Article {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta: Record<string, string> = {};
  const body = match ? match[2] : raw;
  if (match) {
    for (const line of match[1].split("\n")) {
      const i = line.indexOf(":");
      if (i === -1) continue;
      meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"|"$/g, "");
    }
  }
  const words = body.trim().split(/\s+/).length;
  return {
    slug,
    title: meta.title ?? slug,
    description: meta.description ?? "",
    date: meta.date ?? "",
    body: body.trim(),
    readingMinutes: Math.max(1, Math.round(words / 220)),
  };
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    return parse(slug, await readFile(path.join(DIR, `${slug}.md`), "utf8"));
  } catch {
    return null;
  }
}

export async function listArticles(): Promise<Article[]> {
  const files = (await readdir(DIR).catch(() => [])).filter((f) => f.endsWith(".md"));
  const all = await Promise.all(files.map((f) => getArticle(f.replace(/\.md$/, ""))));
  return all.filter((a): a is Article => a !== null).sort((a, b) => b.date.localeCompare(a.date));
}
