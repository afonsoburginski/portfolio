import type { MetricSpec } from "@/lib/diagrams/schema";
import { layoutMetric } from "@/lib/diagrams/metric-layout";
import { EDGE_COLOR, TEXT, TONE } from "@/lib/diagrams/tones";
import { Frame, HaloText } from "./shared";

/** Line or grouped-bar chart with threshold lines. Always shows whether the data is illustrative or measured. */
export function MetricChart({ spec }: { spec: MetricSpec }) {
  const L = layoutMetric(spec);
  const unit = spec.y.unit ?? "";
  const connections = [
    ...spec.series.map((s) => `${s.name}: ${s.values.map((v, i) => `${spec.x.values[i]} = ${v === null ? "no data" : `${v}${unit}`}`).join(", ")}`),
    ...(spec.thresholds ?? []).map((t) => `Threshold ${t.label}: ${t.value}${unit}`),
  ];
  const legend = spec.series.length > 1 || spec.chart === "line"
    ? spec.series.map((s, i) => ({ color: EDGE_COLOR[L.series[i].tone], label: s.name }))
    : undefined;
  const badge = spec.data === "illustrative" ? "Illustrative data" : "Measured";
  const { l, r, t, b } = L.plot;
  return (
    <Frame spec={spec} width={L.width} height={L.height} connections={[...connections, spec.data === "measured" ? `Method: ${spec.method}` : "Illustrative data, not a measurement."]} legend={legend} badge={badge} readableWidth={600}>
      {L.yTicks.map((tick) => (
        <g key={tick.label + tick.y}>
          <line x1={l} x2={r} y1={tick.y} y2={tick.y} stroke="rgba(255,255,255,.07)" />
          <text x={l - 8} y={tick.y + 3.5} textAnchor="end" fontSize={10.5} fill={TEXT.muted}>{tick.label}</text>
        </g>
      ))}
      <line x1={l} x2={r} y1={b} y2={b} stroke="rgba(255,255,255,.25)" />
      {L.xTicks.map((tick) => <text key={tick.label + tick.x} x={tick.x} y={b + 18} textAnchor="middle" fontSize={10.5} fill={TEXT.muted}>{tick.label}</text>)}
      <text x={(l + r) / 2} y={b + 38} textAnchor="middle" fontSize={11} fill={TEXT.muted}>{L.xLabel}</text>
      <text transform={`translate(8 ${(t + b) / 2}) rotate(-90)`} textAnchor="middle" fontSize={11} fill={TEXT.muted}>{L.yLabel}</text>

      {L.bars.map((bar, i) => (
        <g key={i}>
          <title>{bar.title}</title>
          <rect x={bar.x} y={bar.y} width={bar.w} height={bar.h} rx={4} fill={TONE[bar.tone].accent} fillOpacity={0.2} stroke={TONE[bar.tone].accent} strokeWidth={1.5} />
          {bar.label && <text x={bar.x + bar.w / 2} y={bar.y - 6} textAnchor="middle" fontSize={10.5} fontWeight={600} fill={TEXT.primary}>{bar.label}</text>}
        </g>
      ))}
      {L.series.map((s) => spec.chart === "line" && (
        <g key={s.name}>
          <path d={s.path} fill="none" stroke={EDGE_COLOR[s.tone]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          {s.points.map((p, i) => p && (
            <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#0d1117" stroke={EDGE_COLOR[s.tone]} strokeWidth={1.8}><title>{`${s.name}, ${spec.x.values[i]}: ${p.value}${unit}`}</title></circle>
          ))}
        </g>
      ))}
      {L.thresholds.map((th) => (
        <g key={th.label}>
          <line x1={l} x2={r} y1={th.y} y2={th.y} stroke={EDGE_COLOR[th.tone]} strokeWidth={1.5} strokeDasharray="5 5" />
          <HaloText x={r - 4} y={th.y - 6} anchor="end" color={EDGE_COLOR[th.tone]}>{th.label}</HaloText>
        </g>
      ))}
    </Frame>
  );
}
