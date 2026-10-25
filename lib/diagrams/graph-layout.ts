import type { ELK as ElkType } from "elkjs/lib/elk-api";
import type { ElkNode, ElkExtendedEdge } from "elkjs/lib/elk-api";
import { elbowRoute, labelAnchor, type Pt, type Rect } from "./geometry";
import { LINK_STYLE, ROLE_DEFAULTS, type BrandName, type DiagramTone, type IconName } from "./names";
import { nodeBox, textWidth, type NodeBox } from "./measure";
import type { ArchitectureSpec, NetworkSpec } from "./schema";

/* ---------- model ---------- */

export type GNode = {
  id: string; label: string; sub?: string; icon?: IconName; brand?: BrandName; tone: DiagramTone;
  group?: string; step?: number; x?: number; y?: number;
};
export type GGroup = { id: string; label: string; tone: DiagramTone; parent?: string };
export type GEdge = {
  id: string; from: string; to: string; label?: string; tone: DiagramTone;
  dashed: boolean; both: boolean; animated: boolean;
};
export type GraphModel = { direction: "auto" | "right" | "down"; nodes: GNode[]; groups: GGroup[]; edges: GEdge[] };

export function architectureModel(spec: ArchitectureSpec): GraphModel {
  return {
    direction: spec.direction ?? "auto",
    nodes: spec.nodes.map((n) => ({ id: n.id, label: n.label, sub: n.sub, icon: n.icon, brand: n.brand, tone: n.tone ?? "plain", group: n.group, step: n.step, x: n.x, y: n.y })),
    groups: (spec.groups ?? []).map((g) => ({ id: g.id, label: g.label, tone: g.tone ?? "plain", parent: g.parent })),
    edges: (spec.edges ?? []).map((e, i) => ({
      id: `e${i}`, from: e.from, to: e.to, label: e.label, tone: e.tone ?? "main", dashed: e.dashed ?? false,
      both: e.bidirectional ?? false, animated: e.animated ?? !e.dashed,
    })),
  };
}

export function networkModel(spec: NetworkSpec): GraphModel {
  return {
    direction: spec.direction ?? "auto",
    nodes: spec.nodes.map((n) => {
      const def = n.role ? ROLE_DEFAULTS[n.role] : undefined;
      return {
        id: n.id, label: n.label, sub: n.sub, brand: n.brand,
        icon: n.icon ?? (n.brand ? undefined : def?.icon), tone: n.tone ?? def?.tone ?? "plain", group: n.zone,
      };
    }),
    groups: (spec.zones ?? []).map((z) => ({ id: z.id, label: z.label, tone: z.tone ?? "plain", parent: z.parent })),
    edges: spec.links.map((l, i) => {
      const style = LINK_STYLE[l.kind ?? "data"];
      return {
        id: `e${i}`, from: l.from, to: l.to, label: l.label, tone: style.tone, dashed: style.dashed,
        both: l.bidirectional ?? true, animated: !style.dashed && l.kind !== "data",
      };
    }),
  };
}

/* ---------- result ---------- */

export type LaidNode = GNode & Rect & { box: NodeBox };
export type LaidGroup = GGroup & Rect & { depth: number };
export type LaidEdge = GEdge & { points: Pt[]; labelAt?: Pt };
export type GraphLayout = {
  width: number; height: number; nodes: LaidNode[]; groups: LaidGroup[]; edges: LaidEdge[];
  engine: "elk" | "grid" | "manual"; vertical: boolean;
};

const MARGIN = 8;
const GROUP_PAD = { top: 36, side: 18, bottom: 18 };
const LABEL_H = 14;

function boxes(model: GraphModel): Map<string, NodeBox> {
  return new Map(model.nodes.map((n) => [n.id, nodeBox(n)]));
}
function depthOf(g: GGroup, byId: Map<string, GGroup>): number {
  let d = 0;
  for (let cur = g.parent ? byId.get(g.parent) : undefined; cur; cur = cur.parent ? byId.get(cur.parent) : undefined) d++;
  return d;
}
function normalize(l: GraphLayout): GraphLayout {
  const xs = [...l.nodes, ...l.groups].map((r) => r.x), ys = [...l.nodes, ...l.groups].map((r) => r.y);
  const dx = MARGIN - Math.min(...xs), dy = MARGIN - Math.min(...ys);
  const shift = (p: Pt) => ({ x: p.x + dx, y: p.y + dy });
  const out = {
    ...l,
    nodes: l.nodes.map((n) => ({ ...n, x: n.x + dx, y: n.y + dy })),
    groups: l.groups.map((g) => ({ ...g, x: g.x + dx, y: g.y + dy })),
    edges: l.edges.map((e) => ({ ...e, points: e.points.map(shift), labelAt: e.labelAt && shift(e.labelAt) })),
  };
  const all = [...out.nodes, ...out.groups];
  out.width = Math.ceil(Math.max(...all.map((r) => r.x + r.w)) + MARGIN);
  out.height = Math.ceil(Math.max(...all.map((r) => r.y + r.h)) + MARGIN);
  return out;
}

/* ---------- group bounds from members (manual and grid layouts) ---------- */

function groupRects(model: GraphModel, nodes: Map<string, Rect>): LaidGroup[] {
  const byId = new Map(model.groups.map((g) => [g.id, g]));
  const rect = new Map<string, Rect>();
  const grow = (id: string, r: Rect) => {
    const cur = rect.get(id);
    if (!cur) { rect.set(id, { ...r }); return; }
    const x = Math.min(cur.x, r.x), y = Math.min(cur.y, r.y);
    rect.set(id, { x, y, w: Math.max(cur.x + cur.w, r.x + r.w) - x, h: Math.max(cur.y + cur.h, r.y + r.h) - y });
  };
  for (const n of model.nodes) {
    const r = nodes.get(n.id)!;
    for (let g = n.group ? byId.get(n.group) : undefined; g; g = g.parent ? byId.get(g.parent) : undefined) grow(g.id, r);
  }
  // Inflate deepest groups first so parents wrap the padded children.
  const order = [...model.groups].filter((g) => rect.has(g.id)).sort((a, b) => depthOf(b, byId) - depthOf(a, byId));
  for (const g of order) {
    const r = rect.get(g.id)!;
    const padded = { x: r.x - GROUP_PAD.side, y: r.y - GROUP_PAD.top, w: r.w + GROUP_PAD.side * 2, h: r.h + GROUP_PAD.top + GROUP_PAD.bottom };
    rect.set(g.id, padded);
    if (g.parent && byId.has(g.parent)) grow(g.parent, padded);
  }
  return order.reverse().map((g) => ({ ...g, ...rect.get(g.id)!, depth: depthOf(g, byId) }));
}

function routeEdges(model: GraphModel, rects: Map<string, Rect>, vertical: boolean): LaidEdge[] {
  const lanes = new Map<string, number>();
  return model.edges.map((e) => {
    const key = `${e.from}>${e.to}`;
    const lane = lanes.get(key) ?? 0;
    lanes.set(key, lane + 1);
    const a = rects.get(e.from)!, b = rects.get(e.to)!;
    // Nodes that share a row connect sideways even in a vertical layout.
    const sameRow = a.y < b.y + b.h && b.y < a.y + a.h;
    const points = elbowRoute(a, b, vertical && !sameRow, lane);
    return { ...e, points, labelAt: e.label ? labelAnchor(points) : undefined };
  });
}

/* ---------- manual coordinates ---------- */

export function manualLayout(model: GraphModel): GraphLayout {
  const b = boxes(model);
  const rects = new Map<string, Rect>();
  const nodes: LaidNode[] = model.nodes.map((n) => {
    const box = b.get(n.id)!;
    const rect = { x: n.x ?? 0, y: n.y ?? 0, w: box.w, h: box.h };
    rects.set(n.id, rect);
    return { ...n, ...rect, box };
  });
  const vertical = model.direction === "down";
  return normalize({ width: 0, height: 0, nodes, groups: groupRects(model, rects), edges: routeEdges(model, rects, vertical), engine: "manual", vertical });
}

/* ---------- fallback grid ---------- */

/** Deterministic, synchronous layout used when ELK is unavailable: groups become bands, nodes wrap into rows. */
export function gridLayout(model: GraphModel): GraphLayout {
  const b = boxes(model);
  const groupById = new Map(model.groups.map((g) => [g.id, g]));
  const top = (g?: string): string => {
    let cur = g ? groupById.get(g) : undefined;
    while (cur?.parent && groupById.has(cur.parent)) cur = groupById.get(cur.parent);
    return cur?.id ?? "";
  };
  const bands = new Map<string, GNode[]>();
  for (const n of model.nodes) bands.set(top(n.group), [...(bands.get(top(n.group)) ?? []), n]);
  const cellW = Math.max(...[...b.values()].map((x) => x.w)) + 56;
  const cellH = Math.max(...[...b.values()].map((x) => x.h)) + 44;
  const cols = Math.max(2, Math.min(5, Math.ceil(Math.sqrt(model.nodes.length * 1.4))));
  const rects = new Map<string, Rect>();
  let y = GROUP_PAD.top;
  for (const members of bands.values()) {
    members.forEach((n, i) => {
      const box = b.get(n.id)!;
      const cx = (i % cols) * cellW + cellW / 2, cy = y + Math.floor(i / cols) * cellH + cellH / 2;
      rects.set(n.id, { x: cx - box.w / 2 + GROUP_PAD.side, y: cy - box.h / 2, w: box.w, h: box.h });
    });
    y += Math.ceil(members.length / cols) * cellH + GROUP_PAD.top + GROUP_PAD.bottom;
  }
  const nodes: LaidNode[] = model.nodes.map((n) => ({ ...n, ...rects.get(n.id)!, box: b.get(n.id)! }));
  return normalize({ width: 0, height: 0, nodes, groups: groupRects(model, rects), edges: routeEdges(model, rects, true), engine: "grid", vertical: true });
}

/* ---------- ELK ---------- */

let elkPromise: Promise<ElkType> | undefined;
async function getElk(): Promise<ElkType> {
  elkPromise ??= import("elkjs/lib/elk.bundled.js").then((m) => new (m.default as unknown as new () => ElkType)());
  return elkPromise;
}

const LAYOUT_OPTIONS = {
  "elk.algorithm": "layered",
  "elk.hierarchyHandling": "INCLUDE_CHILDREN",
  "elk.edgeRouting": "ORTHOGONAL",
  "elk.json.edgeCoords": "ROOT",
  "elk.json.shapeCoords": "ROOT",
  "elk.spacing.nodeNode": "30",
  "elk.layered.spacing.nodeNodeBetweenLayers": "56",
  "elk.layered.spacing.edgeNodeBetweenLayers": "24",
  "elk.layered.spacing.edgeEdgeBetweenLayers": "14",
  "elk.spacing.edgeEdge": "14",
  "elk.spacing.edgeNode": "20",
  "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
  "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
  "elk.layered.nodePlacement.favorStraightEdges": "true",
  "elk.layered.edgeLabels.centerLabelPlacementStrategy": "TAIL_LAYER",
  "elk.separateConnectedComponents": "false",
} as const;

function buildElkGraph(model: GraphModel, vertical: boolean): ElkNode {
  const b = boxes(model);
  const children = new Map<string, ElkNode[]>();
  const push = (parent: string, node: ElkNode) => children.set(parent, [...(children.get(parent) ?? []), node]);
  for (const n of model.nodes) push(n.group ?? "", { id: n.id, width: b.get(n.id)!.w, height: b.get(n.id)!.h });
  const byId = new Map(model.groups.map((g) => [g.id, g]));
  const build = (g: GGroup): ElkNode => ({
    id: g.id,
    children: [...(children.get(g.id) ?? []), ...model.groups.filter((c) => c.parent === g.id).map(build)],
    layoutOptions: { "elk.padding": `[top=${GROUP_PAD.top},left=${GROUP_PAD.side},bottom=${GROUP_PAD.bottom},right=${GROUP_PAD.side}]` },
  });
  const roots = [...(children.get("") ?? []), ...model.groups.filter((g) => !g.parent || !byId.has(g.parent)).map(build)];
  const edges: ElkExtendedEdge[] = model.edges.map((e) => ({
    id: e.id, sources: [e.from], targets: [e.to],
    labels: e.label ? [{ id: `${e.id}-l`, text: e.label, width: Math.ceil(textWidth(e.label, 10.5)) + 10, height: LABEL_H, layoutOptions: { "elk.edgeLabels.inline": "true" } }] : [],
  }));
  return { id: "root", layoutOptions: { ...LAYOUT_OPTIONS, "elk.direction": vertical ? "DOWN" : "RIGHT", "elk.padding": "[top=0,left=0,bottom=0,right=0]" }, children: roots, edges };
}

function readElk(model: GraphModel, laid: ElkNode, vertical: boolean): GraphLayout {
  const b = boxes(model);
  const byId = new Map(model.groups.map((g) => [g.id, g]));
  const pos = new Map<string, Rect>();
  const walk = (n: ElkNode) => { for (const c of n.children ?? []) { pos.set(c.id, { x: c.x ?? 0, y: c.y ?? 0, w: c.width ?? 0, h: c.height ?? 0 }); walk(c); } };
  walk(laid);
  const nodes: LaidNode[] = model.nodes.map((n) => ({ ...n, ...pos.get(n.id)!, box: b.get(n.id)! }));
  const groups: LaidGroup[] = model.groups.filter((g) => pos.has(g.id)).map((g) => ({ ...g, ...pos.get(g.id)!, depth: depthOf(g, byId) }));
  const elkEdges = new Map((laid.edges ?? []).map((e) => [e.id, e as ElkExtendedEdge]));
  const edges: LaidEdge[] = model.edges.map((e) => {
    const ee = elkEdges.get(e.id);
    const points: Pt[] = [];
    for (const s of ee?.sections ?? []) points.push(s.startPoint, ...(s.bendPoints ?? []), s.endPoint);
    // ELK emits sub-pixel jitter between "aligned" bends; snap it so segments stay strictly orthogonal.
    for (let i = 1; i < points.length; i++) {
      if (Math.abs(points[i].x - points[i - 1].x) < 1.5) points[i] = { ...points[i], x: points[i - 1].x };
      if (Math.abs(points[i].y - points[i - 1].y) < 1.5) points[i] = { ...points[i], y: points[i - 1].y };
    }
    const label = ee?.labels?.[0];
    const labelAt = label && label.x !== undefined && label.y !== undefined
      ? { x: label.x + (label.width ?? 0) / 2, y: label.y + (label.height ?? 0) / 2 }
      : e.label && points.length > 1 ? labelAnchor(points) : undefined;
    return { ...e, points: points.length > 1 ? points : elbowRoute(pos.get(e.from)!, pos.get(e.to)!, vertical), labelAt };
  });
  return normalize({ width: 0, height: 0, nodes, groups, edges, engine: "elk", vertical });
}

async function runElk(model: GraphModel, vertical: boolean): Promise<GraphLayout> {
  const elk = await getElk();
  return readElk(model, await elk.layout(buildElkGraph(model, vertical)), vertical);
}

const cache = new Map<string, GraphLayout>();
const ELK_TIMEOUT_MS = 4000;
const READABLE_W = 780; // typical figure width in the article column
const MAX_H = 1100;

/** How well a layout reads at article width: 1 is full size, lower means shrunk text or a very tall figure. */
const readability = (l: GraphLayout) => Math.min(1, READABLE_W / l.width, MAX_H / l.height);

/**
 * Lays a graph out: manual coordinates when every node has them, otherwise ELK, otherwise the grid fallback.
 * Never throws. `auto` direction lays out both ways and keeps the one that reads better at article width
 * (left-to-right wins ties, since it is the natural reading order for flows).
 */
export async function layoutGraph(model: GraphModel): Promise<GraphLayout> {
  if (model.nodes.every((n) => n.x !== undefined && n.y !== undefined)) return manualLayout(model);
  const key = JSON.stringify(model);
  const hit = cache.get(key);
  if (hit) return hit;
  try {
    const run = async () => {
      if (model.direction === "down") return runElk(model, true);
      const right = await runElk(model, false);
      if (model.direction === "right" || readability(right) >= 0.95) return right;
      const down = await runElk(model, true);
      return readability(down) > readability(right) * 1.15 ? down : right;
    };
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("ELK timeout")), ELK_TIMEOUT_MS); });
    const laid = await Promise.race([run(), timeout]).finally(() => clearTimeout(timer));
    if (cache.size > 100) cache.clear();
    cache.set(key, laid);
    return laid;
  } catch (error) {
    console.error("[diagrams] ELK layout failed, using grid fallback:", error);
    return gridLayout(model);
  }
}
