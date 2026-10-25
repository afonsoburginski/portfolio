export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export type TocItem = { id: string; text: string; level: 2 | 3 };

export function extractToc(body: string): TocItem[] {
  const items: TocItem[] = [];
  let fenced = false;
  for (const line of body.split("\n")) {
    if (line.startsWith("```")) fenced = !fenced;
    if (fenced) continue;
    const m = line.match(/^(##|###)\s+(.+)$/);
    if (!m) continue;
    const text = m[2].replace(/[`*_]/g, "").trim();
    items.push({ id: slugify(text), text, level: m[1] === "##" ? 2 : 3 });
  }
  return items;
}
