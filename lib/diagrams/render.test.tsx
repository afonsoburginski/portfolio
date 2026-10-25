import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Diagram, LEGACY_DIAGRAM_IDS } from "@/components/articles/diagrams";
import { DeclarativeDiagram } from "@/components/articles/diagrams/declarative-diagram";
import { ArchitectureDiagram, NetworkTopology } from "@/components/articles/diagrams/graph-figure";
import { BufferTimeline } from "@/components/articles/diagrams/buffer-timeline";
import { MetricChart } from "@/components/articles/diagrams/metric-chart";
import { PipelineDiagram } from "@/components/articles/diagrams/pipeline-diagram";
import { SequenceDiagram } from "@/components/articles/diagrams/sequence-diagram";
import { MarkdownBody } from "@/components/articles/markdown-body";
import { FIXTURES } from "./__fixtures__";
import type { ArchitectureSpec, BufferSpec, DiagramSpec, MetricSpec, NetworkSpec, PipelineSpec, SequenceSpec } from "./schema";

async function render(spec: DiagramSpec): Promise<string> {
  switch (spec.type) {
    case "architecture": return renderToStaticMarkup(await ArchitectureDiagram({ spec: spec as ArchitectureSpec }));
    case "network": return renderToStaticMarkup(await NetworkTopology({ spec: spec as NetworkSpec }));
    case "pipeline": return renderToStaticMarkup(PipelineDiagram({ spec: spec as PipelineSpec }));
    case "sequence": return renderToStaticMarkup(SequenceDiagram({ spec: spec as SequenceSpec }));
    case "buffer": return renderToStaticMarkup(BufferTimeline({ spec: spec as BufferSpec }));
    case "metric": return renderToStaticMarkup(MetricChart({ spec: spec as MetricSpec }));
  }
}
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
const PURPLE = /purple|violet|#8957e5|#a78bfa|#7c3aed|#8b5cf6|#6d28d9/i;

function labelsOf(spec: DiagramSpec): string[] {
  switch (spec.type) {
    case "architecture": case "network": return [...spec.nodes.map((n) => n.label), ...(spec.type === "architecture" ? spec.groups ?? [] : spec.zones ?? []).map((g) => g.label)];
    case "pipeline": return spec.lanes.flatMap((l) => [l.label, ...l.stages.map((s) => s.label)]);
    case "sequence": return spec.participants.map((p) => p.label);
    case "buffer": return spec.tracks.map((t) => t.label);
    case "metric": return [spec.x.label, spec.y.label];
  }
}

for (const [name, spec] of Object.entries(FIXTURES)) {
  test(`SSR markup is complete and accessible: ${name}`, async () => {
    const html = await render(spec);
    assert.match(html, /<svg[^>]*role="img"[^>]*aria-labelledby="dg-[^"]+-t dg-[^"]+-d"/);
    assert.ok(html.includes(`<title id=`) && html.includes(esc(spec.title)), "title");
    assert.ok(html.includes(esc(spec.description)), "desc");
    assert.ok(/<ul class="sr-only"/.test(html), "textual list of connections");
    assert.match(html, /viewBox="-16 -16 [\d.]+ [\d.]+"/);
    assert.ok(html.includes("Download") && html.includes(">SVG<") && html.includes(">PNG<"), "export buttons");
    for (const label of labelsOf(spec)) assert.ok(html.includes(esc(label)), `label "${label}" is rendered`);
    assert.ok(!/NaN|undefined|\[object/.test(html), "no NaN/undefined in markup");
    assert.ok(!PURPLE.test(html), "no purple");
    assert.ok(!/ x="-\d/.test(html.replace(/viewBox="[^"]+"/g, "")), "nothing drawn at negative x");
  });
}

test("every legacy diagram id still renders", () => {
  assert.ok(LEGACY_DIAGRAM_IDS.length >= 10);
  for (const id of LEGACY_DIAGRAM_IDS) {
    const html = renderToStaticMarkup(<Diagram id={id} />);
    assert.match(html, /<svg/, id);
    assert.ok(!html.includes("Download"), `${id}: legacy figures have no export buttons`);
  }
});

test("invalid declarative block shows a quiet fallback and logs", () => {
  const original = console.error;
  const logged: string[] = [];
  console.error = (...args: unknown[]) => { logged.push(args.join(" ")); };
  try {
    const html = renderToStaticMarkup(<DeclarativeDiagram source={'{"type":"architecture","title":"x","description":"y","nodes":[]}'} />);
    assert.match(html, /could not be displayed/);
    assert.ok(!html.includes("<svg"));
    assert.match(logged.join("\n"), /invalid diagram block[\s\S]*nodes/);
  } finally { console.error = original; }
});

test("markdown body: JSON blocks render declaratively and ids stay legacy", () => {
  const body = ["Intro.", "", "```diagram", "decision", "```", "", "```diagram", JSON.stringify(FIXTURES.webrtcSignaling), "```", ""].join("\n");
  const html = renderToStaticMarkup(<MarkdownBody body={body} />);
  assert.ok(html.includes("WebRTC signaling and ICE"), "declarative sequence");
  assert.ok((html.match(/role="img"/g) ?? []).length === 2, "legacy + declarative");
});
