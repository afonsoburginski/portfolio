import type { ReactNode } from "react";
import {
  SiAmazonwebservices, SiAndroid, SiApachekafka, SiApple, SiCloudflare, SiDocker, SiEnvoyproxy, SiFfmpeg, SiGo,
  SiGrafana, SiHelm, SiIstio, SiKubernetes, SiMongodb, SiNginx, SiNodedotjs, SiPostgresql, SiPrometheus, SiRabbitmq,
  SiReact, SiRedis, SiTerraform, SiWebrtc,
} from "react-icons/si";
import type { IconType } from "react-icons";
import { DiagramExportButtons } from "./diagrams/export-buttons";
import { EDGE_COLOR, TEXT, TONE } from "@/lib/diagrams/tones";
import type { BrandName, DiagramTone, IconName } from "@/lib/diagrams/names";
import type { NodeBox } from "@/lib/diagrams/measure";
import { NODE_FONT } from "@/lib/diagrams/measure";

export type { BrandName, IconName };
export type Tone = DiagramTone;
type EdgeTone = DiagramTone;

const BRANDS: Record<BrandName, IconType> = {
  cloudflare: SiCloudflare, kafka: SiApachekafka, kubernetes: SiKubernetes, docker: SiDocker, postgresql: SiPostgresql,
  redis: SiRedis, nginx: SiNginx, rabbitmq: SiRabbitmq, go: SiGo, webrtc: SiWebrtc, mongodb: SiMongodb,
  prometheus: SiPrometheus, grafana: SiGrafana, ffmpeg: SiFfmpeg, nodejs: SiNodedotjs, react: SiReact,
  aws: SiAmazonwebservices, envoy: SiEnvoyproxy, istio: SiIstio, helm: SiHelm, terraform: SiTerraform,
  apple: SiApple, android: SiAndroid,
};

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
  kubernetes: (<><path d="M10 2l6.9 3.3 1.7 7.5-4.8 6H6.2l-4.8-6 1.7-7.5z" /><circle cx="10" cy="10.5" r="2" /><path d="M10 8.5V5.5M11.7 9.6l2.8-1.6M11.5 11.8l2.3 2M8.5 11.8l-2.3 2M8.3 9.6L5.5 8" /></>),
  kafka: (<><rect x="2" y="3" width="3.6" height="3.6" rx=".8" /><rect x="8.2" y="3" width="3.6" height="3.6" rx=".8" /><rect x="14.4" y="3" width="3.6" height="3.6" rx=".8" strokeDasharray="2 2" /><rect x="2" y="8.2" width="3.6" height="3.6" rx=".8" /><rect x="8.2" y="8.2" width="3.6" height="3.6" rx=".8" strokeDasharray="2 2" /><rect x="2" y="13.4" width="3.6" height="3.6" rx=".8" /><rect x="8.2" y="13.4" width="3.6" height="3.6" rx=".8" /><rect x="14.4" y="13.4" width="3.6" height="3.6" rx=".8" strokeDasharray="2 2" /></>),
  broker: (<><circle cx="10" cy="10" r="2.5" /><circle cx="3.5" cy="4" r="1.5" /><circle cx="16.5" cy="4" r="1.5" /><circle cx="3.5" cy="16" r="1.5" /><circle cx="16.5" cy="16" r="1.5" /><path d="M4.6 5.1L8.1 8.4M15.4 5.1l-3.5 3.3M4.6 14.9l3.5-3.3M15.4 14.9l-3.5-3.3" /></>),
  network: (<><circle cx="10" cy="4" r="2" /><circle cx="4" cy="15" r="2" /><circle cx="16" cy="15" r="2" /><path d="M9 5.8L5 13.2M11 5.8l4 7.4M6.2 15h7.6" /></>),
  browser: (<><rect x="2" y="3.5" width="16" height="13" rx="2" /><path d="M2 7.5h16M5 5.5h.01M7.5 5.5h.01" /></>),
  mobile: (<><rect x="5.5" y="2" width="9" height="16" rx="2" /><path d="M9 15.5h2" /></>),
  lock: (<><rect x="4" y="9" width="12" height="8.5" rx="2" /><path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" /></>),
  clock: (<><circle cx="10" cy="10" r="7.5" /><path d="M10 5.5V10l3 2" /></>),
  gateway: (<><path d="M10 2v16" /><path d="M2 7h5M5 4.5L7.5 7 5 9.5M18 13h-5M15 10.5L12.5 13 15 15.5" /></>),
  shield: <path d="M10 2.5l6 2.2v4.6c0 4-2.6 6.7-6 8.2-3.4-1.5-6-4.2-6-8.2V4.7z" />,
  key: (<><circle cx="6.5" cy="12" r="3.5" /><path d="M9 9.5l7.5-7M14 5l2 2M12 7l1.5 1.5" /></>),
  pod: (<><rect x="3" y="3" width="14" height="14" rx="3" /><rect x="6.5" y="6.5" width="7" height="7" rx="1.5" /></>),
  cache: <path d="M11 2L4.5 11H10l-1 7 6.5-9H10z" />,
  users: (<><circle cx="7.5" cy="7" r="2.5" /><path d="M2.5 16c0-3 2.3-4.5 5-4.5s5 1.5 5 4.5M13 4.8a2.5 2.5 0 0 1 0 4.4M14.5 11.7c1.8.5 3 1.8 3 4.3" /></>),
  chart: <path d="M3 17V3M3 17h14M6.5 13l3-4 3 2.5 4-6" />,
  mic: (<><rect x="7.5" y="2.5" width="5" height="9" rx="2.5" /><path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v3" /></>),
  signal: (<><path d="M3 8a10 10 0 0 1 14 0M5.5 11a6.5 6.5 0 0 1 9 0M8 14a3 3 0 0 1 4 0" /><path d="M10 17h.01" /></>),
  function: <path d="M8 3H6.5A1.5 1.5 0 0 0 5 4.5V8c0 1-.7 2-2 2 1.3 0 2 1 2 2v3.5A1.5 1.5 0 0 0 6.5 17H8M12 3h1.5A1.5 1.5 0 0 1 15 4.5V8c0 1 .7 2 2 2-1.3 0-2 1-2 2v3.5a1.5 1.5 0 0 1-1.5 1.5H12" />,
  globe: (<><circle cx="10" cy="10" r="7.5" /><path d="M2.5 10h15M10 2.5c2.5 2.3 3.5 4.8 3.5 7.5s-1 5.2-3.5 7.5c-2.5-2.3-3.5-4.8-3.5-7.5S7.5 4.8 10 2.5z" /></>),
};

export const CLOUDFLARE_ORANGE = "#F38020";

export function Icon({ name, x, y, color }: { name: IconName; x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </g>
  );
}

const GROUP_STROKE: Record<DiagramTone, string> = {
  plain: "rgba(255,255,255,.2)", amber: "rgba(255,176,32,.45)", warn: "rgba(255,176,32,.45)", main: "rgba(88,166,255,.4)",
  alt: "rgba(45,212,191,.4)", white: "rgba(255,255,255,.4)", ok: "rgba(63,185,80,.45)", error: "rgba(248,81,73,.45)",
};

export function Group({ x, y, w, h, label, tone = "plain" }: { x: number; y: number; w: number; h: number; label: string; tone?: Tone }) {
  const color = GROUP_STROKE[tone];
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill="rgba(255,255,255,.015)" stroke={color} strokeWidth={1.5} strokeDasharray="5 5" />
      <text x={x + 14} y={y + 20} fontSize={11} fontWeight={600} letterSpacing=".06em" fill={tone === "plain" ? "#8b949e" : TONE[tone].accent} style={{ textTransform: "uppercase" }}>
        {label}
      </text>
    </g>
  );
}

/** Brand glyph centered on cx. Cloudflare keeps its orange; other brands take the tone color (the site never uses purple). */
function BrandGlyph({ brand, cx, y, color }: { brand: BrandName; cx: number; y: number; color: string }) {
  const Glyph = BRANDS[brand];
  return (
    <g transform={`translate(${cx - 11} ${y + 11})`} aria-hidden="true">
      <Glyph size={22} color={brand === "cloudflare" ? CLOUDFLARE_ORANGE : color} />
    </g>
  );
}

export function Node({ x, y, w, h = 84, label, sub, icon, brand, tone = "plain", step }: {
  x: number; y: number; w: number; h?: number; label: string; sub?: string; icon?: IconName; brand?: BrandName; tone?: Tone; step?: number;
}) {
  const t = TONE[tone];
  const cx = x + w / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={t.fill} stroke={t.stroke} strokeWidth={1.5} />
      {icon && <Icon name={icon} x={cx - 10} y={y + 12} color={t.icon} />}
      {brand && <BrandGlyph brand={brand} cx={cx} y={y} color={t.icon} />}
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

/** Card sized by `nodeBox()`: wrapped label and sub lines, optional icon or brand glyph, vertically centered content. */
export function RichNode({ x, y, w, h, box, icon, brand, tone = "plain", step }: {
  x: number; y: number; w: number; h: number; box: NodeBox; icon?: IconName; brand?: BrandName; tone?: Tone; step?: number;
}) {
  const t = TONE[tone];
  const cx = x + w / 2;
  const glyph = icon || brand ? 30 : 0;
  const textH = box.labelLines.length * NODE_FONT.labelLine + (box.subLines.length ? 2 + box.subLines.length * NODE_FONT.subLine : 0);
  const top = y + (h - glyph - textH) / 2;
  const labelTop = top + glyph;
  const subTop = labelTop + box.labelLines.length * NODE_FONT.labelLine + 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={t.fill} stroke={t.stroke} strokeWidth={1.5} />
      {icon && <Icon name={icon} x={cx - 10} y={top} color={t.icon} />}
      {brand && <BrandGlyph brand={brand} cx={cx} y={top - 1} color={t.icon} />}
      {box.labelLines.map((line, i) => (
        <text key={i} x={cx} y={labelTop + i * NODE_FONT.labelLine + 12} textAnchor="middle" fontSize={NODE_FONT.label} fontWeight={600} fill={TEXT.primary}>{line}</text>
      ))}
      {box.subLines.map((line, i) => (
        <text key={i} x={cx} y={subTop + i * NODE_FONT.subLine + 10} textAnchor="middle" fontSize={NODE_FONT.sub} fill={TEXT.muted}>{line}</text>
      ))}
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
const LEGACY_MARKERS: readonly Tone[] = ["main", "alt", "plain"];

function LegendList({ legend, className = "" }: { legend: LegendItem[]; className?: string }) {
  return (
    <ul className={`${className} flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[#8b949e]`.trim()}>
      {legend.map((l) => (
        <li key={l.label} className="flex items-center gap-2">
          <svg width="22" height="6" aria-hidden="true">
            <line x1="0" y1="3" x2="22" y2="3" stroke={l.color} strokeWidth="2" strokeDasharray={l.dashed ? "4 3" : undefined} />
          </svg>
          {l.label}
        </li>
      ))}
    </ul>
  );
}

export function DiagramFigure({ id, title, desc, width, height, caption, legend, children, connections, exportName, minWidth, badge, markerTones = LEGACY_MARKERS }: {
  id: string; title: string; desc: string; width: number; height: number;
  caption?: string; legend?: LegendItem[]; children: ReactNode;
  /** Text equivalent of the connections, rendered as a screen-reader-only list. */
  connections?: string[];
  /** When set, shows the discreet Download SVG / PNG buttons; the value is the file name. */
  exportName?: string;
  /** Below this container width the figure scrolls horizontally instead of shrinking its text. */
  minWidth?: number;
  badge?: string;
  /** Arrowhead colors to define. Defaults to the three tones legacy figures use. */
  markerTones?: readonly Tone[];
}) {
  return (
    <figure className="not-prose my-10 w-full">
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm sm:p-5">
        <svg
          role="img"
          aria-labelledby={`${id}-t ${id}-d`}
          viewBox={`${-PAD} ${-PAD} ${width + PAD * 2} ${height + PAD * 2}`}
          width="100%"
          className={minWidth ? "block" : "block min-w-[640px] lg:min-w-0"}
          style={minWidth ? { fontFamily: "inherit", minWidth } : { fontFamily: "inherit" }}
        >
          <title id={`${id}-t`}>{title}</title>
          <desc id={`${id}-d`}>{desc}</desc>
          <defs>
            {markerTones.map((t) => (
              <marker key={t} id={`${id}-a-${t}`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 1.2L9 5 0 8.8z" fill={EDGE_COLOR[t]} />
              </marker>
            ))}
          </defs>
          {children}
        </svg>
        {connections && connections.length > 0 && (
          <ul className="sr-only" aria-label={`${title}: connections`}>
            {connections.map((c) => <li key={c}>{c}</li>)}
          </ul>
        )}
        {legend && !badge && !exportName && <LegendList legend={legend} className="mt-3" />}
        {(badge || exportName) && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
            {legend ? <LegendList legend={legend} /> : <span />}
            <div className="flex items-center gap-3">
              {badge && <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/45">{badge}</span>}
              {exportName && <DiagramExportButtons name={exportName} />}
            </div>
          </div>
        )}
      </div>
      {caption && <figcaption className="mt-3 px-1 text-center text-[13px] leading-6 text-white/50">{caption}</figcaption>}
    </figure>
  );
}
