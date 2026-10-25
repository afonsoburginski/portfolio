import type { ReactNode } from "react";
import { DiagramFigure, type LegendItem } from "../diagram-kit";
import { EDGE_COLOR, TEXT } from "@/lib/diagrams/tones";
import { TONES } from "@/lib/diagrams/names";
import type { DiagramSpec } from "@/lib/diagrams/schema";

/** Stable id for SVG defs and file names: same spec, same id, on server and client. */
export function diagramKey(spec: DiagramSpec): string {
  const json = JSON.stringify(spec);
  let h = 5381;
  for (let i = 0; i < json.length; i++) h = ((h << 5) + h + json.charCodeAt(i)) >>> 0;
  return `dg-${spec.type}-${h.toString(36)}`;
}

export function legendItems(spec: DiagramSpec, derived: LegendItem[] = []): LegendItem[] | undefined {
  if (spec.legend?.length) return spec.legend.map((l) => ({ color: EDGE_COLOR[l.tone], label: l.label, dashed: l.dashed }));
  return derived.length ? derived : undefined;
}

type FrameProps = {
  spec: DiagramSpec;
  width: number;
  height: number;
  connections: string[];
  legend?: LegendItem[];
  badge?: string;
  /** Narrowest width at which the text still reads; below it the figure scrolls horizontally. */
  readableWidth?: number;
  children: ReactNode;
};

/** Every declarative diagram goes through here, so accessibility, legend, export and scrolling behave the same. */
export function Frame({ spec, width, height, connections, legend, badge, readableWidth, children }: FrameProps) {
  const id = diagramKey(spec);
  return (
    <DiagramFigure
      id={id}
      title={spec.title}
      desc={spec.description}
      width={width}
      height={height}
      caption={spec.caption}
      legend={legendItems(spec, legend)}
      connections={connections}
      exportName={spec.title}
      minWidth={readableWidth ?? Math.min(Math.round((width + 32) * 0.7), 720)}
      badge={badge}
      markerTones={TONES}
    >
      {children}
    </DiagramFigure>
  );
}

/** Text with a dark halo, so labels stay legible where they sit on top of a line. */
export function HaloText({ x, y, anchor = "middle", color, size = 10.5, weight, children }: {
  x: number; y: number; anchor?: "start" | "middle" | "end"; color: string; size?: number; weight?: number; children: ReactNode;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={color} stroke={TEXT.halo} strokeWidth={4} paintOrder="stroke" strokeLinejoin="round">
      {children}
    </text>
  );
}

