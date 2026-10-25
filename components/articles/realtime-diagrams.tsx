import { DiagramFigure, Edge, Group, Node, Pill } from "./diagram-kit";

/** Companion figures for the real-time streaming architecture article.
 * Media flows are illustrative; all time and throughput examples are explicitly hypothetical.
 */
function FrameJourney() {
  const id = "dg-frame-journey";
  const steps = [
    { x: 20, y: 72, label: "Capture", sub: "sensor + timestamp", icon: "camera" as const },
    { x: 205, y: 72, label: "Encode", sub: "codec + GOP", icon: "cpu" as const },
    { x: 390, y: 72, label: "Packetize", sub: "RTP / HLS", icon: "layers" as const },
    { x: 575, y: 72, label: "Transport", sub: "network queues", icon: "cloud" as const },
    { x: 760, y: 72, label: "Distribute", sub: "CDN / SFU", icon: "split" as const },
    { x: 760, y: 280, label: "Buffer", sub: "jitter / playback", icon: "queue" as const },
    { x: 575, y: 280, label: "Decode", sub: "recover frames", icon: "cpu" as const },
    { x: 390, y: 280, label: "Render", sub: "screen deadline", icon: "player" as const },
  ];
  return <DiagramFigure id={id} width={940} height={460}
    title="The end-to-end frame pipeline"
    desc="Frame capture flows through encode, packetization, transport and distribution, down to buffering and backwards through decode to rendering. Capture, compute, network and buffering may each add delay."
    caption="Figure 1. Glass-to-glass delay is a pipeline budget; buffering is only one component."
    legend={[{color:"#58a6ff",label:"Source and transport"},{color:"#2dd4bf",label:"Playback path"}]}>
    <Group x={10} y={30} w={915} h={165} label="Capture and delivery" />
    <Group x={355} y={235} w={565} h={165} label="Receiver" />
    {[0,1,2,3].map(i=><Edge key={i} id={id} d={`M${160+i*185} 116H${205+i*185}`} />)}
    <Edge id={id} tone="alt" d="M830 156V300" />
    <Edge id={id} tone="alt" d="M760 324H715" />
    <Edge id={id} tone="alt" d="M575 324H530" />
    {steps.map((s,i)=><Node key={s.label} x={s.x} y={s.y} w={140} h={84} label={s.label} sub={s.sub} icon={s.icon} tone={i>4?"alt":"main"} step={i+1}/>)}
    <Pill x={27} y={259} w={292} label="Latency = sum of stage delays" tone="plain"/>
    <Pill x={27} y={313} w={292} label="Measure capture to screen" tone="alt"/>
  </DiagramFigure>;
}

function TranscodeRemux() {
  const id="dg-transcode-remux";
  return <DiagramFigure id={id} width={920} height={405} title="Transcoding versus packet-level protocol adaptation"
    desc="The video-on-demand path decodes, encodes new bitrates, packages and stores HLS files. The compatible camera path preserves encoded H264 while adapting RTSP RTP packetization and WebRTC SRTP transport. Incompatible codecs require transcoding."
    caption="Figure 2. No re-encode on the right only when codec, profile and receiver capabilities are compatible."
    legend={[{color:"#58a6ff",label:"Decode and re-encode"},{color:"#2dd4bf",label:"Preserve compressed video"}]}>
    <Group x={15} y={24} w={890} h={158} label="A · Video on demand / offline processing"/>
    <Group x={15} y={216} w={890} h={155} label="B · RTSP to WebRTC / compatible codec"/>
    {[180,360,540,720].map(x=><Edge key={"a"+x} id={id} d={`M${x} 110H${x+25}`}/>)}
    {[180,360,540,720].map(x=><Edge key={"b"+x} id={id} tone="alt" d={`M${x} 300H${x+25}`}/>)}
    <Node x={30} y={72} w={150} label="Encoded upload" icon="upload" tone="main"/>
    <Node x={205} y={72} w={155} label="Decode" sub="raw frames" icon="cpu" tone="main"/>
    <Node x={385} y={72} w={155} label="Re-encode" sub="bitrate ladder" icon="cpu" tone="main"/>
    <Node x={565} y={72} w={155} label="HLS package" sub="segments" icon="layers" tone="main"/>
    <Node x={745} y={72} w={145} label="R2 / CDN" icon="cloud" tone="main"/>
    <Node x={30} y={260} w={150} label="RTSP / RTP" sub="H.264 source" icon="camera" tone="alt"/>
    <Node x={205} y={260} w={155} label="Depacketize" icon="layers" tone="alt"/>
    <Node x={385} y={260} w={155} label="Keep bitstream" sub="if compatible" icon="cpu" tone="alt"/>
    <Node x={565} y={260} w={155} label="Repacketize" sub="SRTP / WebRTC" icon="layers" tone="alt"/>
    <Node x={745} y={260} w={145} label="Viewer" icon="player" tone="alt"/>
  </DiagramFigure>;
}

function WebRtcHandshake() {
  const id="dg-webrtc-handshake";
  const rows=[
    {y:80,label:"1 · Offer / SDP",sub:"application signaling"},
    {y:145,label:"2 · Answer / SDP",sub:"application signaling"},
    {y:210,label:"3 · ICE candidates",sub:"STUN / TURN possible"},
    {y:275,label:"4 · ICE checks",sub:"select viable path"},
    {y:340,label:"5 · DTLS / SRTP",sub:"secure media keys"},
  ];
  return <DiagramFigure id={id} width={880} height={485} title="WebRTC establishment: control plane versus media"
    desc="Publisher and viewer exchange SDP and candidates through an application signaling channel. ICE tests network reachability, optional STUN and TURN assist, DTLS establishes secure transport, and then SRTP and RTCP media can flow."
    caption="Figure 3. Negotiation and ICE may overlap; this is a simplified logical sequence, not a blocking sequence diagram."
    legend={[{color:"#58a6ff",label:"Negotiation and connectivity"},{color:"#2dd4bf",label:"Encrypted media"}]}>
    <Group x={20} y={24} w={185} h={425} label="Publisher"/>
    <Group x={674} y={24} w={185} h={425} label="Viewer"/>
    <Node x={40} y={48} w={144} icon="camera" label="Media sender" tone="main"/>
    <Node x={695} y={48} w={144} icon="player" label="Media receiver" tone="main"/>
    <path d="M112 135V426M767 135V426" stroke="#8b949e" strokeDasharray="5 7" fill="none"/>
    {rows.map((r,i)=><g key={r.label}>
      <Edge id={id} d={i%2===1?`M675 ${r.y+25}H205`:`M205 ${r.y+25}H675`} tone="main" label={r.label} lx={440} ly={r.y+14}/>
      <text x={440} y={r.y+40} fontSize={10.5} textAnchor="middle" fill="#8b949e">{r.sub}</text>
    </g>)}
    <Edge id={id} tone="alt" both d="M205 421H675" label="6 · SRTP / RTCP media" lx={440} ly={412}/>
  </DiagramFigure>;
}

function BufferOccupancy() {
  const id="dg-buffer-occupancy";
  const data=[5,4,3,3.5,4,4];
  const x=i=>110+i*144, y=v=>355-v*53;
  const poly=data.map((v,i)=>`${x(i)},${y(v)}`).join(" ");
  return <DiagramFigure id={id} width={910} height={455} title="Hypothetical buffer occupancy through a two-second network outage"
    desc="Buffer begins with five seconds. With no media arriving for two seconds playback consumes two seconds, leaving three. Media then arrives at one and a half times playback for two seconds so occupancy recovers to four seconds. At matching delivery speed the four seconds remain."
    caption="Figure 4. Hypothetical values assume one second of playback consumption per second, no timing discontinuities, and fully decodable incoming media."
    legend={[{color:"#58a6ff",label:"Playable media in buffer (seconds)"},{color:"#ffb020",label:"Outage interval"}]}>
    <rect x={110} y={43} width={288} height={320} rx={8} fill="#ffb020" fillOpacity={0.08} stroke="#ffb020" strokeDasharray="5 5"/>
    <text x={253} y={61} fill="#ffb020" fontSize={13} textAnchor="middle">No arrivals · 2 s</text>
    {[0,1,2,3,4,5].map(v=><g key={v}>
      <line x1={100} x2={847} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,.1)"/>
      <text x={83} y={y(v)+4} textAnchor="end" fill="#8b949e" fontSize={12}>{v} s</text>
    </g>)}
    <polyline points={poly} fill="none" stroke="#58a6ff" strokeWidth={4} strokeLinejoin="round"/>
    {data.map((v,i)=><g key={i}>
      <circle cx={x(i)} cy={y(v)} r={5} fill="#2dd4bf" stroke="#0d1117" strokeWidth={2}/>
      <text x={x(i)} y={y(v)-13} fill="#e6edf3" fontSize={12} textAnchor="middle">{v} s</text>
      <text x={x(i)} y={384} fill="#8b949e" fontSize={12} textAnchor="middle">t={i}</text>
    </g>)}
    <text x={475} y={415} fill="#e6edf3" textAnchor="middle" fontSize={12}>Time · seconds</text>
  </DiagramFigure>;
}

function SfuTurn() {
  const id="dg-sfu-turn";
  return <DiagramFigure id={id} width={910} height={415} title="SFU distribution and optional TURN relay"
    desc="A live source sends media to an SFU. The SFU selects and forwards media independently to viewers. Viewer A receives SRTP directly over an ICE-selected transport. Viewer B uses TURN to relay packets where network connectivity requires it. TURN does not act as a selective forwarding server."
    caption="Figure 5. TURN is a connectivity fallback on one viewer's path; SFU provides one-to-many distribution. Network routes vary by candidate selection."
    legend={[{color:"#58a6ff",label:"Forwarding topology"},{color:"#2dd4bf",label:"TURN relay fallback"}]}>
    <Group x={12} y={30} w={178} h={340} label="Publisher"/>
    <Group x={235} y={95} w={185} h={220} label="Distribution"/>
    <Group x={465} y={30} w={200} h={340} label="Optional relay"/>
    <Group x={710} y={30} w={185} h={340} label="Consumers"/>
    <Edge id={id} d="M170 214H252" label="SRTP" lx={210} ly={207}/>
    <Edge id={id} d="M402 186C580 186 630 122 725 122" label="Direct" lx={570} ly={127}/>
    <Edge id={id} tone="alt" d="M402 241H488" label="SRTP" lx={443} ly={233}/>
    <Edge id={id} tone="alt" d="M648 241H725" label="Relayed" lx={686} ly={233}/>
    <Node x={30} y={172} w={140} icon="camera" label="Camera" sub="one encoded feed" tone="main"/>
    <Node x={252} y={172} w={150} icon="split" label="SFU" sub="selective forwarding" tone="main"/>
    <Node x={488} y={199} w={160} icon="server" label="TURN" sub="relay packets" tone="alt"/>
    <Node x={725} y={82} w={150} icon="user" label="Viewer A" sub="reachable directly" tone="main"/>
    <Node x={725} y={199} w={150} icon="user" label="Viewer B" sub="needs relay" tone="alt"/>
    <Pill x={252} y={287} w={378} label="TURN ≠ SFU ≠ transcoder" tone="plain"/>
  </DiagramFigure>;
}

function DeliveryModes() {
  const id="dg-delivery-modes";
  return <DiagramFigure id={id} width={940} height={560} title="Three live distribution mechanisms"
    desc="HLS delivers completed segments and playlists through HTTP origin and optional CDN. LL-HLS publishes partial segments with blocking playlist reload and preload hints. WebRTC transports SRTP packets to viewers, optionally through SFUs for multi-viewer distribution."
    caption="Figure 6. The architectures differ in publication granularity and fan-out mechanism, not merely a numeric latency setting."
    legend={[{color:"#58a6ff",label:"HLS segments"},{color:"#2dd4bf",label:"LL-HLS partials"},{color:"#8b949e",label:"WebRTC packets"}]}>
    <Group x={10} y={18} w={920} h={156} label="HLS · completed segments and HTTP cache"/>
    <Group x={10} y={197} w={920} h={156} label="LL-HLS · partial segments and blocking reload"/>
    <Group x={10} y={377} w={920} h={156} label="WebRTC · packet forwarding and ICE"/>
    {[0,1,2].map((r)=><g key={r}>
      <Edge id={id} tone={r===1?"alt":r===2?"plain":"main"} d={`M202 ${98+r*180}H260`}/>
      <Edge id={id} tone={r===1?"alt":r===2?"plain":"main"} d={`M420 ${98+r*180}H493`}/>
      <Edge id={id} tone={r===1?"alt":r===2?"plain":"main"} d={`M653 ${98+r*180}H728`}/>
    </g>)}
    <Node x={35} y={57} w={167} icon="camera" label="Live source" tone="main"/>
    <Node x={260} y={57} w={160} icon="layers" label="Segmenter" sub="full segments" tone="main"/>
    <Node x={493} y={57} w={160} icon="cloud" label="Origin / CDN" sub="cached GETs" tone="main"/>
    <Node x={728} y={57} w={170} icon="player" label="Many viewers" sub="shared HTTP files" tone="main"/>
    <Node x={35} y={237} w={167} icon="camera" label="Live source" tone="alt"/>
    <Node x={260} y={237} w={160} icon="layers" label="LL packager" sub="partial segments" tone="alt"/>
    <Node x={493} y={237} w={160} icon="cloud" label="HTTP origin / CDN" sub="blocking reload" tone="alt"/>
    <Node x={728} y={237} w={170} icon="player" label="Many viewers" sub="closer live edge" tone="alt"/>
    <Node x={35} y={417} w={167} icon="camera" label="Live source" tone="white"/>
    <Node x={260} y={417} w={160} icon="upload" label="WebRTC ingest" sub="secure RTP" tone="white"/>
    <Node x={493} y={417} w={160} icon="split" label="SFU" sub="packet fan-out" tone="white"/>
    <Node x={728} y={417} w={170} icon="user" label="Viewers" sub="per-peer sessions" tone="white"/>
  </DiagramFigure>;
}

export const REALTIME_DIAGRAMS: Record<string, () => React.JSX.Element> = {
  "frame-journey": FrameJourney,
  "transcode-remux": TranscodeRemux,
  "webrtc-handshake": WebRtcHandshake,
  "buffer-occupancy": BufferOccupancy,
  "sfu-turn": SfuTurn,
  "delivery-modes": DeliveryModes,
};
