export type Pt = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };

/** Polyline with rounded corners as an SVG path. Collinear and duplicate points are dropped first. */
export function roundedPath(points: Pt[], radius = 8): string {
  const pts = points.filter((p, i) => i === 0 || p.x !== points[i - 1].x || p.y !== points[i - 1].y);
  const clean = pts.filter((p, i) => {
    if (i === 0 || i === pts.length - 1) return true;
    const a = pts[i - 1], b = pts[i + 1];
    return !((a.x === p.x && p.x === b.x) || (a.y === p.y && p.y === b.y));
  });
  if (clean.length < 2) return "";
  let d = `M${r(clean[0].x)} ${r(clean[0].y)}`;
  for (let i = 1; i < clean.length - 1; i++) {
    const prev = clean[i - 1], cur = clean[i], next = clean[i + 1];
    const inLen = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    const outLen = Math.hypot(next.x - cur.x, next.y - cur.y);
    const rad = Math.min(radius, inLen / 2, outLen / 2);
    const a = { x: cur.x - ((cur.x - prev.x) / inLen) * rad, y: cur.y - ((cur.y - prev.y) / inLen) * rad };
    const b = { x: cur.x + ((next.x - cur.x) / outLen) * rad, y: cur.y + ((next.y - cur.y) / outLen) * rad };
    d += `L${r(a.x)} ${r(a.y)}Q${r(cur.x)} ${r(cur.y)} ${r(b.x)} ${r(b.y)}`;
  }
  const last = clean[clean.length - 1];
  return `${d}L${r(last.x)} ${r(last.y)}`;
}
const r = (n: number) => Math.round(n * 10) / 10;

/** Midpoint of the longest segment: where an edge label reads best when the layout gives no label position. */
export function labelAnchor(points: Pt[]): Pt {
  let best = { len: -1, at: points[0] };
  for (let i = 1; i < points.length; i++) {
    const len = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    if (len > best.len) best = { len, at: { x: (points[i].x + points[i - 1].x) / 2, y: (points[i].y + points[i - 1].y) / 2 } };
  }
  return best.at;
}

export function rectsOverlap(a: Rect, b: Rect, pad = 0): boolean {
  return a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;
}

/** Orthogonal route between two boxes: straight when aligned, otherwise one elbow through the gap. */
export function elbowRoute(a: Rect, b: Rect, vertical: boolean, lane = 0): Pt[] {
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  if (vertical) {
    const down = bc.y >= ac.y;
    const y1 = down ? a.y + a.h : a.y;
    const y2 = down ? b.y : b.y + b.h;
    const x = overlapMid(a.x, a.x + a.w, b.x, b.x + b.w);
    if (x !== undefined) return [{ x, y: y1 }, { x, y: y2 }];
    const mid = (y1 + y2) / 2 + lane * 8;
    return [{ x: ac.x, y: y1 }, { x: ac.x, y: mid }, { x: bc.x, y: mid }, { x: bc.x, y: y2 }];
  }
  const right = bc.x >= ac.x;
  const x1 = right ? a.x + a.w : a.x;
  const x2 = right ? b.x : b.x + b.w;
  const y = overlapMid(a.y, a.y + a.h, b.y, b.y + b.h);
  if (y !== undefined) return [{ x: x1, y }, { x: x2, y }];
  const mid = (x1 + x2) / 2 + lane * 8;
  return [{ x: x1, y: ac.y }, { x: mid, y: ac.y }, { x: mid, y: bc.y }, { x: x2, y: bc.y }];
}
function overlapMid(a0: number, a1: number, b0: number, b1: number): number | undefined {
  const lo = Math.max(a0, b0) + 12, hi = Math.min(a1, b1) - 12;
  return lo <= hi ? (lo + hi) / 2 : undefined;
}
