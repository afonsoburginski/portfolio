// Idempotent import of content/articles/*.md into the articles table (status published).
// Existing rows are left untouched unless --force is passed. Needs DATABASE_URL.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL.");
const force = process.argv.includes("--force");
const dir = path.join(process.cwd(), "content", "articles");

function parse(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta = {};
  if (match) {
    for (const line of match[1].split("\n")) {
      const i = line.indexOf(":");
      if (i !== -1) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"|"$/g, "");
    }
  }
  return { meta, body: (match ? match[2] : raw).trim() };
}

const sql = postgres(url, { max: 1 });
try {
  for (const file of (await readdir(dir)).filter((f) => f.endsWith(".md"))) {
    const slug = file.replace(/\.md$/, "");
    const { meta, body } = parse(await readFile(path.join(dir, file), "utf8"));
    const now = new Date().toISOString();
    const publishedAt = meta.date ? new Date(meta.date).toISOString() : now;
    const row = {
      slug, title: meta.title ?? slug, subtitle: meta.subtitle ?? null, description: meta.description ?? "",
      body, status: "published", published_at: publishedAt, updated_at: now,
    };
    const rows = force
      ? await sql`insert into articles ${sql(row)} on conflict (slug) do update set title = excluded.title, subtitle = excluded.subtitle,
          description = excluded.description, body = excluded.body, updated_at = excluded.updated_at returning slug`
      : await sql`insert into articles ${sql(row)} on conflict (slug) do nothing returning slug`;
    console.log(`${slug}: ${rows.length ? (force ? "upserted" : "inserted") : "kept existing"}`);
  }
} finally {
  await sql.end();
}
