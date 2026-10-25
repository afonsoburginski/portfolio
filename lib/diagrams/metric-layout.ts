import { textWidth } from "./measure";
import { formatNumber, niceRange } from "./scale";
import type { DiagramTone } from "./names";
import type { MetricSpec } from "./schema";

export type MSeries = { name: string; tone: DiagramTone; points: ({ x: number; y: number; value: number } | null)[]; path: string };
export type MetricLayout = {
  width: number; height: number; plot: { l: number; r: number; t: number; b: number };
  yTicks: { y: number; label: string }[]; xTicks: { x: number; label: string }[];
  series: MSeries[]; bars: { x: number; y: number; w: number; h: number; tone: DiagramTone; title: string; label?: string }[];
  thresholds: { y: number; label: string; labelW: number; tone: DiagramTone }[];
  yLabel: string; xLabel: string;
};

const W = 880, H = 340, TOP = 28, BOTTOM = 62, RIGHT = 28;
const SERIES_TONES: DiagramTone[] = ["main", "alt", "amber", "white", "ok"];

export function layoutMetric(spec: MetricSpec): MetricLayout {
  const values = spec.series.flatMap((s) => s.values.filter((v): v is number => v !== null));
  const thresholdValues = (spec.thresholds ?? []).map((t) => t.value);
  const all = [...values, ...thresholdValues];
  const lo = spec.y.min ?? Math.min(0, ...all), hi = spec.y.max ?? Math.max(...all);
  const range = niceRange(lo, hi);
  const min = spec.y.min ?? range.min, max = spec.y.max ?? range.max;
  const unit = spec.y.unit ?? "";
  const yLabels = range.ticks.filter((v) => v >= min && v <= max).map((v) => `${formatNumber(v)}${unit}`);
  const left = Math.ceil(Math.max(...yLabels.map((l) => textWidth(l, 10.5))) + 22) + 18; // tick labels plus the rotated axis title
  const plot = { l: left, r: W - RIGHT, t: TOP, b: H - BOTTOM };
  const sy = (v: number) => plot.b - ((v - min) / (max - min)) * (plot.b - plot.t);

  const n = spec.x.values.length;
  const band = (plot.r - plot.l) / n;
  const sx = (i: number) => plot.l + band * (i + 0.5);
  const tones = spec.series.map((s, i) => s.tone ?? SERIES_TONES[i % SERIES_TONES.length]);

  const series: MSeries[] = spec.series.map((s, si) => {
    const points = s.values.map((v, i) => (v === null ? null : { x: sx(i), y: sy(v), value: v }));
    let path = "", pen = false;
    for (const p of points) {
      if (!p) { pen = false; continue; }
      path += `${pen ? "L" : "M"}${Math.round(p.x * 10) / 10} ${Math.round(p.y * 10) / 10}`;
      pen = true;
    }
    return { name: s.name, tone: tones[si], points, path };
  });

  const groupW = band * 0.7, barW = Math.min(46, groupW / spec.series.length);
  const bars = spec.chart === "bar"
    ? spec.series.flatMap((s, si) => s.values.flatMap((v, i) => {
      if (v === null) return [];
      const x = sx(i) - (barW * spec.series.length) / 2 + si * barW + 2;
      const y0 = sy(Math.max(min, Math.min(0, max))), y1 = sy(v);
      const single = spec.series.length === 1 && n <= 14;
      return [{ x, y: Math.min(y0, y1), w: barW - 4, h: Math.max(1.5, Math.abs(y1 - y0)), tone: tones[si], title: `${s.name}, ${spec.x.values[i]}: ${v}${unit}`, label: single ? `${formatNumber(v)}${unit}` : undefined }];
    }))
    : [];

  const stride = Math.ceil(Math.max(...spec.x.values.map((v) => textWidth(String(v), 10.5))) / band + 0.2);
  const xTicks = spec.x.values.map((v, i) => ({ x: sx(i), label: String(v) })).filter((_, i) => i % Math.max(1, stride) === 0);

  return {
    width: W, height: H, plot,
    yTicks: range.ticks.filter((v) => v >= min && v <= max).map((v, i) => ({ y: sy(v), label: yLabels[i] })),
    xTicks, series, bars,
    thresholds: (spec.thresholds ?? []).map((t) => ({ y: sy(t.value), label: `${t.label} (${formatNumber(t.value)}${unit})`, labelW: 0, tone: t.tone ?? "warn" })),
    yLabel: spec.y.label, xLabel: spec.x.label,
  };
}
