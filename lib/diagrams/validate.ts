import { z } from "zod";
import { DIAGRAM_TYPES, diagramSchema, type DiagramSpec } from "./schema";

export type ParseResult = { ok: true; spec: DiagramSpec } | { ok: false; errors: string[] };

/** True when the ```diagram body is declarative JSON rather than a legacy id. */
export function isDeclarative(source: string): boolean {
  return source.trimStart().startsWith("{");
}

function pathOf(path: PropertyKey[]): string {
  return path.reduce<string>((acc, p) => (typeof p === "number" ? `${acc}[${p}]` : acc ? `${acc}.${String(p)}` : String(p)), "") || "(root)";
}

/** Flattens a ZodError into `path: message` lines an agent can act on. */
export function formatIssues(error: z.ZodError): string[] {
  const lines: string[] = [];
  const visit = (issues: z.core.$ZodIssue[], prefix: PropertyKey[]) => {
    for (const issue of issues) {
      const path = [...prefix, ...issue.path];
      if (issue.code === "invalid_union" && "errors" in issue && issue.errors.length === 1) { visit(issue.errors[0] as z.core.$ZodIssue[], path); continue; }
      if (issue.code === "invalid_union" && path.at(-1) === "type") { lines.push(`${pathOf(path)}: must be one of ${DIAGRAM_TYPES.join(", ")}`); continue; }
      if (issue.code === "unrecognized_keys") { lines.push(`${pathOf(path)}: unknown key(s) ${issue.keys.map((k) => `"${k}"`).join(", ")}`); continue; }
      lines.push(`${pathOf(path)}: ${issue.message}`);
    }
  };
  visit(error.issues, []);
  return lines;
}

export function parseDiagram(input: unknown): ParseResult {
  const result = diagramSchema.safeParse(input);
  return result.success ? { ok: true, spec: result.data } : { ok: false, errors: formatIssues(result.error) };
}

export function parseDiagramSource(source: string): ParseResult {
  let json: unknown;
  try {
    json = JSON.parse(source);
  } catch (error) {
    return { ok: false, errors: [`invalid JSON: ${error instanceof Error ? error.message : String(error)}`] };
  }
  return parseDiagram(json);
}

export type DiagramBlock = { source: string; line: number };

/** Finds ```diagram fences in Markdown. `line` is the 1-based line of the opening fence. */
export function extractDiagramBlocks(markdown: string): DiagramBlock[] {
  const blocks: DiagramBlock[] = [];
  const lines = markdown.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const open = /^(\s{0,3})(`{3,}|~{3,})\s*diagram\s*$/.exec(lines[i]);
    if (!open) continue;
    const fence = open[2];
    const body: string[] = [];
    let j = i + 1;
    while (j < lines.length && !new RegExp(`^\\s{0,3}${fence[0]}{${fence.length},}\\s*$`).test(lines[j])) body.push(lines[j++]);
    blocks.push({ source: body.join("\n"), line: i + 1 });
    i = j;
  }
  return blocks;
}

/** Validates every ```diagram block of an article. Returns one message per problem; empty means valid. */
export function validateArticleDiagrams(markdown: string, legacyIds: readonly string[] = []): string[] {
  const problems: string[] = [];
  extractDiagramBlocks(markdown).forEach((block, index) => {
    const where = `diagram block #${index + 1} (line ${block.line})`;
    const source = block.source.trim();
    if (!source) { problems.push(`${where}: empty`); return; }
    if (!isDeclarative(source)) {
      if (legacyIds.length && !legacyIds.includes(source)) problems.push(`${where}: unknown diagram id "${source.slice(0, 40)}". Use a JSON object (starts with "{") or one of: ${legacyIds.join(", ")}`);
      return;
    }
    const result = parseDiagramSource(source);
    if (!result.ok) result.errors.forEach((e) => problems.push(`${where}: ${e}`));
  });
  return problems;
}
