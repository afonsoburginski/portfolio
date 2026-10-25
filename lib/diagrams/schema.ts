import { z } from "zod";
import { BRAND_NAMES, ICON_NAMES, LINK_KINDS, NETWORK_ROLES, TONES } from "./names";

const text = (max: number) => z.string().trim().min(1).max(max);
const identifier = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,39}$/, "use letters, digits, - or _ (max 40 chars)");
const tone = z.enum(TONES);
const icon = z.enum(ICON_NAMES);
const brand = z.enum(BRAND_NAMES);

const legendItem = z.strictObject({ label: text(60), tone, dashed: z.boolean().optional() });

const base = {
  title: text(120).describe("Short title. Becomes the accessible <title> of the SVG."),
  description: text(700).describe("Plain-language description of what the diagram shows. Becomes the accessible <desc>."),
  caption: text(300).optional().describe("Visible caption under the figure, e.g. \"Figure 1. ...\"."),
  legend: z.array(legendItem).max(8).optional().describe("Legend entries: a tone and what it means."),
};

type Issue = { path: (string | number)[]; message: string };
function uniqueIds(items: { id: string }[], path: string, issues: Issue[], seen = new Set<string>()) {
  items.forEach((item, i) => {
    if (seen.has(item.id)) issues.push({ path: [path, i, "id"], message: `duplicate id "${item.id}"` });
    seen.add(item.id);
  });
}
function report(issues: Issue[], ctx: z.RefinementCtx) {
  for (const i of issues) ctx.addIssue({ code: "custom", path: i.path, message: i.message });
}
/** Group parents must exist and must not form a cycle. */
function checkGroups(groups: { id: string; parent?: string }[], pathKey: string, issues: Issue[]) {
  const byId = new Map(groups.map((g) => [g.id, g]));
  groups.forEach((g, i) => {
    if (!g.parent) return;
    if (!byId.has(g.parent)) { issues.push({ path: [pathKey, i, "parent"], message: `unknown group "${g.parent}"` }); return; }
    const seen = new Set([g.id]);
    for (let cur = byId.get(g.parent); cur; cur = cur.parent ? byId.get(cur.parent) : undefined) {
      if (seen.has(cur.id)) { issues.push({ path: [pathKey, i, "parent"], message: "group parents form a cycle" }); return; }
      seen.add(cur.id);
    }
  });
}

/* ---------- graph-like: architecture and network ---------- */

const direction = z.enum(["auto", "right", "down"]).optional().describe("Flow direction. Default auto: picks the more compact of right and down.");
const coord = z.number().min(0).max(4000);

const architectureNode = z.strictObject({
  id: identifier,
  label: text(48),
  sub: text(80).optional(),
  icon: icon.optional(),
  brand: brand.optional(),
  tone: tone.optional(),
  group: identifier.optional().describe("Id of the group that contains this node."),
  step: z.number().int().min(1).max(99).optional().describe("Numbered badge on the node."),
  x: coord.optional().describe("Optional manual position. Set x and y on every node or on none; with none, ELK lays the graph out."),
  y: coord.optional(),
});
const group = z.strictObject({ id: identifier, label: text(48), tone: tone.optional(), parent: identifier.optional() });
const architectureEdge = z.strictObject({
  from: identifier,
  to: identifier,
  label: text(32).optional(),
  tone: tone.optional(),
  dashed: z.boolean().optional(),
  bidirectional: z.boolean().optional(),
  animated: z.boolean().optional().describe("Animated flow dashes. Default true for solid edges."),
});

function checkEdges(edges: { from: string; to: string }[] | undefined, nodeIds: Set<string>, issues: Issue[]) {
  edges?.forEach((e, i) => {
    if (!nodeIds.has(e.from)) issues.push({ path: ["edges", i, "from"], message: `unknown node "${e.from}"` });
    if (!nodeIds.has(e.to)) issues.push({ path: ["edges", i, "to"], message: `unknown node "${e.to}"` });
    if (e.from === e.to) issues.push({ path: ["edges", i, "to"], message: "self-loops are not supported" });
  });
}
function checkCoords(nodes: { x?: number; y?: number }[], issues: Issue[]) {
  const placed = nodes.filter((n) => n.x !== undefined && n.y !== undefined).length;
  const partial = nodes.some((n) => (n.x === undefined) !== (n.y === undefined));
  if (partial || (placed > 0 && placed < nodes.length)) issues.push({ path: ["nodes"], message: "set x and y on every node, or on none" });
}

export const architectureSchema = z.strictObject({
  type: z.literal("architecture"),
  ...base,
  direction,
  nodes: z.array(architectureNode).min(1).max(60),
  groups: z.array(group).max(20).optional(),
  edges: z.array(architectureEdge).max(120).optional(),
}).superRefine((d, ctx) => {
  const issues: Issue[] = [];
  const seen = new Set<string>();
  uniqueIds(d.groups ?? [], "groups", issues, seen);
  uniqueIds(d.nodes, "nodes", issues, seen);
  checkGroups(d.groups ?? [], "groups", issues);
  const groupIds = new Set((d.groups ?? []).map((g) => g.id));
  d.nodes.forEach((n, i) => {
    if (n.group && !groupIds.has(n.group)) issues.push({ path: ["nodes", i, "group"], message: `unknown group "${n.group}"` });
  });
  checkEdges(d.edges, new Set(d.nodes.map((n) => n.id)), issues);
  checkCoords(d.nodes, issues);
  report(issues, ctx);
});

const networkNode = z.strictObject({
  id: identifier,
  label: text(48),
  sub: text(80).optional(),
  role: z.enum(NETWORK_ROLES).optional().describe("Picks a default icon and tone."),
  icon: icon.optional(),
  brand: brand.optional(),
  tone: tone.optional(),
  zone: identifier.optional().describe("Id of the zone (network boundary) that contains this node."),
});
const networkLink = z.strictObject({
  from: identifier,
  to: identifier,
  label: text(32).optional().describe("Protocol or purpose, e.g. \"SRTP\" or \"WSS\"."),
  kind: z.enum(LINK_KINDS).optional().describe("media (blue), signaling (amber dashed), relay (teal), control (white dashed), data (gray)."),
  bidirectional: z.boolean().optional().describe("Default true for links."),
});

export const networkSchema = z.strictObject({
  type: z.literal("network"),
  ...base,
  direction,
  nodes: z.array(networkNode).min(2).max(40),
  zones: z.array(group).max(12).optional().describe("Network boundaries such as a LAN behind NAT, a cloud region or the public internet."),
  links: z.array(networkLink).min(1).max(80),
}).superRefine((d, ctx) => {
  const issues: Issue[] = [];
  const seen = new Set<string>();
  uniqueIds(d.zones ?? [], "zones", issues, seen);
  uniqueIds(d.nodes, "nodes", issues, seen);
  checkGroups(d.zones ?? [], "zones", issues);
  const zoneIds = new Set((d.zones ?? []).map((z) => z.id));
  d.nodes.forEach((n, i) => {
    if (n.zone && !zoneIds.has(n.zone)) issues.push({ path: ["nodes", i, "zone"], message: `unknown zone "${n.zone}"` });
  });
  const ids = new Set(d.nodes.map((n) => n.id));
  d.links.forEach((l, i) => {
    if (!ids.has(l.from)) issues.push({ path: ["links", i, "from"], message: `unknown node "${l.from}"` });
    if (!ids.has(l.to)) issues.push({ path: ["links", i, "to"], message: `unknown node "${l.to}"` });
    if (l.from === l.to) issues.push({ path: ["links", i, "to"], message: "self-loops are not supported" });
  });
  report(issues, ctx);
});

/* ---------- pipeline ---------- */

const stage = z.strictObject({
  id: identifier, label: text(40), sub: text(60).optional(), icon: icon.optional(), brand: brand.optional(),
  tone: tone.optional(), step: z.number().int().min(1).max(99).optional(),
});
const lane = z.strictObject({
  id: identifier, label: text(48), tone: tone.optional(),
  stages: z.array(stage).min(1).max(10),
  connect: z.boolean().optional().describe("Draw arrows between consecutive stages. Default true."),
});
const pipelineLink = z.strictObject({
  from: identifier, to: identifier, label: text(32).optional(), tone: tone.optional(), dashed: z.boolean().optional(),
});

export const pipelineSchema = z.strictObject({
  type: z.literal("pipeline"),
  ...base,
  lanes: z.array(lane).min(1).max(6),
  links: z.array(pipelineLink).max(30).optional().describe("Arrows between stages of different lanes."),
}).superRefine((d, ctx) => {
  const issues: Issue[] = [];
  const stages = d.lanes.flatMap((l) => l.stages);
  const seen = new Set<string>();
  d.lanes.forEach((l, li) => l.stages.forEach((s, si) => {
    if (seen.has(s.id)) issues.push({ path: ["lanes", li, "stages", si, "id"], message: `duplicate id "${s.id}"` });
    seen.add(s.id);
  }));
  uniqueIds(d.lanes, "lanes", issues);
  const ids = new Set(stages.map((s) => s.id));
  d.links?.forEach((l, i) => {
    if (!ids.has(l.from)) issues.push({ path: ["links", i, "from"], message: `unknown stage "${l.from}"` });
    if (!ids.has(l.to)) issues.push({ path: ["links", i, "to"], message: `unknown stage "${l.to}"` });
  });
  report(issues, ctx);
});

/* ---------- sequence ---------- */

const participant = z.strictObject({
  id: identifier, label: text(36), sub: text(50).optional(), icon: icon.optional(), brand: brand.optional(), tone: tone.optional(),
});
const messageStep = z.strictObject({
  kind: z.literal("message"),
  from: identifier,
  to: identifier,
  label: text(60),
  style: z.enum(["sync", "async", "return"]).optional().describe("sync: solid, async: solid animated, return: dashed."),
  tone: tone.optional(),
});
const noteStep = z.strictObject({
  kind: z.literal("note"),
  over: z.union([identifier, z.array(identifier).min(1).max(2)]).describe("One participant id, or [first, last] to span a range."),
  text: text(160),
  tone: tone.optional(),
});
const phaseStep = z.strictObject({ kind: z.literal("phase"), label: text(60) });

export const sequenceSchema = z.strictObject({
  type: z.literal("sequence"),
  ...base,
  numbered: z.boolean().optional().describe("Number the messages. Default true."),
  participants: z.array(participant).min(2).max(10),
  steps: z.array(z.discriminatedUnion("kind", [messageStep, noteStep, phaseStep])).min(1).max(60),
}).superRefine((d, ctx) => {
  const issues: Issue[] = [];
  uniqueIds(d.participants, "participants", issues);
  const ids = new Set(d.participants.map((p) => p.id));
  d.steps.forEach((s, i) => {
    if (s.kind === "message") {
      if (!ids.has(s.from)) issues.push({ path: ["steps", i, "from"], message: `unknown participant "${s.from}"` });
      if (!ids.has(s.to)) issues.push({ path: ["steps", i, "to"], message: `unknown participant "${s.to}"` });
    } else if (s.kind === "note") {
      (Array.isArray(s.over) ? s.over : [s.over]).forEach((id) => {
        if (!ids.has(id)) issues.push({ path: ["steps", i, "over"], message: `unknown participant "${id}"` });
      });
    }
  });
  report(issues, ctx);
});

/* ---------- buffer timeline ---------- */

const segment = z.strictObject({ start: z.number(), end: z.number(), label: text(32).optional(), tone: tone.optional() });
const track = z.strictObject({ id: identifier, label: text(40), sub: text(50).optional(), segments: z.array(segment).min(1).max(40) });
const marker = z.strictObject({ at: z.number(), label: text(32), tone: tone.optional() });
const span = z.strictObject({ start: z.number(), end: z.number(), label: text(40), tone: tone.optional() });

export const bufferSchema = z.strictObject({
  type: z.literal("buffer"),
  ...base,
  unit: text(10).describe("Axis unit shown on ticks, e.g. ms, s, frames, segments."),
  range: z.strictObject({ start: z.number(), end: z.number() }),
  tracks: z.array(track).min(1).max(10),
  markers: z.array(marker).max(10).optional().describe("Vertical lines across all tracks, e.g. playhead or live edge."),
  spans: z.array(span).max(8).optional().describe("Brackets above the tracks that annotate a time range, e.g. target latency."),
}).superRefine((d, ctx) => {
  const issues: Issue[] = [];
  const { start, end } = d.range;
  if (!(end > start)) issues.push({ path: ["range", "end"], message: "must be greater than range.start" });
  uniqueIds(d.tracks, "tracks", issues);
  const inside = (v: number) => v >= start && v <= end;
  d.tracks.forEach((t, ti) => t.segments.forEach((s, si) => {
    if (!(s.end > s.start)) issues.push({ path: ["tracks", ti, "segments", si, "end"], message: "must be greater than start" });
    if (!inside(s.start) || !inside(s.end)) issues.push({ path: ["tracks", ti, "segments", si], message: `outside range ${start}..${end}` });
  }));
  d.markers?.forEach((m, i) => { if (!inside(m.at)) issues.push({ path: ["markers", i, "at"], message: `outside range ${start}..${end}` }); });
  d.spans?.forEach((s, i) => {
    if (!(s.end > s.start)) issues.push({ path: ["spans", i, "end"], message: "must be greater than start" });
    if (!inside(s.start) || !inside(s.end)) issues.push({ path: ["spans", i], message: `outside range ${start}..${end}` });
  });
  report(issues, ctx);
});

/* ---------- metric chart ---------- */

const series = z.strictObject({
  name: text(40),
  tone: tone.optional(),
  values: z.array(z.number().nullable()).min(1).max(60).describe("One value per x.values entry; null leaves a gap."),
});
const threshold = z.strictObject({ value: z.number(), label: text(40), tone: tone.optional() });

export const metricSchema = z.strictObject({
  type: z.literal("metric"),
  ...base,
  chart: z.enum(["line", "bar"]),
  data: z.enum(["illustrative", "measured"]).describe("\"illustrative\" shows a visible badge. \"measured\" requires `method`."),
  method: text(200).optional().describe("How the numbers were measured. Required when data is \"measured\"."),
  x: z.strictObject({ label: text(40), values: z.array(z.union([z.string().min(1).max(20), z.number()])).min(1).max(60) }),
  y: z.strictObject({ label: text(40), unit: text(10).optional(), min: z.number().optional(), max: z.number().optional() }),
  series: z.array(series).min(1).max(5),
  thresholds: z.array(threshold).max(4).optional(),
}).superRefine((d, ctx) => {
  const issues: Issue[] = [];
  if (d.data === "measured" && !d.method) issues.push({ path: ["method"], message: "required when data is \"measured\" (say how it was measured)" });
  d.series.forEach((s, i) => {
    if (s.values.length !== d.x.values.length) {
      issues.push({ path: ["series", i, "values"], message: `has ${s.values.length} values but x.values has ${d.x.values.length}` });
    }
  });
  if (d.y.min !== undefined && d.y.max !== undefined && d.y.max <= d.y.min) issues.push({ path: ["y", "max"], message: "must be greater than y.min" });
  report(issues, ctx);
});

export const diagramSchema = z.discriminatedUnion("type", [
  architectureSchema, networkSchema, pipelineSchema, sequenceSchema, bufferSchema, metricSchema,
]);

export type DiagramSpec = z.infer<typeof diagramSchema>;
export type ArchitectureSpec = z.infer<typeof architectureSchema>;
export type NetworkSpec = z.infer<typeof networkSchema>;
export type PipelineSpec = z.infer<typeof pipelineSchema>;
export type SequenceSpec = z.infer<typeof sequenceSchema>;
export type BufferSpec = z.infer<typeof bufferSchema>;
export type MetricSpec = z.infer<typeof metricSchema>;
export const DIAGRAM_TYPES = ["architecture", "network", "pipeline", "sequence", "buffer", "metric"] as const;
