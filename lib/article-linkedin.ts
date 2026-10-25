import type { Content, Root, RootContent, TableRow } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

const SITE = "https://afonsodev.com";

export type LinkedinImage = { name: string; description: string };
export type LinkedinExport = { title: string; html: string; markdown: string; images: LinkedinImage[] };

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function absoluteHref(href: string, slug: string): string | null {
  if (href.startsWith("#")) return `${SITE}/articles/${slug}${href}`;
  if (href.startsWith("/") && !href.startsWith("//")) return `${SITE}${href}`;
  return /^(https?:|mailto:)/i.test(href) ? href : null;
}

function textOf(node: Content | RootContent): string {
  if ("value" in node) return node.value;
  return "children" in node ? (node.children as RootContent[]).map(textOf).join("") : "";
}

// Renders the mdast subset used by articles. Everything is escaped; raw HTML nodes are dropped.
function renderNodes(nodes: RootContent[], ctx: Ctx): string {
  return nodes.map((node) => renderNode(node, ctx)).join("");
}

type Ctx = { slug: string; images: LinkedinImage[]; tables: number };

function placeholder(name: string): string {
  return `<p>[Insert image: ${escapeHtml(name)}.png]</p>`;
}

function renderNode(node: RootContent, ctx: Ctx): string {
  const inner = () => renderNodes("children" in node ? (node.children as RootContent[]) : [], ctx);
  switch (node.type) {
    case "heading": return `<h${Math.min(Math.max(node.depth, 2), 3)}>${inner()}</h${Math.min(Math.max(node.depth, 2), 3)}>`;
    case "paragraph": return `<p>${inner()}</p>`;
    case "text": return escapeHtml(node.value);
    case "strong": return `<strong>${inner()}</strong>`;
    case "emphasis": return `<em>${inner()}</em>`;
    case "delete": return `<s>${inner()}</s>`;
    case "inlineCode": return `<code>${escapeHtml(node.value)}</code>`;
    case "break": return "<br>";
    case "thematicBreak": return "<hr>";
    case "blockquote": return `<blockquote>${inner()}</blockquote>`;
    case "list": return `<${node.ordered ? "ol" : "ul"}>${inner()}</${node.ordered ? "ol" : "ul"}>`;
    case "listItem": return `<li>${node.children.map((c) => (c.type === "paragraph" ? renderNodes(c.children, ctx) : renderNode(c, ctx))).join("")}</li>`;
    case "link": {
      const href = absoluteHref(node.url, ctx.slug);
      return href ? `<a href="${escapeHtml(href)}">${inner()}</a>` : inner();
    }
    case "code": {
      if (node.lang === "diagram") {
        const id = node.value.trim().replace(/[^a-z0-9-]/gi, "");
        ctx.images.push({ name: `${id}.png`, description: `Diagram "${id}": render it from the article page (components/articles/diagrams.tsx).` });
        return placeholder(id);
      }
      return `<pre><code>${escapeHtml(node.value)}</code></pre>`;
    }
    case "table": {
      const name = `table-${++ctx.tables}`;
      const header = (node.children[0] as TableRow).children.map(textOf).join(" | ");
      ctx.images.push({ name: `${name}.png`, description: `Table with columns: ${header}. Export it from /articles/${ctx.slug}/export/${name}.` });
      return placeholder(name);
    }
    default: return "";
  }
}

export function exportForLinkedin(article: { slug: string; title: string; body: string }): LinkedinExport {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(article.body) as Root;
  const ctx: Ctx = { slug: article.slug, images: [], tables: 0 };
  const html = renderNodes(tree.children, ctx);
  const images: LinkedinImage[] = [
    { name: "capa.png", description: `Cover, 1920x1080: "${article.title}". Export it from /articles/${article.slug}/export/capa.` },
    ...ctx.images,
  ];
  const markdown = article.body.replace(/\]\((\/[^)\s]*)\)/g, `](${SITE}$1)`);
  return { title: article.title, html, markdown, images };
}
