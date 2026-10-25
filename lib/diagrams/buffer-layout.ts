import { textWidth, wrapText } from "./measure";
import { niceTicks } from "./scale";
import type { BufferSpec } from "./schema";
import type { DiagramTone } from "./names";

export type BSegment = { x: number; w: number; label?: string; tone: DiagramTone; text: string };
export type BTrack = { id: string; y: number; labelLines: string[]; subLine?: string; segments: BSegment[] };
export type BMarker = { x: number; label: string; labelW: number; level: number; tone: DiagramTone };
export type BSpan = { x1: number; x2: number; y: number; label: string; tone: DiagramTone };
export type BufferLayout = {
  width: number; height: number; plotLeft: number; plotRight: number; axisY: number; trackTop: number; trackH: number; barH: number;
  ticks: { x: number; label: string }[]; tracks: BTrack[]; markers: BMarker[]; spans: BSpan[];
};

const WIDTH = 900, LABEL_W = 150, RIGHT = 24, ROW = 52, BAR = 28, LEVEL_H = 24, SPAN_H = 30;

export function layoutBuffer(spec: BufferSpec): BufferLayout {
  const { start, end } = spec.range;
  const plotLeft = LABEL_W + 16, plotRight = WIDTH - RIGHT;
  const sx = (v: number) => plotLeft + ((v - start) / (end - start)) * (plotRight - plotLeft);

  // Markers: greedy stacking so neighboring labels never collide.
  const markers = [...(spec.markers ?? [])].sort((a, b) => a.at - b.at).map((m) => ({ x: sx(m.at), label: m.label, labelW: textWidth(m.label, 10.5, 600) + 14, tone: m.tone ?? "white", level: 0 }));
  const lastRight: number[] = [];
  for (const m of markers) {
    let level = 0;
    while (lastRight[level] !== undefined && lastRight[level] > m.x - m.labelW / 2 - 6) level++;
    m.level = level;
    lastRight[level] = m.x + m.labelW / 2;
  }
  const levels = markers.length ? Math.max(...markers.map((m) => m.level)) + 1 : 0;

  // Spans: stacked brackets, one level each unless their ranges are disjoint.
  const spanRows: number[] = [];
  const spanLevels = (spec.spans ?? []).map((s) => {
    const [a, b] = [sx(s.start), sx(s.end)];
    let level = 0;
    while (spanRows[level] !== undefined && spanRows[level] > a - 6) level++;
    spanRows[level] = Math.max(b, textWidth(s.label, 10.5) / 2 + (a + b) / 2);
    return level;
  });
  const spanBlock = spanRows.length * SPAN_H;
  const markerBlock = levels * LEVEL_H;
  const top = markerBlock + spanBlock + (markerBlock || spanBlock ? 10 : 0);

  const spans: BSpan[] = (spec.spans ?? []).map((s, i) => ({ x1: sx(s.start), x2: sx(s.end), y: markerBlock + spanLevels[i] * SPAN_H + 18, label: s.label, tone: s.tone ?? "amber" }));
  const tracks: BTrack[] = spec.tracks.map((t, i) => ({
    id: t.id, y: top + i * ROW + (ROW - BAR) / 2,
    labelLines: wrapText(t.label, LABEL_W, 12, 600, 2),
    subLine: t.sub ? wrapText(t.sub, LABEL_W, 10, 400, 1)[0] : undefined,
    segments: t.segments.map((s) => {
      const x = sx(s.start), w = Math.max(2, sx(s.end) - x);
      const fits = s.label && textWidth(s.label, 10.5, 600) + 14 <= w;
      return { x, w, label: fits ? s.label : undefined, tone: s.tone ?? "main", text: `${s.label ?? ""} ${s.start}-${s.end} ${spec.unit}`.trim() };
    }),
  }));
  const axisY = top + spec.tracks.length * ROW + 6;
  const ticks = niceTicks(start, end, 8).map((v) => ({ x: sx(v), label: String(v) }));
  return { width: WIDTH, height: axisY + 40, plotLeft, plotRight, axisY, trackTop: top, trackH: ROW, barH: BAR, ticks, tracks, markers, spans };
}
