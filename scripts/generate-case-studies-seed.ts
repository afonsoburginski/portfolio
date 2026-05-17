#!/usr/bin/env bun
/**
 * One‑shot: reads CASE_STUDIES from lib/case-studies and emits SQL
 * UPDATE statements to populate the rich case‑study columns on the
 * existing project rows (matched by slug).
 *
 * Usage:  bun scripts/generate-case-studies-seed.ts > drizzle/0008_seed_case_studies.sql
 */

import { CASE_STUDIES } from "../lib/case-studies";

function esc(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  const s = typeof value === "string" ? value : JSON.stringify(value);
  return `'${s.replace(/'/g, "''")}'`;
}

const header = `-- Generated from lib/case-studies/*.ts by scripts/generate-case-studies-seed.ts
-- Populates rich case‑study fields on existing projects rows (matched by slug).
-- Safe to re‑run: every column is overwritten with the source‑of‑truth value.

`;

const stmts: string[] = [header];

for (const [slug, cs] of Object.entries(CASE_STUDIES)) {
  const cols = {
    subtitle:      esc(cs.subtitle ?? null),
    role:          esc(cs.role),
    timeline:      esc(cs.timeline),
    stack:         esc(cs.stack),
    live_url:      esc(cs.liveUrl ?? null),
    github_url:    esc(cs.githubUrl ?? null),
    story:         esc(cs.story ?? null),
    image:         esc(cs.image),
    image2:        esc(cs.image2 ?? null),
    description:   esc(cs.description),
    revenue_note:  esc(cs.revenueNote ?? null),
    extra_images:  esc(cs.extraImages ?? []),
    objectives:    esc(cs.objectives ?? []),
    highlights:    esc(cs.highlights ?? []),
    outcomes:      esc(cs.outcomes ?? []),
    challenges:    esc(cs.challenges ?? []),
    sections:      esc(cs.sections ?? []),
    title:         esc(cs.title),
  };

  const setClause = Object.entries(cols)
    .map(([k, v]) => `  "${k}" = ${v}`)
    .join(",\n");

  stmts.push(
    `-- ${slug}\nUPDATE "projects" SET\n${setClause},\n  "updated_at" = datetime('now')\nWHERE "slug" = '${slug.replace(/'/g, "''")}';\n`,
  );
}

process.stdout.write(stmts.join("\n"));
