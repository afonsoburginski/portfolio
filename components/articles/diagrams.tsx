import { REALTIME_DIAGRAMS } from "./realtime-diagrams";
import { DiagramFigure, Edge, Group, Node, Pill } from "./diagram-kit";

function Pipeline() {
  const id = "dg-pipeline";
  return (
    <DiagramFigure
      id={id}
      width={920}
      height={490}
      title="VoD pipeline: upload to playback"
      desc="A video is uploaded by a browser or app to a Go upload server, encoded by FFmpeg into HLS renditions with a master playlist, published to R2 object storage, served through a CDN and played by web and React Native players. Job state moves from queued to uploading, encoding, publishing and ready."
      caption="Figure 1. Case A, the VoD path: transcoding happens before viewers ask for the video, so delivery is plain HTTP from storage and CDN."
      legend={[
        { color: "#58a6ff", label: "Processing path" },
        { color: "#2dd4bf", label: "Delivery path" },
        { color: "#e6edf3", label: "Steps: 1 upload · 2 transcode · 3 publish · 4 distribute · 5 play", dashed: false },
      ]}
    >
      <Group x={15} y={40} w={180} h={140} label="Client" />
      <Group x={245} y={40} w={640} h={140} label="Origin / processing" />
      <Group x={705} y={220} w={180} h={140} label="Object storage" />
      <Group x={475} y={220} w={180} h={140} label="Edge / CDN" />
      <Group x={245} y={220} w={180} h={140} label="Clients" />
      <Group x={15} y={385} w={870} h={85} label="Job state" />

      <Edge id={id} d="M180 112H258" label="multipart" lx={219} ly={104} />
      <Edge id={id} d="M410 112H488" label="encode" lx={449} ly={104} />
      <Edge id={id} d="M640 112H718" label="segments" lx={679} ly={104} />
      <Edge id={id} d="M795 154V248" label="publish" lx={803} ly={206} anchor="start" />
      <Edge id={id} tone="alt" d="M720 292H642" label="origin pull" lx={681} ly={284} />
      <Edge id={id} tone="alt" d="M490 292H412" label="HLS" lx={451} ly={284} />

      <Node x={30} y={70} w={150} icon="upload" label="Upload" sub="browser / app" tone="main" step={1} />
      <Node x={260} y={70} w={150} icon="server" label="Upload server" sub="Go, multipart streaming" tone="main" />
      <Node x={490} y={70} w={150} icon="cpu" label="FFmpeg" sub="NVENC / CPU fallback" tone="main" step={2} />
      <Node x={720} y={70} w={150} icon="layers" label="HLS renditions" sub="+ master playlist" tone="main" />
      <Node x={720} y={250} w={150} brand="cloudflare" label="Object storage" sub="Cloudflare R2" tone="main" step={3} />
      <Node x={490} y={250} w={150} brand="cloudflare" label="CDN" sub="immutable asset keys" tone="alt" step={4} />
      <Node x={260} y={250} w={150} icon="player" label="Players" sub="web · React Native" tone="alt" step={5} />

      {["queued", "uploading", "encoding", "publishing", "ready"].map((s, i) => (
        <g key={s}>
          <Pill x={45 + i * 165} y={418} w={140} label={s} tone={s === "ready" ? "alt" : "plain"} />
          {i < 4 && <Edge id={id} tone="plain" flow={false} d={`M${189 + i * 165} 433H${222 + i * 165}`} />}
        </g>
      ))}
    </DiagramFigure>
  );
}

function AsyncMedia() {
  const id = "dg-async";
  return (
    <DiagramFigure
      id={id}
      width={940}
      height={440}
      title="Studio: asynchronous media generation (design)"
      desc="A React client calls a Hono API, which enqueues jobs in BullMQ. Submission and polling workers talk to provider adapters for external models, persist generation state in PostgreSQL and upload resulting assets to R2 object storage. This is the in-development design, not a production claim."
      caption="Figure 2. Case B, Studio (in development): the design separates submitting work, tracking it, and storing the result. Delivery comes after those states are reliable."
      legend={[
        { color: "#58a6ff", label: "Request and job path" },
        { color: "#2dd4bf", label: "State and asset path" },
        { color: "#ffb020", label: "Design, in development" },
      ]}
    >
      <text x={15} y={28} fontSize={11} fontWeight={700} letterSpacing=".08em" fill="#ffb020">
        DESIGN · IN DEVELOPMENT
      </text>
      <Group x={15} y={55} w={160} h={150} label="Client" />
      <Group x={200} y={55} w={345} h={150} label="Control plane" />
      <Group x={570} y={55} w={160} h={150} label="Workers" />
      <Group x={755} y={55} w={170} h={150} label="External providers" />
      <Group x={200} y={260} w={160} h={140} label="State" />
      <Group x={755} y={260} w={170} h={140} label="Asset storage" />

      <Edge id={id} d="M160 132H211" label="request" lx={186} ly={124} />
      <Edge id={id} d="M345 132H396" label="enqueue" lx={371} ly={124} />
      <Edge id={id} d="M530 132H581" label="dequeue" lx={556} ly={124} />
      <Edge id={id} d="M715 118H766" label="submit" lx={740} ly={110} />
      <Edge id={id} d="M715 148H766" label="poll" lx={740} ly={164} both />
      <Edge id={id} tone="alt" d="M280 174V288" label="state" lx={288} ly={236} anchor="start" both />
      <Edge id={id} tone="alt" d="M610 174V332H349" label="state updates" lx={480} ly={324} />
      <Edge id={id} tone="alt" d="M690 174V332H762" label="asset upload" lx={726} ly={324} anchor="middle" />

      <Node x={30} y={90} w={130} icon="user" label="Client" sub="React" tone="main" step={1} />
      <Node x={215} y={90} w={130} icon="server" label="API" sub="Hono" tone="main" />
      <Node x={400} y={90} w={130} icon="queue" label="Queue" sub="BullMQ" tone="main" step={2} />
      <Node x={585} y={90} w={130} icon="cpu" label="Workers" sub="submission · polling" tone="main" step={3} />
      <Node x={765} y={90} w={150} icon="plug" label="Provider adapters" sub="external models" tone="plain" />
      <Node x={215} y={290} w={130} icon="db" label="PostgreSQL" sub="generation state" tone="alt" step={5} />
      <Node x={770} y={290} w={140} icon="bucket" label="Object storage" sub="R2 · assets" tone="alt" step={4} />
    </DiagramFigure>
  );
}

function LivePaths() {
  const id = "dg-live";
  return (
    <DiagramFigure
      id={id}
      width={900}
      height={550}
      title="One live source, three delivery paths"
      desc="A live camera or encoder feeds three parallel paths. HLS: segmenter, origin, CDN, players using segments. LL-HLS: packager with partial segments, origin, CDN, players using blocking playlist reload. WebRTC: ingest, SFU, operators, with signaling and ICE with STUN and TURN running outside the media path."
      caption="Figure 3. Case C, live cameras: the same source can feed different paths. Each path trades delay against fan-out and operational burden."
      legend={[
        { color: "#58a6ff", label: "HLS" },
        { color: "#2dd4bf", label: "LL-HLS" },
        { color: "#8b949e", label: "WebRTC" },
        { color: "#2dd4bf", label: "Control channels (outside media path)", dashed: true },
      ]}
    >
      <Group x={15} y={200} w={170} h={140} label="Source" />
      <Group x={215} y={20} w={665} h={130} label="HLS · segments" />
      <Group x={215} y={170} w={665} h={150} label="LL-HLS · partial segments + blocking reload" />
      <Group x={215} y={340} w={665} h={190} label="WebRTC · real-time" />

      <Edge id={id} d="M170 278C200 278 200 106 231 106" />
      <Edge id={id} tone="alt" d="M170 278C200 278 200 256 231 256" />
      <Edge id={id} tone="plain" d="M170 278C200 278 200 422 231 422" />

      <Edge id={id} d="M345 106H401" label="segments" lx={373} ly={98} />
      <Edge id={id} d="M515 106H571" label="cache" lx={543} ly={98} />
      <Edge id={id} d="M685 106H741" label="HTTP" lx={713} ly={98} />
      <Edge id={id} tone="alt" d="M345 256H401" label="partials" lx={373} ly={248} />
      <Edge id={id} tone="alt" d="M515 256H571" label="cache" lx={543} ly={248} />
      <Edge id={id} tone="alt" d="M685 256H741" label="HTTP" lx={713} ly={248} />
      <Edge id={id} tone="plain" d="M345 422H436" label="WebRTC (SRTP)" lx={391} ly={414} />
      <Edge id={id} tone="plain" d="M550 422H641" label="SRTP" lx={596} ly={414} />

      <Edge id={id} tone="alt" flow={false} dashed both d="M330 464V486H660V468" label="ICE (STUN/TURN)" lx={495} ly={490} />
      <Edge id={id} tone="alt" flow={false} dashed both d="M260 464V512H735V468" label="signaling" lx={497} ly={516} />

      <Node x={30} y={236} w={140} icon="camera" label="Live source" sub="camera / encoder" tone="white" step={1} />

      <Node x={235} y={64} w={110} icon="layers" label="Segmenter" tone="main" step={2} />
      <Node x={405} y={64} w={110} icon="server" label="Origin" tone="main" />
      <Node x={575} y={64} w={110} icon="cloud" label="CDN" tone="main" step={3} />
      <Node x={745} y={64} w={110} icon="player" label="Players" tone="main" step={4} />

      <Node x={235} y={214} w={110} icon="layers" label="Packager" sub="partial segments" tone="alt" step={2} />
      <Node x={405} y={214} w={110} icon="server" label="Origin" tone="alt" />
      <Node x={575} y={214} w={110} icon="cloud" label="CDN" tone="alt" step={3} />
      <Node x={745} y={214} w={110} icon="player" label="Players" tone="alt" step={4} />

      <Node x={235} y={380} w={110} icon="upload" label="Ingest" sub="WebRTC" tone="white" step={2} />
      <Node x={440} y={380} w={110} icon="split" label="SFU" sub="forwarding" tone="white" step={3} />
      <Node x={645} y={380} w={110} icon="user" label="Operators" sub="browser" tone="white" step={4} />
    </DiagramFigure>
  );
}

function Question({ cx, y, w, lines }: { cx: number; y: number; w: number; lines: string[] }) {
  const h = lines.length > 1 ? 64 : 52;
  return (
    <g>
      <rect x={cx - w / 2} y={y} width={w} height={h} rx={h / 2} fill="#0d1117" stroke="rgba(255,255,255,.3)" strokeWidth={1.5} />
      {lines.map((l, i) => (
        <text key={l} x={cx} y={y + h / 2 + 4 + (i - (lines.length - 1) / 2) * 16} textAnchor="middle" fontSize={12.5} fontWeight={600} fill="#e6edf3">
          {l}
        </text>
      ))}
    </g>
  );
}

function Decision() {
  const id = "dg-decision";
  return (
    <DiagramFigure
      id={id}
      width={960}
      height={600}
      title="Decision flow: HLS, LL-HLS or WebRTC"
      desc="Start by asking if the content is live. If not, use HLS for video on demand. If live, ask whether the viewer needs to react to what they see. If yes, with few concurrent viewers use WebRTC, with many viewers evaluate WebRTC with an SFU, or LL-HLS if seconds of delay are acceptable. If the viewer does not need to react, use HLS when several seconds of delay are acceptable and LL-HLS otherwise. If the target is unknown, benchmark first."
      caption="Figure 4. A first-pass filter, not an automatic selector: the leaves are candidates to validate against measured requirements."
      legend={[
        { color: "#58a6ff", label: "HLS" },
        { color: "#2dd4bf", label: "LL-HLS" },
        { color: "#e6edf3", label: "WebRTC" },
      ]}
    >
      <Edge id={id} tone="plain" d="M370 44H254" label="No" lx={312} ly={36} />
      <Edge id={id} tone="plain" d="M480 70V136" label="Yes" lx={488} ly={108} anchor="start" />
      <Edge id={id} tone="plain" d="M640 170H678" label="Yes" lx={659} ly={162} />
      <Edge id={id} tone="plain" d="M320 170H170V260" label="No" lx={250} ly={162} />
      <Edge id={id} tone="plain" d="M100 318V396" label="Yes" lx={92} ly={364} anchor="end" />
      <Edge id={id} tone="plain" d="M240 318V358H400V396" label="No" lx={320} ly={350} />
      <Edge id={id} tone="plain" d="M760 202V250H640V296" label="Few" lx={700} ly={242} />
      <Edge id={id} tone="plain" d="M820 202V250H850V296" label="Many" lx={835} ly={242} />
      <Edge id={id} tone="alt" flow={false} dashed d="M850 362V438" label="if seconds of delay are OK" lx={842} ly={404} anchor="end" />
      <Edge id={id} tone="plain" flow={false} dashed d="M520 202V518" label="Target unknown?" lx={528} ly={470} anchor="start" />

      <Question cx={480} y={18} w={220} lines={["Is it live?"]} />
      <Question cx={480} y={138} w={320} lines={["Does the viewer need to react", "to what they see?"]} />
      <Question cx={790} y={138} w={220} lines={["How many concurrent", "viewers?"]} />
      <Question cx={170} y={262} w={280} lines={["Is a delay of several", "seconds acceptable?"]} />

      <Node x={40} y={16} w={210} h={56} label="HLS" sub="on-demand: pre-encoded + CDN" tone="main" />
      <Node x={20} y={398} w={180} h={64} label="HLS" sub="live, buffered" tone="main" />
      <Node x={305} y={398} w={190} h={64} label="LL-HLS" sub="partial segments" tone="alt" />
      <Node x={540} y={298} w={200} h={64} label="WebRTC" sub="few viewers, interactive" tone="white" />
      <Node x={750} y={298} w={200} h={64} label="WebRTC + SFU" sub="evaluate forwarding" tone="amber" />
      <Node x={750} y={440} w={200} h={56} label="LL-HLS" sub="partial segments" tone="alt" />
      <Node x={420} y={520} w={200} h={52} label="Benchmark first" sub="latency target not set" tone="plain" />
    </DiagramFigure>
  );
}

const DIAGRAMS: Record<string, () => React.JSX.Element> = {
  pipeline: Pipeline,
  "async-media": AsyncMedia,
  "live-paths": LivePaths,
  decision: Decision,
  ...REALTIME_DIAGRAMS,
};

export const LEGACY_DIAGRAM_IDS = Object.keys(DIAGRAMS);

export function Diagram({ id }: { id: string }) {
  const Component = DIAGRAMS[id];
  return Component ? <Component /> : null;
}
