import type { DiagramSpec } from "@/lib/diagrams/schema";
import { parseDiagramSource } from "@/lib/diagrams/validate";
import { ArchitectureDiagram, NetworkTopology } from "./graph-figure";
import { BufferTimeline } from "./buffer-timeline";
import { MetricChart } from "./metric-chart";
import { PipelineDiagram } from "./pipeline-diagram";
import { SequenceDiagram } from "./sequence-diagram";

export function DiagramByType({ spec }: { spec: DiagramSpec }) {
  switch (spec.type) {
    case "architecture": return <ArchitectureDiagram spec={spec} />;
    case "network": return <NetworkTopology spec={spec} />;
    case "pipeline": return <PipelineDiagram spec={spec} />;
    case "sequence": return <SequenceDiagram spec={spec} />;
    case "buffer": return <BufferTimeline spec={spec} />;
    case "metric": return <MetricChart spec={spec} />;
  }
}

/** Renders a ```diagram JSON block. An invalid block never breaks the article: it logs and shows a quiet placeholder. */
export function DeclarativeDiagram({ source }: { source: string }) {
  const result = parseDiagramSource(source);
  if (!result.ok) {
    console.error(`[diagrams] invalid diagram block:\n${result.errors.map((e) => `  - ${e}`).join("\n")}`);
    return (
      <div role="note" className="not-prose my-10 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-4 text-sm text-white/40">
        This diagram could not be displayed.
      </div>
    );
  }
  return <DiagramByType spec={result.spec} />;
}
