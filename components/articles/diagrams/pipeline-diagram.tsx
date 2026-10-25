import { Edge, Group, RichNode } from "../diagram-kit";
import { roundedPath } from "@/lib/diagrams/geometry";
import { layoutPipeline } from "@/lib/diagrams/pipeline-layout";
import type { PipelineSpec } from "@/lib/diagrams/schema";
import { Frame, diagramKey } from "./shared";

/** Swim lanes: one lane per row, stages left to right, links between lanes routed through the gaps. Fully deterministic. */
export function PipelineDiagram({ spec }: { spec: PipelineSpec }) {
  const id = diagramKey(spec);
  const layout = layoutPipeline(spec);
  const label = new Map(layout.stages.map((s) => [s.id, s.label]));
  const connections = [
    ...spec.lanes.flatMap((l) => (l.connect === false ? [] : l.stages.slice(1).map((s, i) => `${l.label}: ${l.stages[i].label} -> ${s.label}`))),
    ...(spec.links ?? []).map((l) => `${label.get(l.from)} -> ${label.get(l.to)}${l.label ? `: ${l.label}` : ""}`),
  ];
  return (
    <Frame spec={spec} width={layout.width} height={layout.height} connections={connections}>
      {layout.lanes.map((l) => <Group key={l.id} x={l.x} y={l.y} w={l.w} h={l.h} label={l.label} tone={l.tone} />)}
      {layout.arrows.map((a) => (
        <Edge key={a.id} id={id} d={roundedPath(a.points)} tone={a.tone} flow={a.flow} dashed={a.dashed} label={a.label} lx={a.labelAt?.x} ly={a.labelAt?.y} anchor={a.labelAnchor} />
      ))}
      {layout.stages.map((s) => <RichNode key={s.id} x={s.x} y={s.y} w={s.w} h={s.h} box={s.box} icon={s.icon} brand={s.brand} tone={s.tone} step={s.step} />)}
    </Frame>
  );
}
