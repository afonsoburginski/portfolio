import type { BufferSpec } from "@/lib/diagrams/schema";
import { layoutBuffer } from "@/lib/diagrams/buffer-layout";
import { EDGE_COLOR, TEXT, TONE } from "@/lib/diagrams/tones";
import { Frame, HaloText } from "./shared";

/** Time-axis view of buffers: tracks of segments, vertical markers (playhead, live edge) and bracketed ranges. */
export function BufferTimeline({ spec }: { spec: BufferSpec }) {
  const L = layoutBuffer(spec);
  const connections = [
    ...spec.tracks.flatMap((t) => t.segments.map((s) => `${t.label}: ${s.label ?? "segment"} from ${s.start} to ${s.end} ${spec.unit}`)),
    ...(spec.markers ?? []).map((m) => `Marker ${m.label} at ${m.at} ${spec.unit}`),
    ...(spec.spans ?? []).map((s) => `Range ${s.label}: ${s.start} to ${s.end} ${spec.unit}`),
  ];
  const bottom = L.axisY - 6;
  return (
    <Frame spec={spec} width={L.width} height={L.height} connections={connections} readableWidth={640}>
      {L.ticks.map((t) => (
        <g key={t.label}>
          <line x1={t.x} x2={t.x} y1={L.trackTop - 4} y2={L.axisY} stroke="rgba(255,255,255,.07)" />
          <text x={t.x} y={L.axisY + 18} textAnchor="middle" fontSize={10.5} fill={TEXT.muted}>{t.label}</text>
        </g>
      ))}
      <line x1={L.plotLeft} x2={L.plotRight} y1={L.axisY} y2={L.axisY} stroke="rgba(255,255,255,.25)" />
      <text x={L.plotRight} y={L.axisY + 34} textAnchor="end" fontSize={10.5} fill={TEXT.muted}>time ({spec.unit})</text>

      {L.spans.map((s, i) => (
        <g key={`s${i}`}>
          <path d={`M${s.x1} ${s.y + 6}V${s.y}H${s.x2}V${s.y + 6}`} fill="none" stroke={EDGE_COLOR[s.tone]} strokeWidth={1.5} strokeLinejoin="round" />
          <HaloText x={(s.x1 + s.x2) / 2} y={s.y - 5} color={EDGE_COLOR[s.tone]}>{s.label}</HaloText>
        </g>
      ))}

      {L.tracks.map((t) => (
        <g key={t.id}>
          <rect x={L.plotLeft} y={t.y - 4} width={L.plotRight - L.plotLeft} height={L.barH + 8} rx={8} fill="rgba(255,255,255,.025)" />
          {(() => {
            const block = t.labelLines.length * 14 + (t.subLine ? 13 : 0);
            const top = t.y + L.barH / 2 - block / 2;
            return (
              <>
                {t.labelLines.map((line, i) => <text key={i} x={0} y={top + 11 + i * 14} fontSize={12} fontWeight={600} fill={TEXT.primary}>{line}</text>)}
                {t.subLine && <text x={0} y={top + t.labelLines.length * 14 + 10} fontSize={10} fill={TEXT.muted}>{t.subLine}</text>}
              </>
            );
          })()}
          {t.segments.map((s, i) => {
            const tone = TONE[s.tone];
            return (
              <g key={i}>
                <title>{s.text}</title>
                <rect x={s.x} y={t.y} width={s.w} height={L.barH} rx={6} fill={tone.accent} fillOpacity={0.16} stroke={tone.accent} strokeOpacity={0.85} strokeWidth={1.5} />
                {s.label && <text x={s.x + s.w / 2} y={t.y + L.barH / 2 + 4} textAnchor="middle" fontSize={10.5} fontWeight={600} fill={TEXT.primary}>{s.label}</text>}
              </g>
            );
          })}
        </g>
      ))}

      {L.markers.map((m, i) => {
        const color = EDGE_COLOR[m.tone];
        const y = m.level * 24;
        return (
          <g key={`m${i}`}>
            <line x1={m.x} x2={m.x} y1={y + 20} y2={bottom} stroke={color} strokeWidth={1.5} strokeDasharray="4 4" />
            <rect x={m.x - m.labelW / 2} y={y + 2} width={m.labelW} height={18} rx={9} fill="#0d1117" stroke={color} />
            <text x={m.x} y={y + 14.5} textAnchor="middle" fontSize={10.5} fontWeight={600} fill={TEXT.primary}>{m.label}</text>
          </g>
        );
      })}
    </Frame>
  );
}
