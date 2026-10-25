import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { FIXTURES } from "./__fixtures__";
import { diagramJsonSchema } from "./json-schema";
import { diagramSchema } from "./schema";
import { extractDiagramBlocks, isDeclarative, parseDiagram, parseDiagramSource, validateArticleDiagrams } from "./validate";

const base = { title: "T", description: "D" };

test("every fixture is valid", () => {
  for (const [name, spec] of Object.entries(FIXTURES)) {
    const result = parseDiagram(spec);
    assert.ok(result.ok, `${name}: ${result.ok ? "" : result.errors.join("; ")}`);
  }
});

test("covers all six types", () => {
  assert.deepEqual(new Set(Object.values(FIXTURES).map((f) => f.type)), new Set(["architecture", "network", "pipeline", "sequence", "buffer", "metric"]));
});

test("errors name the path of the problem", () => {
  const cases: [unknown, RegExp][] = [
    [{ type: "nope" }, /^type: must be one of/],
    [{ type: "architecture", ...base, nodes: [{ id: "a", label: "A", extra: 1 }] }, /nodes\[0\]: unknown key\(s\) "extra"/],
    [{ type: "architecture", ...base, nodes: [{ id: "a", label: "A" }], edges: [{ from: "a", to: "zzz" }] }, /edges\[0\]\.to: unknown node "zzz"/],
    [{ type: "architecture", ...base, nodes: [{ id: "a", label: "A" }, { id: "a", label: "B" }] }, /nodes\[1\]\.id: duplicate id "a"/],
    [{ type: "architecture", ...base, nodes: [{ id: "a", label: "A", x: 1 }] }, /x and y/],
    [{ type: "architecture", ...base, nodes: [{ id: "a", label: "A", icon: "unicorn" }] }, /nodes\[0\]\.icon/],
    [{ type: "architecture", ...base, nodes: [{ id: "a", label: "A", tone: "purple" }] }, /nodes\[0\]\.tone/],
    [{ type: "architecture", ...base, groups: [{ id: "g", label: "G", parent: "g2" }, { id: "g2", label: "G2", parent: "g" }], nodes: [{ id: "a", label: "A" }] }, /cycle/],
    [{ type: "sequence", ...base, participants: [{ id: "a", label: "A" }, { id: "b", label: "B" }], steps: [{ kind: "message", from: "a", to: "c", label: "x" }] }, /steps\[0\]\.to: unknown participant "c"/],
    [{ type: "sequence", ...base, participants: [{ id: "a", label: "A" }, { id: "b", label: "B" }], steps: [{ kind: "oops" }] }, /steps\[0\]/],
    [{ type: "metric", ...base, chart: "line", data: "measured", x: { label: "x", values: [1, 2] }, y: { label: "y" }, series: [{ name: "s", values: [1] }] }, /method: required/],
    [{ type: "metric", ...base, chart: "line", data: "illustrative", x: { label: "x", values: [1, 2] }, y: { label: "y" }, series: [{ name: "s", values: [1] }] }, /series\[0\]\.values: has 1 values but x\.values has 2/],
    [{ type: "buffer", ...base, unit: "ms", range: { start: 0, end: 10 }, tracks: [{ id: "t", label: "T", segments: [{ start: 5, end: 20 }] }] }, /outside range 0\.\.10/],
    [{ type: "network", ...base, nodes: [{ id: "a", label: "A", zone: "z" }, { id: "b", label: "B" }], links: [{ from: "a", to: "b" }] }, /nodes\[0\]\.zone: unknown zone "z"/],
    [{ type: "pipeline", ...base, lanes: [{ id: "l", label: "L", stages: [{ id: "s", label: "S" }] }], links: [{ from: "s", to: "q" }] }, /links\[0\]\.to: unknown stage "q"/],
  ];
  for (const [input, expected] of cases) {
    const result = parseDiagram(input);
    assert.ok(!result.ok, `should fail: ${JSON.stringify(input).slice(0, 80)}`);
    if (!result.ok) assert.ok(result.errors.some((e) => expected.test(e)), `expected ${expected} in ${JSON.stringify(result.errors)}`);
  }
});

test("source parsing", () => {
  assert.equal(isDeclarative(' \n {"type":"x"}'), true);
  assert.equal(isDeclarative("pipeline"), false);
  const bad = parseDiagramSource("{ nope");
  assert.ok(!bad.ok && /invalid JSON/.test(bad.errors[0]));
});

test("diagram blocks are found with their line numbers", () => {
  const md = "# T\n\ntext\n\n```diagram\npipeline\n```\n\n```js\nnot a diagram\n```\n\n```diagram\n{\"type\":\"x\"}\n```\n";
  const blocks = extractDiagramBlocks(md);
  assert.deepEqual(blocks.map((b) => [b.line, b.source.trim()]), [[5, "pipeline"], [13, '{"type":"x"}']]);
});

test("article validation: accepts legacy ids and valid JSON, rejects the rest with a clear message", () => {
  const ok = "```diagram\npipeline\n```\n\n```diagram\n" + JSON.stringify(FIXTURES.kafka) + "\n```\n";
  assert.deepEqual(validateArticleDiagrams(ok, ["pipeline"]), []);
  assert.match(validateArticleDiagrams("```diagram\nmystery\n```", ["pipeline", "decision"])[0], /unknown diagram id "mystery".*pipeline, decision/);
  const broken = "intro\n\n```diagram\n" + JSON.stringify({ ...FIXTURES.kafka, edges: [{ from: "web", to: "nowhere" }] }) + "\n```";
  const problems = validateArticleDiagrams(broken);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /diagram block #1 \(line 3\): edges\[0\]\.to: unknown node "nowhere"/);
  assert.match(validateArticleDiagrams("```diagram\n\n```")[0], /empty/);
});

test("JSON Schema is generated from the Zod schema", () => {
  const schema = diagramJsonSchema() as { oneOf?: unknown[]; anyOf?: unknown[] };
  const variants = schema.oneOf ?? schema.anyOf;
  assert.equal(variants?.length, 6);
  const text = JSON.stringify(schema);
  assert.ok(text.includes('"architecture"') && text.includes("additionalProperties"));
  assert.ok(diagramSchema.safeParse(FIXTURES.kafka).success);
});

test("docs/diagrams.md examples validate", () => {
  const doc = readFileSync(path.resolve(process.cwd(), "docs/diagrams.md"), "utf8");
  const blocks = extractDiagramBlocks(doc);
  assert.ok(blocks.length >= 6, "one example per type");
  const types = new Set<string>();
  for (const b of blocks) {
    const result = parseDiagramSource(b.source);
    assert.ok(result.ok, `docs line ${b.line}: ${result.ok ? "" : result.errors.join("; ")}`);
    if (result.ok) types.add(result.spec.type);
  }
  assert.equal(types.size, 6, "every type has a documented example");
});
