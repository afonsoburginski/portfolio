import type { DiagramTone } from "./names";

/** Node and group palette. Tones map onto the existing site palette: blue, teal, amber, plus status colors. */
export const TONE: Record<DiagramTone, { stroke: string; fill: string; icon: string; accent: string }> = {
  main: { stroke: "#58a6ff", fill: "#0d1117", icon: "#58a6ff", accent: "#58a6ff" },
  alt: { stroke: "#2dd4bf", fill: "#0d1117", icon: "#2dd4bf", accent: "#2dd4bf" },
  plain: { stroke: "rgba(255,255,255,.12)", fill: "#0d1117", icon: "#8b949e", accent: "#8b949e" },
  white: { stroke: "rgba(255,255,255,.45)", fill: "#0d1117", icon: "#e6edf3", accent: "#e6edf3" },
  amber: { stroke: "rgba(255,176,32,.55)", fill: "#0d1117", icon: "#ffb020", accent: "#ffb020" },
  ok: { stroke: "rgba(63,185,80,.6)", fill: "#0d1117", icon: "#3fb950", accent: "#3fb950" },
  warn: { stroke: "rgba(255,176,32,.55)", fill: "#0d1117", icon: "#ffb020", accent: "#ffb020" },
  error: { stroke: "rgba(248,81,73,.6)", fill: "#0d1117", icon: "#f85149", accent: "#f85149" },
};

/** Line and arrowhead colors for connections. */
export const EDGE_COLOR: Record<DiagramTone, string> = {
  main: "#58a6ff", alt: "#2dd4bf", plain: "#8b949e", white: "#e6edf3",
  amber: "#ffb020", warn: "#ffb020", ok: "#3fb950", error: "#f85149",
};

export const TEXT = { primary: "#e6edf3", muted: "#8b949e", halo: "#0a0a0a" } as const;
