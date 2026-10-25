import { Edge, Group, RichNode } from "../diagram-kit";
import { roundedPath } from "@/lib/diagrams/geometry";
import { layoutGraph, architectureModel, networkModel, type GraphLayout, type GraphModel } from "@/lib/diagrams/graph-layout";
import { LINK_STYLE, type LinkKind } from "@/lib/diagrams/names";
import { EDGE_COLOR } from "@/lib/diagrams/tones";
import type { ArchitectureSpec, NetworkSpec } from "@/lib/diagrams/schema";
import { Frame, diagramKey } from "./shared";

function GraphSvg({ id, layout }: { id: string; layout: GraphLayout }) {
  return (
    <>
      {[...layout.groups].sort((a, b) => a.depth - b.depth).map((g) => (
        <Group key={g.id} x={g.x} y={g.y} w={g.w} h={g.h} label={g.label} tone={g.tone} />
      ))}
      {layout.edges.map((e) => (
        <Edge
          key={e.id} id={id} d={roundedPath(e.points)} tone={e.tone} both={e.both} flow={e.animated} dashed={e.dashed && !e.animated}
          label={e.label} lx={e.labelAt?.x} ly={e.labelAt ? e.labelAt.y + 3.5 : undefined}
        />
      ))}
      {layout.nodes.map((n) => (
        <RichNode key={n.id} x={n.x} y={n.y} w={n.w} h={n.h} box={n.box} icon={n.icon} brand={n.brand} tone={n.tone} step={n.step} />
      ))}
    </>
  );
}

function connectionsOf(model: GraphModel, arrow: (both: boolean) => string): string[] {
  const label = new Map(model.nodes.map((n) => [n.id, n.label]));
  return model.edges.map((e) => `${label.get(e.from)} ${arrow(e.both)} ${label.get(e.to)}${e.label ? `: ${e.label}` : ""}`);
}

/**
 * Layout runs here, on the server, so the first paint is already the final geometry: no skeleton, no layout shift and
 * no 1 MB layout engine in the browser. If ELK is unavailable the grid fallback is drawn instead.
 */
export async function ArchitectureDiagram({ spec }: { spec: ArchitectureSpec }) {
  const model = architectureModel(spec);
  const layout = await layoutGraph(model);
  return (
    <Frame spec={spec} width={layout.width} height={layout.height} connections={connectionsOf(model, (both) => (both ? "<->" : "->"))}>
      <GraphSvg id={diagramKey(spec)} layout={layout} />
    </Frame>
  );
}

export async function NetworkTopology({ spec }: { spec: NetworkSpec }) {
  const model = networkModel(spec);
  const layout = await layoutGraph(model);
  const used = [...new Set(spec.links.map((l) => l.kind ?? "data"))] as LinkKind[];
  const legend = used.map((k) => ({ color: EDGE_COLOR[LINK_STYLE[k].tone], label: LINK_STYLE[k].label, dashed: LINK_STYLE[k].dashed }));
  return (
    <Frame spec={spec} width={layout.width} height={layout.height} legend={legend} connections={connectionsOf(model, (both) => (both ? "<->" : "->"))}>
      <GraphSvg id={diagramKey(spec)} layout={layout} />
    </Frame>
  );
}
