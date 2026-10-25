# Declarative diagrams in articles

Write a diagram straight into an article's Markdown. No JSX, no new component. The site renders it as real React/SVG with the dark liquid-glass theme, an accessible description and a "Download SVG / PNG" action.

Everything below is validated by `lib/diagrams/schema.ts` (Zod). `article_upsert` rejects a body whose diagram blocks do not validate, and names the path of each problem. For the machine-readable contract call the MCP tool `diagram_schema` (JSON Schema plus one example per type).

## Syntax

A fenced block with the language `diagram`. The body decides the mode:

- **One word** (`pipeline`, `decision`, ...) is a legacy hand-made figure. Leave those alone.
- **JSON object** (starts with `{`) is declarative. JSON only: no comments, no trailing commas.

Common fields, all types:

| Field | Required | Meaning |
|---|---|---|
| `type` | yes | `architecture`, `network`, `pipeline`, `sequence`, `buffer`, `metric` |
| `title` | yes | Short name. Becomes the SVG `<title>`. |
| `description` | yes | One or two sentences saying what the figure shows. Becomes the SVG `<desc>`; write it for someone who cannot see the figure. |
| `caption` | no | Visible line under the figure ("Figure 2. ...") |
| `legend` | no | `[{ "label": "Produce", "tone": "main", "dashed": false }]` |

Unknown keys are errors (typos fail loudly). A figure also gets a screen-reader-only list of its connections generated from the data.

## Vocabulary

- **Tones**: `main` (blue), `alt` (teal), `amber`, `plain`, `white`, plus `ok` (green), `warn` (amber), `error` (red). Only these tones exist; do not invent colors.
- **Icons** (`icon`): camera, server, queue, db, cloud, player, user, upload, cpu, bucket, split, plug, layers, kubernetes, kafka, broker, network, browser, mobile, lock, clock, gateway, shield, key, pod, cache, users, chart, mic, signal, function, globe.
- **Brands** (`brand`, drawn in the tone color, Cloudflare in its orange): cloudflare, kafka, kubernetes, docker, postgresql, redis, nginx, rabbitmq, go, webrtc, mongodb, prometheus, grafana, ffmpeg, nodejs, react, aws, envoy, istio, helm, terraform, apple, android.
- **Ids** (`id`): letters, digits, `-`, `_`; unique across nodes and groups.

## Which type to use

| Need | Type |
|---|---|
| Components and how they connect: services, brokers, clusters | `architecture` |
| Hosts, NATs, relays, who can reach whom | `network` |
| Left-to-right stages, in lanes | `pipeline` |
| Who says what to whom, in order | `sequence` |
| Buffers, playheads, ranges on a time axis | `buffer` |
| A few numbers over categories or time | `metric` |

Layout is automatic for `architecture` and `network` (ELK, orthogonal routing, groups as containers); direction `auto` picks the more readable of left-to-right and top-down. Keep to roughly 20 nodes per figure; split bigger systems in two. Never put an employer, client or real address in a figure. Numbers need a stated method: `metric` charts must say `"data": "illustrative"` (shows a badge) or `"data": "measured"` with a `method`.

## architecture

`nodes` (required), `groups` (containers, nestable via `parent`), `edges`. Optional `direction`: `auto` (default), `right`, `down`. Edges: `label`, `tone`, `dashed`, `bidirectional`, `animated`. Node `x`/`y` are optional manual positions, all nodes or none.

```diagram
{
  "type": "architecture",
  "title": "Queue-backed worker",
  "description": "An API publishes jobs to a queue. Two workers consume them and write results to a database.",
  "caption": "Jobs decouple the request from the work.",
  "legend": [{ "label": "Request", "tone": "main" }, { "label": "Job", "tone": "amber", "dashed": true }],
  "groups": [{ "id": "workers", "label": "Workers", "tone": "alt" }],
  "nodes": [
    { "id": "api", "label": "API", "sub": "accepts requests", "icon": "server", "tone": "main" },
    { "id": "q", "label": "Queue", "icon": "queue", "tone": "amber" },
    { "id": "w1", "label": "Worker 1", "icon": "cpu", "tone": "alt", "group": "workers" },
    { "id": "w2", "label": "Worker 2", "icon": "cpu", "tone": "alt", "group": "workers" },
    { "id": "db", "label": "Results", "brand": "postgresql" }
  ],
  "edges": [
    { "from": "api", "to": "q", "label": "enqueue", "tone": "amber", "dashed": true },
    { "from": "q", "to": "w1", "tone": "amber", "dashed": true },
    { "from": "q", "to": "w2", "tone": "amber", "dashed": true },
    { "from": "w1", "to": "db" },
    { "from": "w2", "to": "db" }
  ]
}
```

## network

Like `architecture`, with `zones` instead of groups and `links` instead of edges. A node `role` (client, browser, mobile, server, router, nat, firewall, stun, turn, sfu, mcu, broker, cdn, gateway, internet, database, camera) supplies a default icon and tone. Link `kind` supplies color and style: `media` (blue), `signaling` (amber dashed), `relay` (teal), `control` (white dashed), `data` (gray). Links are bidirectional unless `"bidirectional": false`. The legend is derived from the kinds used.

```diagram
{
  "type": "network",
  "title": "Peers behind NAT",
  "description": "Two peers behind separate NATs reach a STUN server for their public address and use a TURN server as a relay fallback.",
  "zones": [{ "id": "lan-a", "label": "Network A (NAT)", "tone": "amber" }, { "id": "lan-b", "label": "Network B (NAT)", "tone": "amber" }, { "id": "net", "label": "Public internet" }],
  "nodes": [
    { "id": "a", "label": "Peer A", "role": "browser", "zone": "lan-a" },
    { "id": "b", "label": "Peer B", "role": "mobile", "zone": "lan-b" },
    { "id": "stun", "label": "STUN", "role": "stun", "zone": "net" },
    { "id": "turn", "label": "TURN", "role": "turn", "zone": "net" }
  ],
  "links": [
    { "from": "a", "to": "stun", "kind": "control", "label": "binding" },
    { "from": "b", "to": "stun", "kind": "control" },
    { "from": "a", "to": "b", "kind": "media", "label": "direct" },
    { "from": "a", "to": "turn", "kind": "relay" },
    { "from": "b", "to": "turn", "kind": "relay" }
  ]
}
```

## pipeline

`lanes`, each with ordered `stages`; stages are connected left to right unless the lane sets `"connect": false`. `links` draw arrows between stages of different lanes (use adjacent lanes so routes stay clear). Stage `step` adds a numbered badge. Deterministic layout, no auto-layout engine.

```diagram
{
  "type": "pipeline",
  "title": "Upload to playback",
  "description": "A file is uploaded, transcoded and published to storage; a second lane records job state.",
  "lanes": [
    { "id": "media", "label": "Media", "tone": "main", "stages": [
      { "id": "up", "label": "Upload", "icon": "upload", "tone": "main", "step": 1 },
      { "id": "enc", "label": "Transcode", "sub": "renditions", "icon": "cpu", "tone": "main", "step": 2 },
      { "id": "pub", "label": "Publish", "icon": "bucket", "tone": "alt", "step": 3 }
    ] },
    { "id": "state", "label": "Job state", "tone": "amber", "stages": [
      { "id": "queued", "label": "Queued", "tone": "amber" },
      { "id": "ready", "label": "Ready", "tone": "ok" }
    ] }
  ],
  "links": [{ "from": "pub", "to": "ready", "label": "mark ready", "tone": "amber", "dashed": true }]
}
```

## sequence

`participants` (2 to 10) and ordered `steps`. A step is a `message` (`from`, `to`, `label`, `style`: `sync`, `async` animated, `return` dashed; `from` = `to` draws a self-call), a `note` (`over`: one id or `[first, last]`) or a `phase` divider. Messages are numbered unless `"numbered": false`. Column spacing is computed from the label widths, so keep labels short (under about 40 characters).

```diagram
{
  "type": "sequence",
  "title": "Token refresh",
  "description": "A client calls an API with an expired token, refreshes it at the auth service and retries.",
  "participants": [
    { "id": "c", "label": "Client", "icon": "browser" },
    { "id": "api", "label": "API", "icon": "server", "tone": "main" },
    { "id": "auth", "label": "Auth", "icon": "key", "tone": "amber" }
  ],
  "steps": [
    { "kind": "message", "from": "c", "to": "api", "label": "GET /items" },
    { "kind": "message", "from": "api", "to": "c", "label": "401 expired", "style": "return", "tone": "error" },
    { "kind": "phase", "label": "Refresh" },
    { "kind": "message", "from": "c", "to": "auth", "label": "refresh token", "tone": "amber" },
    { "kind": "message", "from": "auth", "to": "c", "label": "new access token", "style": "return", "tone": "amber" },
    { "kind": "note", "over": ["c", "api"], "text": "Retry once with the new token." },
    { "kind": "message", "from": "c", "to": "api", "label": "GET /items", "style": "async", "tone": "alt" }
  ]
}
```

## buffer

A time axis (`unit`, `range`) with `tracks` of `segments`, `markers` (vertical lines such as a playhead) and `spans` (brackets over a range). Everything must sit inside `range`.

```diagram
{
  "type": "buffer",
  "title": "Player buffer",
  "description": "Downloaded media extends ahead of the playhead; the gap between them is the buffer.",
  "unit": "s",
  "range": { "start": 0, "end": 30 },
  "tracks": [
    { "id": "played", "label": "Played", "segments": [{ "start": 0, "end": 10, "label": "played", "tone": "plain" }] },
    { "id": "buffered", "label": "Buffered", "segments": [{ "start": 10, "end": 24, "label": "buffered", "tone": "alt" }] }
  ],
  "markers": [{ "at": 10, "label": "Playhead", "tone": "white" }, { "at": 24, "label": "Download edge", "tone": "alt" }],
  "spans": [{ "start": 10, "end": 24, "label": "buffer ahead", "tone": "amber" }]
}
```

## metric

`chart`: `line` or `bar`. `x.values` are the category labels; each series has one value per label (`null` leaves a gap). Optional `thresholds` draw dashed reference lines. `data` is mandatory: `illustrative` shows a visible badge; `measured` needs a `method`.

```diagram
{
  "type": "metric",
  "title": "Cache hit ratio by tier",
  "description": "Bar chart of an illustrative cache hit ratio for three tiers.",
  "chart": "bar",
  "data": "illustrative",
  "x": { "label": "Tier", "values": ["Browser", "Edge", "Origin"] },
  "y": { "label": "Hit ratio", "unit": "%", "min": 0, "max": 100 },
  "series": [{ "name": "Hit ratio", "tone": "main", "values": [62, 88, 97] }],
  "thresholds": [{ "value": 90, "label": "Target", "tone": "ok" }]
}
```

## Failure behavior

- An invalid block never breaks the page. The reader sees a quiet "This diagram could not be displayed." and the server logs the validation errors (`[diagrams] invalid diagram block`).
- `article_upsert` stops earlier: it refuses the article and returns lines like `diagram block #2 (line 41): edges[3].to: unknown node "cache"`.
- If the layout engine fails, `architecture` and `network` fall back to a simple grid.

## For maintainers

Schema and tests live in `lib/diagrams/`; components in `components/articles/diagrams/`; fixtures (Kafka, Kubernetes, WebRTC, microservices) in `lib/diagrams/__fixtures__/`. Run `npm run test:diagrams`. `architecture`/`network` layouts are computed on the server with ELK (`elkjs`, listed in `serverExternalPackages`), so the first paint is final: no skeleton, no layout shift, no layout engine in the client bundle. Export (`lib/diagrams/export.ts`) runs in the browser and is opt-in per figure.
