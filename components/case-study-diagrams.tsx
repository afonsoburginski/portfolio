type DiagramProps = {
  project: "orbit" | "studio-stormz";
  locale: "en" | "pt";
  label: string;
  description: string;
};

const copy = {
  orbit: {
    en: { source: "CI + registry", state: "GitOps repository", reconcile: "Argo CD", runtime: "Kubernetes", alternate: "Compose via SSH" },
    pt: { source: "CI + registro", state: "repositório GitOps", reconcile: "Argo CD", runtime: "Kubernetes", alternate: "Compose por SSH" },
  },
  "studio-stormz": {
    en: { source: "Client + API", state: "Postgres", reconcile: "Outbox + BullMQ", runtime: "Worker", alternate: "R2 + signed media" },
    pt: { source: "Cliente + API", state: "Postgres", reconcile: "Outbox + BullMQ", runtime: "Worker", alternate: "R2 + mídia assinada" },
  },
} as const;

export function ArchitectureDiagram({ project, locale, label, description }: DiagramProps) {
  const text = copy[project][locale];

  return (
    <section className="case-diagram-section" aria-label={label}>
      <figure className={`case-diagram case-diagram-${project}`}>
      <figcaption className="case-diagram-caption">
        <span>{label}</span>
        <small>{description}</small>
      </figcaption>
      <svg className="case-diagram-svg" viewBox="0 0 920 300" role="img" aria-label={description}>
        <title>{label}</title>
        <desc>{description}</desc>
        <defs>
          <marker id={`${project}-arrow`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" />
          </marker>
        </defs>
        <path className="diagram-line" markerEnd={`url(#${project}-arrow)`} d="M180 150 H270" />
        <path className="diagram-line" markerEnd={`url(#${project}-arrow)`} d="M390 150 H480" />
        <path className="diagram-line" markerEnd={`url(#${project}-arrow)`} d="M600 150 H690" />
        <path className="diagram-line diagram-line-dashed" markerEnd={`url(#${project}-arrow)`} d="M540 185 V245 H790 V190" />
        <DiagramNode x={30} title={text.source} subtitle={project === "orbit" ? "commit / image" : "intent / request"} />
        <DiagramNode x={270} title={text.state} subtitle={project === "orbit" ? "desired state" : "business truth"} />
        <DiagramNode x={480} title={text.reconcile} subtitle={project === "orbit" ? "reconciliation" : "durable handoff"} />
        <DiagramNode x={690} title={text.runtime} subtitle={project === "orbit" ? "observed runtime" : "long-running work"} />
        <text className="diagram-label" x="665" y="275">{text.alternate}</text>
      </svg>
      </figure>
    </section>
  );
}

export function DataFlowDiagram({ project, locale, label, description }: DiagramProps) {
  const steps = project === "orbit"
    ? locale === "pt"
      ? ["commit", "release", "GitOps", "deploy", "signals"]
      : ["commit", "release", "GitOps", "deploy", "signals"]
    : locale === "pt"
      ? ["pedido", "outbox", "fila", "worker", "asset pronto"]
      : ["request", "outbox", "queue", "worker", "ready asset"];

  return (
    <figure className="case-diagram case-flow-diagram">
      <figcaption className="case-diagram-caption">
        <span>{label}</span>
        <small>{description}</small>
      </figcaption>
      <svg className="case-diagram-svg" viewBox="0 0 920 190" role="img" aria-label={description}>
        <title>{label}</title>
        <desc>{description}</desc>
        <defs>
          <marker id={`${project}-flow-arrow`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" />
          </marker>
        </defs>
        {steps.map((step, index) => {
          const x = 24 + index * 178;
          return (
            <g key={step}>
              {index > 0 && <path className="diagram-line" d={`M${x - 24} 95 H${x - 8}`} markerEnd={`url(#${project}-flow-arrow)`} />}
              <rect className="diagram-step" x={x} y="65" width="130" height="60" rx="2" />
              <text className="diagram-step-number" x={x + 14} y="87">0{index + 1}</text>
              <text className="diagram-step-label" x={x + 14} y="108">{step}</text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

function DiagramNode({ x, title, subtitle }: { x: number; title: string; subtitle: string }) {
  return (
    <g>
      <rect className="diagram-node" x={x} y="112" width="150" height="76" rx="2" />
      <text className="diagram-node-title" x={x + 14} y="143">{title}</text>
      <text className="diagram-node-subtitle" x={x + 14} y="164">{subtitle}</text>
    </g>
  );
}
