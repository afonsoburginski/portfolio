import { elbowRoute, type Pt, type Rect } from "./geometry";
import { nodeBox, type NodeBox } from "./measure";
import type { DiagramTone, BrandName, IconName } from "./names";
import type { PipelineSpec } from "./schema";

export type PStage = Rect & { id: string; label: string; sub?: string; icon?: IconName; brand?: BrandName; tone: DiagramTone; step?: number; box: NodeBox };
export type PLane = Rect & { id: string; label: string; tone: DiagramTone };
export type PArrow = { id: string; points: Pt[]; tone: DiagramTone; dashed: boolean; flow: boolean; label?: string; labelAt?: Pt; labelAnchor: "start" | "middle" };
export type PipelineLayout = { width: number; height: number; lanes: PLane[]; stages: PStage[]; arrows: PArrow[] };

const PAD_X = 20, LANE_TOP = 38, LANE_BOTTOM = 22, GAP_X = 52, GAP_Y = 64;

/** Deterministic swim-lane layout: stage i of every lane shares column i, lanes stack top to bottom. */
export function layoutPipeline(spec: PipelineSpec): PipelineLayout {
  const boxes = spec.lanes.map((l) => l.stages.map((s) => nodeBox(s)));
  const colW = Math.max(...boxes.flat().map((b) => b.w));
  const cols = Math.max(...spec.lanes.map((l) => l.stages.length));
  const laneW = PAD_X * 2 + cols * colW + (cols - 1) * GAP_X;
  const stages: PStage[] = [], lanes: PLane[] = [], arrows: PArrow[] = [];
  const byId = new Map<string, { stage: PStage; lane: number }>();

  let y = 0;
  spec.lanes.forEach((lane, li) => {
    const rowH = Math.max(...boxes[li].map((b) => b.h));
    const h = LANE_TOP + rowH + LANE_BOTTOM;
    lanes.push({ id: lane.id, label: lane.label, tone: lane.tone ?? "plain", x: 0, y, w: laneW, h });
    const centerY = y + LANE_TOP + rowH / 2;
    const used = lane.stages.length * colW + (lane.stages.length - 1) * GAP_X;
    const startX = PAD_X + (cols * colW + (cols - 1) * GAP_X - used) / 2; // short lanes are centered, columns stay aligned only when full
    const leftAligned = PAD_X;
    lane.stages.forEach((s, si) => {
      const box = boxes[li][si];
      const cx = (lane.stages.length === cols ? leftAligned : startX) + si * (colW + GAP_X) + colW / 2;
      const stage: PStage = { id: s.id, label: s.label, sub: s.sub, icon: s.icon, brand: s.brand, tone: s.tone ?? "plain", step: s.step, box, x: cx - box.w / 2, y: centerY - box.h / 2, w: box.w, h: box.h };
      stages.push(stage);
      byId.set(s.id, { stage, lane: li });
    });
    if (lane.connect !== false) {
      for (let si = 1; si < lane.stages.length; si++) {
        const a = stages.find((s) => s.id === lane.stages[si - 1].id)!, b = stages.find((s) => s.id === lane.stages[si].id)!;
        arrows.push({ id: `${a.id}>${b.id}`, points: [{ x: a.x + a.w, y: centerY }, { x: b.x, y: centerY }], tone: a.tone === "plain" ? "main" : a.tone, dashed: false, flow: true, labelAnchor: "middle" });
      }
    }
    y += h + GAP_Y;
  });

  const gapUse = new Map<number, number>();
  (spec.links ?? []).forEach((link, i) => {
    const from = byId.get(link.from)!, to = byId.get(link.to)!;
    const down = to.lane >= from.lane;
    const a = from.stage, b = to.stage;
    const tone = link.tone ?? "alt";
    const sameLane = from.lane === to.lane;
    let points: Pt[];
    let labelAt: Pt | undefined, anchor: "start" | "middle" = "middle";
    if (sameLane) {
      // Loop under the lane's stages: out of the bottom, across, back into the bottom.
      const below = Math.max(a.y + a.h, b.y + b.h) + 12;
      points = [{ x: a.x + a.w / 2, y: a.y + a.h }, { x: a.x + a.w / 2, y: below }, { x: b.x + b.w / 2, y: below }, { x: b.x + b.w / 2, y: b.y + b.h }];
      labelAt = { x: (a.x + b.x + (a.w + b.w) / 2) / 2, y: below + 12 };
    } else {
      // Horizontal run goes in the gap just above the target lane (or below it when flowing upward), one track per link.
      const gapKey = down ? to.lane : to.lane + 1;
      const track = gapUse.get(gapKey) ?? 0;
      gapUse.set(gapKey, track + 1);
      const gapTop = down ? lanes[to.lane].y - GAP_Y : lanes[to.lane].y + lanes[to.lane].h;
      const runY = gapTop + GAP_Y / 2 + (track % 2 ? 1 : -1) * Math.ceil(track / 2) * 12;
      const ra: Rect = { x: a.x, y: a.y, w: a.w, h: a.h }, rb: Rect = { x: b.x, y: b.y, w: b.w, h: b.h };
      if (Math.abs(a.x + a.w / 2 - (b.x + b.w / 2)) < 2) {
        points = elbowRoute(ra, rb, true);
        labelAt = { x: a.x + a.w / 2 + 8, y: runY };
        anchor = "start";
      } else {
        const ax = a.x + a.w / 2, bx = b.x + b.w / 2;
        points = [{ x: ax, y: down ? a.y + a.h : a.y }, { x: ax, y: runY }, { x: bx, y: runY }, { x: bx, y: down ? b.y : b.y + b.h }];
        labelAt = { x: (ax + bx) / 2, y: runY - 6 };
      }
    }
    arrows.push({ id: `link${i}`, points, tone, dashed: link.dashed ?? false, flow: !link.dashed, label: link.label, labelAt: link.label ? labelAt : undefined, labelAnchor: anchor });
  });

  const height = y - GAP_Y;
  return { width: laneW, height, lanes, stages, arrows };
}

