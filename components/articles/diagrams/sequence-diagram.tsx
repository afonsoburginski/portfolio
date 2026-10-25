import { RichNode, Step } from "../diagram-kit";
import { layoutSequence } from "@/lib/diagrams/sequence-layout";
import type { SequenceSpec } from "@/lib/diagrams/schema";
import { EDGE_COLOR, TEXT, TONE } from "@/lib/diagrams/tones";
import { Frame, HaloText, diagramKey } from "./shared";

const NUM_R = 9;

/** Participants across the top, lifelines down, messages in order. Spacing comes from measured label widths. */
export function SequenceDiagram({ spec }: { spec: SequenceSpec }) {
  const id = diagramKey(spec);
  const layout = layoutSequence(spec);
  const name = new Map(spec.participants.map((p) => [p.id, p.label]));
  let n = 0;
  const connections = spec.steps.flatMap((s) => {
    if (s.kind === "phase") return [`Phase: ${s.label}`];
    if (s.kind === "note") return [`Note over ${(Array.isArray(s.over) ? s.over : [s.over]).map((o) => name.get(o)).join(" and ")}: ${s.text}`];
    return [`${spec.numbered !== false ? `${++n}. ` : ""}${name.get(s.from)} -> ${name.get(s.to)}: ${s.label}${s.style === "return" ? " (return)" : ""}`];
  });
  const markerRefs = (tone: keyof typeof EDGE_COLOR) => `url(#${id}-a-${tone})`;

  return (
    <Frame spec={spec} width={layout.width} height={layout.height} connections={connections} readableWidth={Math.min(layout.width + 32, 720)}>
      {layout.participants.map((p) => (
        <line key={`l-${p.id}`} x1={p.x} x2={p.x} y1={layout.lifelineTop} y2={layout.lifelineBottom} stroke="rgba(255,255,255,.16)" strokeWidth={1.5} strokeDasharray="4 5" />
      ))}
      {layout.rows.map((r, i) => {
        if (r.kind === "phase") {
          return (
            <g key={i}>
              <line x1={0} x2={layout.width} y1={r.y} y2={r.y} stroke="rgba(255,255,255,.1)" />
              <rect x={0} y={r.y - 10} width={r.label.length * 6.4 + 22} height={20} rx={10} fill="#0d1117" stroke="rgba(255,255,255,.18)" />
              <text x={11} y={r.y + 4} fontSize={10.5} fontWeight={600} letterSpacing=".04em" fill={TEXT.muted}>{r.label}</text>
            </g>
          );
        }
        if (r.kind === "note") {
          const t = TONE[r.tone];
          return (
            <g key={i}>
              <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={8} fill="#0d1117" stroke={t.stroke} strokeDasharray="4 3" />
              {r.lines.map((line, k) => <text key={k} x={r.x + 10} y={r.y + 18 + k * 14} fontSize={10.5} fill={TEXT.primary}>{line}</text>)}
            </g>
          );
        }
        const color = EDGE_COLOR[r.tone];
        const dir = r.x2 >= r.x1 ? 1 : -1;
        if (r.self) {
          const d = `M${r.x1} ${r.y - 12}H${r.x1 + 34}Q${r.x1 + 42} ${r.y - 12} ${r.x1 + 42} ${r.y - 4}Q${r.x1 + 42} ${r.y + 4} ${r.x1 + 34} ${r.y + 4}H${r.x1 + 2}`;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray={r.style === "return" ? "4 5" : undefined} className={r.style === "async" ? "dg-flow" : undefined} markerEnd={markerRefs(r.tone)} />
              <HaloText x={r.x1 + 52} y={r.y - 4 + 3.5} anchor="start" color={color}>{r.label}</HaloText>
              {r.n !== undefined && <Step x={r.x1 - 16} y={r.y - 4} n={r.n} />}
            </g>
          );
        }
        const mid = (r.x1 + r.x2) / 2;
        return (
          <g key={i}>
            <line
              x1={r.x1} x2={r.x2 - dir * 1} y1={r.y} y2={r.y} stroke={color} strokeWidth={1.5} strokeLinecap="round"
              strokeDasharray={r.style === "return" ? "4 5" : undefined} className={r.style === "async" ? "dg-flow" : undefined} markerEnd={markerRefs(r.tone)}
            />
            <HaloText x={mid + (r.n !== undefined ? NUM_R : 0)} y={r.y - 9} color={color}>{r.label}</HaloText>
            {r.n !== undefined && <Step x={mid - r.labelW / 2 - 6} y={r.y - 13} n={r.n} />}
          </g>
        );
      })}
      {layout.participants.map((p) => {
        const h = layout.headerH;
        return <RichNode key={p.id} x={p.x - p.box.w / 2} y={0} w={p.box.w} h={h} box={p.box} icon={p.spec.icon} brand={p.spec.brand} tone={p.spec.tone ?? "plain"} />;
      })}
    </Frame>
  );
}
