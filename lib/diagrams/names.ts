/** Closed vocabularies shared by the Zod schema and the SVG kit. */
export const TONES = ["main", "alt", "amber", "plain", "white", "ok", "warn", "error"] as const;
export type DiagramTone = (typeof TONES)[number];

export const ICON_NAMES = [
  "camera", "server", "queue", "db", "cloud", "player", "user", "upload", "cpu", "bucket", "split", "plug", "layers",
  "kubernetes", "kafka", "broker", "network", "browser", "mobile", "lock", "clock", "gateway", "shield", "key",
  "pod", "cache", "users", "chart", "mic", "signal", "function", "globe",
] as const;
export type IconName = (typeof ICON_NAMES)[number];

/** Optional brand glyphs (react-icons/si). Rendered in the tone color, except Cloudflare, which keeps its orange. */
export const BRAND_NAMES = [
  "cloudflare", "kafka", "kubernetes", "docker", "postgresql", "redis", "nginx", "rabbitmq", "go", "webrtc",
  "mongodb", "prometheus", "grafana", "ffmpeg", "nodejs", "react", "aws", "envoy", "istio", "helm", "terraform",
  "apple", "android",
] as const;
export type BrandName = (typeof BRAND_NAMES)[number];

/** Network roles pick a default icon and tone, so an agent can write `"role": "turn"` and get a sensible node. */
export const NETWORK_ROLES = [
  "client", "browser", "mobile", "server", "router", "nat", "firewall", "stun", "turn", "sfu", "mcu",
  "broker", "cdn", "gateway", "internet", "database", "camera",
] as const;
export type NetworkRole = (typeof NETWORK_ROLES)[number];

export const LINK_KINDS = ["media", "signaling", "relay", "control", "data"] as const;
export type LinkKind = (typeof LINK_KINDS)[number];

export const ROLE_DEFAULTS: Record<NetworkRole, { icon: IconName; tone: DiagramTone }> = {
  client: { icon: "user", tone: "plain" },
  browser: { icon: "browser", tone: "plain" },
  mobile: { icon: "mobile", tone: "plain" },
  server: { icon: "server", tone: "main" },
  router: { icon: "network", tone: "plain" },
  nat: { icon: "shield", tone: "amber" },
  firewall: { icon: "shield", tone: "warn" },
  stun: { icon: "signal", tone: "alt" },
  turn: { icon: "split", tone: "amber" },
  sfu: { icon: "split", tone: "main" },
  mcu: { icon: "cpu", tone: "main" },
  broker: { icon: "broker", tone: "main" },
  cdn: { icon: "cloud", tone: "alt" },
  gateway: { icon: "gateway", tone: "white" },
  internet: { icon: "globe", tone: "plain" },
  database: { icon: "db", tone: "plain" },
  camera: { icon: "camera", tone: "alt" },
};

export const LINK_STYLE: Record<LinkKind, { tone: DiagramTone; dashed: boolean; label: string }> = {
  media: { tone: "main", dashed: false, label: "Media" },
  signaling: { tone: "amber", dashed: true, label: "Signaling" },
  relay: { tone: "alt", dashed: false, label: "Relayed media" },
  control: { tone: "white", dashed: true, label: "Control" },
  data: { tone: "plain", dashed: false, label: "Data" },
};
