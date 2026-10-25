import type { DiagramSpec } from "../schema";

/** Generic, employer-free examples. They double as documentation and as regression inputs for layout tests. */

export const kafka: DiagramSpec = {
  type: "architecture",
  title: "Kafka topic, partitions and consumer groups",
  description: "Two producers write keyed events to the orders topic, which has three partitions on a broker cluster. The billing consumer group splits the partitions between two consumers. The analytics group reads every partition with a single consumer.",
  caption: "Each partition is read by exactly one consumer per group; groups progress independently.",
  legend: [{ label: "Produce", tone: "main" }, { label: "Consume", tone: "alt" }],
  groups: [
    { id: "cluster", label: "Kafka cluster", tone: "main" },
    { id: "topic", label: "Topic: orders", tone: "main", parent: "cluster" },
    { id: "billing", label: "Consumer group: billing", tone: "alt" },
    { id: "analytics", label: "Consumer group: analytics", tone: "alt" },
  ],
  nodes: [
    { id: "web", label: "Checkout service", sub: "producer", icon: "server", tone: "plain" },
    { id: "mobile", label: "Mobile backend", sub: "producer", icon: "server", tone: "plain" },
    { id: "p0", label: "Partition 0", sub: "leader: broker 1", icon: "kafka", tone: "main", group: "topic" },
    { id: "p1", label: "Partition 1", sub: "leader: broker 2", icon: "kafka", tone: "main", group: "topic" },
    { id: "p2", label: "Partition 2", sub: "leader: broker 3", icon: "kafka", tone: "main", group: "topic" },
    { id: "b1", label: "Consumer B1", icon: "cpu", tone: "alt", group: "billing" },
    { id: "b2", label: "Consumer B2", icon: "cpu", tone: "alt", group: "billing" },
    { id: "a1", label: "Consumer A1", icon: "chart", tone: "alt", group: "analytics" },
  ],
  edges: [
    { from: "web", to: "p0", label: "hash(key)" },
    { from: "web", to: "p1" },
    { from: "mobile", to: "p1" },
    { from: "mobile", to: "p2" },
    { from: "p0", to: "b1", tone: "alt" },
    { from: "p1", to: "b1", tone: "alt" },
    { from: "p2", to: "b2", tone: "alt" },
    { from: "p0", to: "a1", tone: "alt", dashed: true },
    { from: "p1", to: "a1", tone: "alt", dashed: true },
    { from: "p2", to: "a1", tone: "alt", dashed: true },
  ],
};

export const kubernetes: DiagramSpec = {
  type: "architecture",
  title: "Kubernetes: control plane, nodes, pods and ingress",
  description: "Users reach an ingress controller over HTTPS, which routes to web and API pods on two worker nodes. The control plane holds the API server backed by etcd, with the scheduler and controller manager talking to the API server. Each node's kubelet watches the API server.",
  caption: "The control plane decides; the kubelets make it so.",
  legend: [{ label: "Request path", tone: "main" }, { label: "Control traffic", tone: "amber", dashed: true }],
  groups: [
    { id: "cp", label: "Control plane", tone: "amber" },
    { id: "n1", label: "Worker node 1" },
    { id: "n2", label: "Worker node 2" },
  ],
  nodes: [
    { id: "user", label: "Users", icon: "users" },
    { id: "ingress", label: "Ingress controller", sub: "TLS termination", icon: "gateway", tone: "white" },
    { id: "api", label: "API server", icon: "kubernetes", tone: "amber", group: "cp" },
    { id: "etcd", label: "etcd", sub: "cluster state", icon: "db", tone: "amber", group: "cp" },
    { id: "sched", label: "Scheduler", icon: "clock", tone: "amber", group: "cp" },
    { id: "ctrl", label: "Controller manager", icon: "cpu", tone: "amber", group: "cp" },
    { id: "kl1", label: "kubelet", icon: "cpu", group: "n1" },
    { id: "web1", label: "web pod", sub: "replica 1", icon: "pod", tone: "main", group: "n1" },
    { id: "web2", label: "web pod", sub: "replica 2", icon: "pod", tone: "main", group: "n1" },
    { id: "kl2", label: "kubelet", icon: "cpu", group: "n2" },
    { id: "api1", label: "api pod", sub: "replica 1", icon: "pod", tone: "main", group: "n2" },
  ],
  edges: [
    { from: "user", to: "ingress", label: "HTTPS" },
    { from: "ingress", to: "web1" },
    { from: "ingress", to: "web2" },
    { from: "ingress", to: "api1" },
    { from: "api", to: "etcd", tone: "amber", dashed: true },
    { from: "sched", to: "api", tone: "amber", dashed: true },
    { from: "ctrl", to: "api", tone: "amber", dashed: true },
    { from: "kl1", to: "api", tone: "amber", dashed: true, label: "watch" },
    { from: "kl2", to: "api", tone: "amber", dashed: true },
  ],
};

export const webrtcTopology: DiagramSpec = {
  type: "network",
  title: "WebRTC peers, STUN, TURN and signaling",
  description: "Two peers behind different NATs exchange session descriptions through a signaling server over secure WebSocket. Each peer asks a STUN server for its public address. Media goes directly between the peers when a path exists; otherwise both peers relay media through a TURN server.",
  caption: "Signaling carries no media. ICE tries the direct path first and falls back to the relay.",
  zones: [
    { id: "home", label: "Home network (NAT)", tone: "amber" },
    { id: "mobile", label: "Mobile network (carrier NAT)", tone: "amber" },
    { id: "internet", label: "Public internet" },
  ],
  nodes: [
    { id: "alice", label: "Peer A", sub: "browser", role: "browser", zone: "home" },
    { id: "bob", label: "Peer B", sub: "mobile app", role: "mobile", zone: "mobile" },
    { id: "sig", label: "Signaling server", sub: "WSS", role: "server", zone: "internet" },
    { id: "stun", label: "STUN server", sub: "public address", role: "stun", zone: "internet" },
    { id: "turn", label: "TURN server", sub: "relay", role: "turn", zone: "internet" },
  ],
  links: [
    { from: "alice", to: "sig", kind: "signaling", label: "offer / answer" },
    { from: "bob", to: "sig", kind: "signaling" },
    { from: "alice", to: "stun", kind: "control", label: "binding" },
    { from: "bob", to: "stun", kind: "control" },
    { from: "alice", to: "bob", kind: "media", label: "SRTP (direct)" },
    { from: "alice", to: "turn", kind: "relay", label: "relay" },
    { from: "bob", to: "turn", kind: "relay" },
  ],
};

export const webrtcSfu: DiagramSpec = {
  type: "architecture",
  title: "WebRTC with an SFU",
  description: "A publisher sends one media stream to a selective forwarding unit. The SFU forwards that stream to three subscribers without decoding it. A signaling service negotiates sessions with the publisher and the SFU. A TURN server relays media for subscribers that cannot connect directly.",
  legend: [{ label: "Media", tone: "main" }, { label: "Signaling", tone: "amber", dashed: true }, { label: "Relayed media", tone: "alt" }],
  groups: [{ id: "subs", label: "Subscribers" }],
  nodes: [
    { id: "pub", label: "Publisher", sub: "camera + mic", icon: "camera", tone: "alt" },
    { id: "sig", label: "Signaling", sub: "session setup", icon: "plug", tone: "amber" },
    { id: "sfu", label: "SFU", sub: "forwards, never decodes", icon: "split", tone: "main" },
    { id: "turn", label: "TURN", sub: "relay fallback", icon: "cloud", tone: "plain" },
    { id: "s1", label: "Viewer 1", icon: "browser", group: "subs" },
    { id: "s2", label: "Viewer 2", icon: "mobile", group: "subs" },
    { id: "s3", label: "Viewer 3", sub: "behind strict NAT", icon: "browser", group: "subs" },
  ],
  edges: [
    { from: "pub", to: "sfu", label: "1 stream" },
    { from: "pub", to: "sig", tone: "amber", dashed: true },
    { from: "sig", to: "sfu", tone: "amber", dashed: true },
    { from: "sfu", to: "s1" },
    { from: "sfu", to: "s2" },
    { from: "sfu", to: "turn", tone: "alt" },
    { from: "turn", to: "s3", tone: "alt" },
  ],
};

export const webrtcSignaling: DiagramSpec = {
  type: "sequence",
  title: "WebRTC signaling and ICE",
  description: "Peer A creates an offer and sends it through the signaling server to Peer B. Peer B replies with an answer. Both peers gather ICE candidates from STUN, exchange them through signaling, run connectivity checks and then start encrypted media.",
  caption: "Signaling only brokers the session; once ICE succeeds, media flows peer to peer or through TURN.",
  participants: [
    { id: "a", label: "Peer A", sub: "caller", icon: "browser", tone: "alt" },
    { id: "sig", label: "Signaling", sub: "WSS", icon: "plug", tone: "amber" },
    { id: "b", label: "Peer B", sub: "callee", icon: "mobile", tone: "alt" },
    { id: "stun", label: "STUN", icon: "signal" },
  ],
  steps: [
    { kind: "phase", label: "Session description" },
    { kind: "message", from: "a", to: "sig", label: "offer (SDP)", tone: "amber" },
    { kind: "message", from: "sig", to: "b", label: "offer (SDP)", tone: "amber" },
    { kind: "message", from: "b", to: "sig", label: "answer (SDP)", style: "return", tone: "amber" },
    { kind: "message", from: "sig", to: "a", label: "answer (SDP)", style: "return", tone: "amber" },
    { kind: "phase", label: "ICE candidates" },
    { kind: "message", from: "a", to: "stun", label: "binding request" },
    { kind: "message", from: "stun", to: "a", label: "public address", style: "return" },
    { kind: "message", from: "a", to: "sig", label: "candidate", tone: "amber" },
    { kind: "message", from: "b", to: "b", label: "gather candidates", tone: "plain" },
    { kind: "note", over: ["a", "b"], text: "Connectivity checks run on every candidate pair; the best working pair is selected." },
    { kind: "phase", label: "Media" },
    { kind: "message", from: "a", to: "b", label: "DTLS handshake, then SRTP", style: "async", tone: "alt" },
  ],
};

export const microservices: DiagramSpec = {
  type: "architecture",
  title: "Microservices behind an API gateway",
  description: "Web and mobile clients call an API gateway. The gateway routes to the orders, catalog and users services. Orders publishes events to a message queue that a payments worker and a notifier consume. Each service owns its own database, and the catalog service uses a cache.",
  caption: "Synchronous calls go through the gateway; side effects travel on the queue.",
  legend: [{ label: "Request", tone: "main" }, { label: "Event", tone: "amber", dashed: true }],
  groups: [
    { id: "edge", label: "Edge" },
    { id: "svc", label: "Services", tone: "main" },
    { id: "async", label: "Async workers", tone: "amber" },
    { id: "data", label: "Data" },
  ],
  nodes: [
    { id: "web", label: "Web app", icon: "browser", group: "edge" },
    { id: "app", label: "Mobile app", icon: "mobile", group: "edge" },
    { id: "gw", label: "API gateway", sub: "auth, routing, rate limit", icon: "gateway", tone: "white" },
    { id: "orders", label: "Orders", icon: "server", tone: "main", group: "svc" },
    { id: "catalog", label: "Catalog", icon: "server", tone: "main", group: "svc" },
    { id: "users", label: "Users", icon: "server", tone: "main", group: "svc" },
    { id: "queue", label: "Message queue", icon: "queue", tone: "amber" },
    { id: "pay", label: "Payments worker", icon: "cpu", tone: "amber", group: "async" },
    { id: "notify", label: "Notifier", icon: "signal", tone: "amber", group: "async" },
    { id: "odb", label: "Orders DB", brand: "postgresql", group: "data" },
    { id: "cdb", label: "Catalog DB", brand: "mongodb", group: "data" },
    { id: "cache", label: "Cache", brand: "redis", group: "data" },
    { id: "udb", label: "Users DB", brand: "postgresql", group: "data" },
  ],
  edges: [
    { from: "web", to: "gw" },
    { from: "app", to: "gw" },
    { from: "gw", to: "orders" },
    { from: "gw", to: "catalog" },
    { from: "gw", to: "users" },
    { from: "orders", to: "odb" },
    { from: "catalog", to: "cdb" },
    { from: "catalog", to: "cache", label: "read-through" },
    { from: "users", to: "udb" },
    { from: "orders", to: "queue", tone: "amber", dashed: true, label: "order.created" },
    { from: "queue", to: "pay", tone: "amber", dashed: true },
    { from: "queue", to: "notify", tone: "amber", dashed: true },
  ],
};

export const mediaPipeline: DiagramSpec = {
  type: "pipeline",
  title: "Live ingest to playback",
  description: "Live video is captured and encoded by a source, ingested by a media server, packaged into segments and delivered through a CDN to a player. A second lane shows the control path that authorizes the stream and publishes the playlist.",
  caption: "Two lanes, one stream: media on top, control underneath.",
  lanes: [
    { id: "media", label: "Media path", tone: "main", stages: [
      { id: "cap", label: "Capture", sub: "sensor + clock", icon: "camera", tone: "main", step: 1 },
      { id: "enc", label: "Encode", sub: "codec + GOP", icon: "cpu", tone: "main", step: 2 },
      { id: "ing", label: "Ingest", sub: "media server", icon: "server", tone: "main", step: 3 },
      { id: "pkg", label: "Package", sub: "segments", icon: "layers", tone: "main", step: 4 },
      { id: "cdn", label: "Deliver", sub: "CDN edge", icon: "cloud", tone: "alt", step: 5 },
    ] },
    { id: "ctl", label: "Control path", tone: "amber", stages: [
      { id: "auth", label: "Authorize", sub: "stream key", icon: "key", tone: "amber" },
      { id: "reg", label: "Register", sub: "stream state", icon: "db", tone: "amber" },
      { id: "pl", label: "Publish playlist", icon: "bucket", tone: "amber" },
    ] },
  ],
  links: [
    { from: "auth", to: "ing", label: "allow", tone: "amber", dashed: true },
    { from: "pkg", to: "pl", label: "segment list", tone: "amber", dashed: true },
  ],
};

export const jitterBuffer: DiagramSpec = {
  type: "buffer",
  title: "Jitter buffer between arrival and playback",
  description: "Packets arrive with uneven spacing and are held in a jitter buffer. The playhead trails the newest received data by the target buffer, which absorbs arrival variation before frames are decoded and rendered.",
  caption: "A larger target buffer hides more jitter and adds the same amount of delay.",
  unit: "ms",
  range: { start: 0, end: 600 },
  tracks: [
    { id: "net", label: "Network arrival", sub: "bursty", segments: [
      { start: 0, end: 140, label: "burst", tone: "main" }, { start: 170, end: 210, tone: "main" },
      { start: 300, end: 460, label: "burst", tone: "main" }, { start: 500, end: 560, label: "late", tone: "warn" },
    ] },
    { id: "buf", label: "Jitter buffer", sub: "held data", segments: [{ start: 0, end: 480, label: "buffered media", tone: "alt" }] },
    { id: "play", label: "Playback", segments: [{ start: 0, end: 260, label: "played", tone: "plain" }] },
  ],
  markers: [{ at: 260, label: "Playhead", tone: "white" }, { at: 480, label: "Newest data", tone: "alt" }],
  spans: [{ start: 260, end: 480, label: "target buffer", tone: "amber" }],
};

export const delayChart: DiagramSpec = {
  type: "metric",
  title: "Illustrative delay by delivery protocol",
  description: "A bar chart comparing, in relative terms, the typical delay class of HLS, low-latency HLS and WebRTC. The values are illustrative and not measured.",
  caption: "Shape of the trade-off, not a benchmark.",
  chart: "bar",
  data: "illustrative",
  x: { label: "Protocol", values: ["HLS", "LL-HLS", "WebRTC"] },
  y: { label: "Relative delay", unit: "s" },
  series: [{ name: "Delay class", tone: "main", values: [20, 4, 0.5] }],
  thresholds: [{ value: 1, label: "Interactive threshold", tone: "warn" }],
};

export const trendChart: DiagramSpec = {
  type: "metric",
  title: "Queue depth during a traffic spike",
  description: "A line chart of queue depth for two consumer counts across six time steps. Both rise during the spike; the larger consumer pool drains faster. The values are illustrative.",
  chart: "line",
  data: "illustrative",
  x: { label: "Time step", values: [1, 2, 3, 4, 5, 6] },
  y: { label: "Messages waiting", min: 0 },
  series: [
    { name: "2 consumers", tone: "amber", values: [10, 80, 220, 260, 190, 120] },
    { name: "6 consumers", tone: "alt", values: [10, 60, 110, 80, 30, 10] },
  ],
  thresholds: [{ value: 200, label: "Alert level", tone: "error" }],
};

export const FIXTURES = { kafka, kubernetes, webrtcTopology, webrtcSfu, webrtcSignaling, microservices, mediaPipeline, jitterBuffer, delayChart, trendChart } as const;
