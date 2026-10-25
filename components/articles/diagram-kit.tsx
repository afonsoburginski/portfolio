import type { ReactNode } from "react";
import { SiCloudflare } from "react-icons/si";

export type Tone = "main" | "alt" | "plain" | "white" | "amber";

const TONE: Record<Tone, { stroke: string; fill: string; icon: string }> = {
  main: { stroke: "#58a6ff", fill: "#0d1117", icon: "#58a6ff" },
  alt: { stroke: "#2dd4bf", fill: "#0d1117", icon: "#2dd4bf" },
  plain: { stroke: "rgba(255,255,255,.12)", fill: "#0d1117", icon: "#8b949e" },
  white: { stroke: "rgba(255,255,255,.45)", fill: "#0d1117", icon: "#e6edf3" },
  amber: { stroke: "rgba(255,176,32,.55)", fill: "#0d1117", icon: "#ffb020" },
};

const EDGE_COLOR = { main: "#58a6ff", alt: "#2dd4bf", plain: "#8b949e" } as const;
type EdgeTone = keyof typeof EDGE_COLOR;

export type IconName =
  | "camera" | "server" | "queue" | "db" | "cloud" | "player" | "user"
  | "upload" | "cpu" | "bucket" | "split" | "plug" | "layers";

const ICONS: Record<IconName, ReactNode> = {
  camera: (<><rect x="2" y="5" width="11" height="10" rx="2" /><path d="M13 9l5-3v8l-5-3z" /></>),
  server: (<><rect x="3" y="3" width="14" height="5" rx="1.5" /><rect x="3" y="12" width="14" height="5" rx="1.5" /><path d="M6 5.5h.01M6 14.5h.01" /></>),
  queue: (<><rect x="1.5" y="6" width="5" height="8" rx="1" /><rect x="7.5" y="6" width="5" height="8" rx="1" /><rect x="13.5" y="6" width="5" height="8" rx="1" /></>),
  db: (<><ellipse cx="10" cy="5" rx="7" ry="2.5" /><path d="M3 5v10c0 1.4 3 2.5 7 2.5s7-1.1 7-2.5V5M3 10c0 1.4 3 2.5 7 2.5s7-1.1 7-2.5" /></>),
  cloud: <path d="M6 16a3.5 3.5 0 0 1-.5-7 5 5 0 0 1 9.5 1 3 3 0 0 1-.5 6z" />,
  player: (<><rect x="2" y="3.5" width="16" height="11" rx="2" /><path d="M8.5 7l4 2.5-4 2.5zM6 17h8" /></>),
  user: (<><circle cx="10" cy="6.5" r="3" /><path d="M3.5 17c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5" /></>),
  upload: <path d="M10 14V4M6 8l4-4 4 4M4 16h12" />,
  cpu: (<><rect x="5" y="5" width="10" height="10" rx="1.5" /><path d="M8 2v3M12 2v3M8 15v3M12 15v3M2 8h3M2 12h3M15 8h3M15 12h3" /></>),
  bucket: <path d="M3 6l7-3 7 3v8l-7 3-7-3zM3 6l7 3 7-3M10 9v8" />,
  split: (<><circle cx="4" cy="10" r="1.8" /><circle cx="16" cy="4.5" r="1.8" /><circle cx="16" cy="15.5" r="1.8" /><path d="M5.8 10h3.2l5.4-4.5M9 10l5.4 4.5" /></>),
  plug: <path d="M7 3v4M13 3v4M5 7h10v3a5 5 0 0 1-10 0zM10 15v3" />,
  layers: <path d="M10 3l8 4-8 4-8-4zM2 11l8 4 8-4" />,
};

export const CLOUDFLARE_ORANGE = "#F38020";

export function Icon({ name, x, y, color }: { name: IconName; x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </g>
  );
}

export function Group({ x, y, w, h, label, tone = "plain" }: { x: number; y: number; w: number; h: number; label: string; tone?: "plain" | "amber" }) {
  const color = tone === "amber" ? "rgba(255,176,32,.45)" : "rgba(255,255,255,.2)";
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill="rgba(255,255,255,.015)" stroke={color} strokeWidth={1.5} strokeDasharray="5 5" />
      <text x={x + 14} y={y + 20} fontSize={11} fontWeight={600} letterSpacing=".06em" fill={tone === "amber" ? "#ffb020" : "#8b949e"} style={{ textTransform: "uppercase" }}>
        {label}
      </text>
    </g>
  );
}

export function Node({ x, y, w, h = 84, label, sub, icon, brand, tone = "plain", step }: {
  x: number; y: number; w: number; h?: number; label: string; sub?: string; icon?: IconName; brand?: "cloudflare"; tone?: Tone; step?: number;
}) {
  const t = TONE[tone];
  const cx = x + w / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={t.fill} stroke={t.stroke} strokeWidth={1.5} />
      {icon && <Icon name={icon} x={cx - 10} y={y + 12} color={t.icon} />}
      {brand === "cloudflare" && (
        <g transform={`translate(${cx - 11} ${y + 11})`} aria-hidden="true">
          <SiCloudflare size={22} color={CLOUDFLARE_ORANGE} />
        </g>
      )}
      <text x={cx} y={y + (icon || brand ? 54 : h / 2 + (sub ? -2 : 4))} textAnchor="middle" fontSize={12.5} fontWeight={600} fill="#e6edf3">
        {label}
      </text>
      {sub && (
        <text x={cx} y={y + (icon || brand ? 70 : h / 2 + 14)} textAnchor="middle" fontSize={10.5} fill="#8b949e">
          {sub}
        </text>
      )}
      {step !== undefined && <Step x={x} y={y} n={step} />}
    </g>
  );
}

export function Step({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={10} fill="#1f6feb" stroke="#0d1117" strokeWidth={2} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">{n}</text>
    </g>
  );
}

export function Edge({ id, d, tone = "main", label, lx, ly, anchor = "middle", both = false, flow = true, dashed = false }: {
  id: string; d: string; tone?: EdgeTone; label?: string; lx?: number; ly?: number;
  anchor?: "start" | "middle" | "end"; both?: boolean; flow?: boolean; dashed?: boolean;
}) {
  const color = EDGE_COLOR[tone];
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={flow ? "dg-flow" : undefined}
        strokeDasharray={!flow && dashed ? "4 5" : undefined}
        markerEnd={`url(#${id}-a-${tone})`}
        markerStart={both ? `url(#${id}-a-${tone})` : undefined}
      />
      {label && lx !== undefined && ly !== undefined && (
        <text x={lx} y={ly} textAnchor={anchor} fontSize={10.5} fill={color} stroke="#0a0a0a" strokeWidth={4} paintOrder="stroke" strokeLinejoin="round">
          {label}
        </text>
      )}
    </g>
  );
}

export function Pill({ x, y, w, label, tone = "plain" }: { x: number; y: number; w: number; label: string; tone?: Tone }) {
  const t = TONE[tone];
  return (
    <g>
      <rect x={x} y={y} width={w} height={30} rx={15} fill={t.fill} stroke={t.stroke} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + 19.5} textAnchor="middle" fontSize={12} fontWeight={600} fill="#e6edf3">{label}</text>
    </g>
  );
}

export type LegendItem = { color: string; label: string; dashed?: boolean };

const PAD = 16;

export function DiagramFigure({ id, title, desc, width, height, caption, legend, children }: {
  id: string; title: string; desc: string; width: number; height: number;
  caption: string; legend?: LegendItem[]; children: ReactNode;
}) {
  return (
    <figure className="not-prose my-10 w-full">
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm sm:p-5">
        <svg
          role="img"
          aria-labelledby={`${id}-t ${id}-d`}
          viewBox={`${-PAD} ${-PAD} ${width + PAD * 2} ${height + PAD * 2}`}
          width="100%"
          className="block min-w-[640px] lg:min-w-0"
          style={{ fontFamily: "inherit" }}
        >
          <title id={`${id}-t`}>{title}</title>
          <desc id={`${id}-d`}>{desc}</desc>
          <defs>
            {(Object.keys(EDGE_COLOR) as EdgeTone[]).map((t) => (
              <marker key={t} id={`${id}-a-${t}`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 1.2L9 5 0 8.8z" fill={EDGE_COLOR[t]} />
              </marker>
            ))}
          </defs>
          {children}
        </svg>
        {legend && (
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[#8b949e]">
            {legend.map((l) => (
              <li key={l.label} className="flex items-center gap-2">
                <svg width="22" height="6" aria-hidden="true">
                  <line x1="0" y1="3" x2="22" y2="3" stroke={l.color} strokeWidth="2" strokeDasharray={l.dashed ? "4 3" : undefined} />
                </svg>
                {l.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      <figcaption className="mt-3 px-1 text-center text-[13px] leading-6 text-white/50">{caption}</figcaption>
    </figure>
  );
}
