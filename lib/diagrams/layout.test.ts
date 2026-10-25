import assert from "node:assert/strict";
import { test } from "node:test";
import { FIXTURES } from "./__fixtures__";
import { rectsOverlap, type Pt, type Rect } from "./geometry";
import { architectureModel, gridLayout, layoutGraph, manualLayout, networkModel, type GraphLayout, type GraphModel } from "./graph-layout";
import { layoutBuffer } from "./buffer-layout";
import { layoutMetric } from "./metric-layout";
import { textWidth } from "./measure";
import { layoutPipeline } from "./pipeline-layout";
import { layoutSequence } from "./sequence-layout";
import type { ArchitectureSpec, BufferSpec, MetricSpec, NetworkSpec, PipelineSpec, SequenceSpec } from "./schema";

const inside = (inner: Rect, outer: Rect) => inner.x >= outer.x - 0.5 && inner.y >= outer.y - 0.5 && inner.x + inner.w <= outer.x + outer.w + 0.5 && inner.y + inner.h <= outer.y + outer.h + 0.5;
const onBorder = (p: Pt, r: Rect) => {
  const nearX = Math.abs(p.x - r.x) <= 2 || Math.abs(p.x - (r.x + r.w)) <= 2;
  const nearY = Math.abs(p.y - r.y) <= 2 || Math.abs(p.y - (r.y + r.h)) <= 2;
  const withinX = p.x >= r.x - 2 && p.x <= r.x + r.w + 2, withinY = p.y >= r.y - 2 && p.y <= r.y + r.h + 2;
  return (nearX && withinY) || (nearY && withinX);
};
function segmentHitsRect(a: Pt, b: Pt, r: Rect): boolean {
  const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
  return x0 < r.x + r.w - 1 && x1 > r.x + 1 && y0 < r.y + r.h - 1 && y1 > r.y + 1;
}
function crossings(layout: GraphLayout): number {
  let count = 0;
  const segs = layout.edges.map((e) => e.points.slice(1).map((p, i) => [e.points[i], p] as const));
  for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) {
    for (const [a, b] of segs[i]) for (const [c, d] of segs[j]) {
      const aH = a.y === b.y, cH = c.y === d.y;
      if (aH === cH) continue;
      const [h0, h1, v0, v1] = aH ? [a, b, c, d] : [c, d, a, b];
      if (v0.x > Math.min(h0.x, h1.x) + 1 && v0.x < Math.max(h0.x, h1.x) - 1 && h0.y > Math.min(v0.y, v1.y) + 1 && h0.y < Math.max(v0.y, v1.y) - 1) count++;
    }
  }
  return count;
}

function checkGraph(name: string, model: GraphModel, layout: GraphLayout, { strictRoutes = true } = {}) {
  const byId = new Map(layout.nodes.map((n) => [n.id, n]));
  const groupById = new Map(layout.groups.map((g) => [g.id, g]));
  const mark = `${name} (${layout.engine})`;
  for (let i = 0; i < layout.nodes.length; i++) for (let j = i + 1; j < layout.nodes.length; j++) {
    assert.ok(!rectsOverlap(layout.nodes[i], layout.nodes[j], 4), `${mark}: nodes ${layout.nodes[i].id} and ${layout.nodes[j].id} overlap`);
  }
  for (const n of layout.nodes) {
    for (let g = n.group ? groupById.get(n.group) : undefined; g; g = g.parent ? groupById.get(g.parent) : undefined) {
      assert.ok(inside(n, g), `${mark}: node ${n.id} escapes group ${g.id}`);
    }
    for (const g of layout.groups) {
      const member = (() => { for (let c = n.group ? groupById.get(n.group) : undefined; c; c = c.parent ? groupById.get(c.parent) : undefined) if (c.id === g.id) return true; return false; })();
      if (!member) assert.ok(!rectsOverlap(n, g), `${mark}: node ${n.id} intrudes on group ${g.id}`);
    }
  }
  for (const a of layout.groups) for (const b of layout.groups) {
    if (a.id < b.id && a.parent === b.parent) assert.ok(!rectsOverlap(a, b), `${mark}: sibling groups ${a.id} and ${b.id} overlap`);
  }
  for (const e of layout.edges) {
    const from = byId.get(e.from)!, to = byId.get(e.to)!;
    assert.ok(e.points.length >= 2, `${mark}: edge ${e.from}->${e.to} has no route`);
    assert.ok(onBorder(e.points[0], from), `${mark}: edge ${e.from}->${e.to} does not start on ${e.from}`);
    assert.ok(onBorder(e.points.at(-1)!, to), `${mark}: edge ${e.from}->${e.to} does not end on ${e.to}`);
    if (!strictRoutes) continue;
    e.points.slice(1).forEach((p, i) => {
      const q = e.points[i];
      assert.ok(Math.abs(p.x - q.x) < 0.5 || Math.abs(p.y - q.y) < 0.5, `${mark}: edge ${e.from}->${e.to} has a diagonal segment`);
      for (const n of layout.nodes) if (n.id !== e.from && n.id !== e.to) assert.ok(!segmentHitsRect(q, p, n), `${mark}: edge ${e.from}->${e.to} crosses node ${n.id}`);
    });
    if (e.label && e.labelAt) {
      const box = { x: e.labelAt.x - (textWidth(e.label, 10.5) + 8) / 2, y: e.labelAt.y - 7, w: textWidth(e.label, 10.5) + 8, h: 14 };
      for (const n of layout.nodes) assert.ok(!rectsOverlap(box, n), `${mark}: label "${e.label}" overlaps node ${n.id}`);
    }
  }
  for (const r of [...layout.nodes, ...layout.groups]) assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.w <= layout.width && r.y + r.h <= layout.height, `${mark}: ${r.id} outside canvas`);
  assert.equal(model.edges.length, layout.edges.length);
}

const GRAPHS: [string, GraphModel][] = [
  ["kafka", architectureModel(FIXTURES.kafka as ArchitectureSpec)],
  ["kubernetes", architectureModel(FIXTURES.kubernetes as ArchitectureSpec)],
  ["webrtcSfu", architectureModel(FIXTURES.webrtcSfu as ArchitectureSpec)],
  ["microservices", architectureModel(FIXTURES.microservices as ArchitectureSpec)],
  ["webrtcTopology", networkModel(FIXTURES.webrtcTopology as NetworkSpec)],
];

for (const [name, model] of GRAPHS) {
  test(`ELK layout is clean: ${name}`, async () => {
    const layout = await layoutGraph(model);
    assert.equal(layout.engine, "elk", "ELK should be used, not the fallback");
    checkGraph(name, model, layout);
    console.log(`  ${name}: ${layout.width}x${layout.height}, ${layout.vertical ? "down" : "right"}, ${crossings(layout)} edge crossing(s)`);
  });
  test(`grid fallback is sane: ${name}`, () => {
    const layout = gridLayout(model);
    checkGraph(`${name}/fallback`, model, layout, { strictRoutes: false });
  });
}

test("manual coordinates are honored", async () => {
  const model: GraphModel = { direction: "right", groups: [], edges: [{ id: "e0", from: "a", to: "b", tone: "main", dashed: false, both: false, animated: true }],
    nodes: [{ id: "a", label: "A", tone: "main", x: 0, y: 0 }, { id: "b", label: "B", tone: "alt", x: 300, y: 120 }] };
  const layout = await layoutGraph(model);
  assert.equal(layout.engine, "manual");
  checkGraph("manual", model, layout);
  assert.ok(layout.nodes[1].x - layout.nodes[0].x === 300);
  assert.equal(manualLayout(model).nodes.length, 2);
});

test("ELK failure falls back to the grid (no throw)", async () => {
  const original = console.error;
  console.error = () => {};
  try {
    // A node referencing a missing group makes the ELK graph invalid; layoutGraph must still return a layout.
    const model = architectureModel({ ...(FIXTURES.kafka as ArchitectureSpec), nodes: [{ id: "x", label: "X", group: "ghost" }, { id: "y", label: "Y" }], edges: [{ from: "x", to: "y" }], groups: [] });
    const layout = await layoutGraph(model);
    assert.ok(layout.nodes.length === 2 && layout.width > 0);
  } finally { console.error = original; }
});

test("pipeline layout: no overlaps, arrows start and end on stages", () => {
  const spec = FIXTURES.mediaPipeline as PipelineSpec;
  const L = layoutPipeline(spec);
  for (let i = 0; i < L.stages.length; i++) for (let j = i + 1; j < L.stages.length; j++) assert.ok(!rectsOverlap(L.stages[i], L.stages[j], 6), `${L.stages[i].id}/${L.stages[j].id} overlap`);
  for (const s of L.stages) assert.ok(L.lanes.some((l) => inside(s, l)), `${s.id} outside its lane`);
  const ids = new Map(L.stages.map((s) => [s.id, s]));
  assert.equal(L.arrows.length, 4 + 2 + 2);
  for (const a of L.arrows) assert.ok(a.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)));
  const link = L.arrows.find((a) => a.id === "link0")!;
  assert.ok(onBorder(link.points[0], ids.get("auth")!) && onBorder(link.points.at(-1)!, ids.get("ing")!));
});

test("sequence layout: every label fits between its lifelines", () => {
  const spec = FIXTURES.webrtcSignaling as SequenceSpec;
  const L = layoutSequence(spec);
  const xs = L.participants.map((p) => p.x);
  assert.deepEqual([...xs].sort((a, b) => a - b), xs, "participants stay in order");
  for (let i = 1; i < L.participants.length; i++) {
    const a = L.participants[i - 1], b = L.participants[i];
    assert.ok(b.x - b.box.w / 2 - (a.x + a.box.w / 2) >= 16, `headers ${a.id}/${b.id} too close`);
  }
  for (const r of L.rows) {
    if (r.kind === "message" && !r.self) assert.ok(Math.abs(r.x2 - r.x1) >= r.labelW + 28, `label "${r.label}" does not fit`);
    if (r.kind === "message" && r.self) assert.ok(r.x1 + 52 + r.labelW <= L.width, `self label "${r.label}" is cut off`);
    if (r.kind === "note") assert.ok(r.x >= 0 && r.x + r.w <= L.width, "note stays in canvas");
  }
  const ys = L.rows.map((r) => r.y);
  assert.deepEqual([...ys].sort((a, b) => a - b), ys, "rows are in step order");
});

test("buffer layout: markers do not collide, segments stay in range", () => {
  const spec = FIXTURES.jitterBuffer as BufferSpec;
  const L = layoutBuffer(spec);
  const byLevel = new Map<number, typeof L.markers>();
  for (const m of L.markers) byLevel.set(m.level, [...(byLevel.get(m.level) ?? []), m]);
  for (const list of byLevel.values()) for (let i = 1; i < list.length; i++) assert.ok(list[i].x - list[i].labelW / 2 > list[i - 1].x + list[i - 1].labelW / 2, "marker labels overlap");
  for (const t of L.tracks) for (const s of t.segments) assert.ok(s.x >= L.plotLeft - 0.5 && s.x + s.w <= L.plotRight + 0.5);
  // Many markers close together must stack rather than overlap.
  const crowded = layoutBuffer({ ...spec, markers: [10, 20, 30, 40].map((at) => ({ at, label: `marker ${at}` })) });
  assert.ok(Math.max(...crowded.markers.map((m) => m.level)) >= 1);
});

test("metric layout: points inside the plot", () => {
  for (const spec of [FIXTURES.delayChart, FIXTURES.trendChart] as MetricSpec[]) {
    const L = layoutMetric(spec);
    for (const s of L.series) for (const p of s.points) if (p) assert.ok(p.x >= L.plot.l && p.x <= L.plot.r && p.y >= L.plot.t - 0.5 && p.y <= L.plot.b + 0.5);
    for (const b of L.bars) assert.ok(b.y >= L.plot.t - 0.5 && b.y + b.h <= L.plot.b + 0.5, "bar inside plot");
    assert.ok(L.yTicks.length >= 2);
  }
});
