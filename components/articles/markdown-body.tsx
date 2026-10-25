import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiCloudflare } from "react-icons/si";
import { Diagram } from "./diagrams";
import { DeclarativeDiagram } from "./diagrams/declarative-diagram";
import { isDeclarative } from "@/lib/diagrams/validate";
import { CLOUDFLARE_ORANGE } from "./diagram-kit";
import { slugify } from "./slug";

function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : isValidElement<{ children?: ReactNode }>(c) ? textOf(c.props.children) : ""))
    .join("");
}

const COL = "max-w-[820px]";

const LOGOS = {
  cloudflare: { label: "Cloudflare R2 + CDN", icon: SiCloudflare, color: CLOUDFLARE_ORANGE },
} as const;

type LogoId = keyof typeof LOGOS;

function isLogo(id: string): id is LogoId {
  return id in LOGOS;
}

function BuiltOn({ ids }: { ids: LogoId[] }) {
  return (
    <div className="not-prose my-8 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-md">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">Built on</span>
      {ids.map((id) => {
        const { label, icon: Icon, color } = LOGOS[id];
        return (
          <span key={id} className="flex items-center gap-3 text-base font-medium text-white">
            <Icon size={26} color={color} aria-hidden="true" />
            {label}
          </span>
        );
      })}
    </div>
  );
}

function withInlineIcons(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child !== "string" || !child.includes(":cloudflare:")) return child;
    return child.split(":cloudflare:").flatMap((part, i, all) => [
      part,
      i < all.length - 1 ? <SiCloudflare key={i} size={16} color={CLOUDFLARE_ORANGE} aria-hidden="true" className="mx-1 inline-block -translate-y-px" /> : null,
    ]);
  });
}

function Heading({ level, children }: { level: 2 | 3; children?: ReactNode }) {
  const id = slugify(textOf(children));
  const Tag = level === 2 ? "h2" : "h3";
  const style =
    level === 2
      ? `${COL} mt-16 mb-5 border-t border-white/10 pt-8 text-[30px] font-normal leading-tight text-white font-satoshi`
      : `${COL} mt-10 mb-4 text-xl font-semibold text-white`;
  return (
    <Tag id={id} className={`group relative scroll-mt-28 ${style}`}>
      <a href={`#${id}`} aria-label="Link to this section" className="absolute -left-6 top-0 hidden text-[#58a6ff] no-underline opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 lg:block" style={level === 2 ? { top: "2rem" } : undefined}>
        #
      </a>
      {children}
    </Tag>
  );
}

const CHIP = {
  HLS: "border-[#58a6ff]/40 bg-[#1f6feb]/15 text-[#79b8ff]",
  "LL-HLS": "border-[#2dd4bf]/40 bg-[#2dd4bf]/10 text-[#5eead4]",
  WebRTC: "border-white/30 bg-white/10 text-white",
  Benchmark: "border-[#ffb020]/30 bg-[#ffb020]/10 text-[#ffc659]",
} as const;

function chipFor(text: string): string | null {
  if (text === "HLS" || text === "LL-HLS") return CHIP[text];
  if (text.startsWith("WebRTC")) return CHIP.WebRTC;
  if (text.includes("benchmark first")) return CHIP.Benchmark;
  return null;
}

export function MarkdownBody({ body }: { body: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => <Heading level={2}>{children}</Heading>,
        h3: ({ children }) => <Heading level={3}>{children}</Heading>,
        p: ({ node, children }) => {
          const only = node?.children?.length === 1 ? (node.children[0] as { tagName?: string }) : null;
          if (only?.tagName === "strong") {
            return <p className={`${COL} my-7 rounded-r-xl border-l-2 border-[#2dd4bf] bg-[#2dd4bf]/[0.06] py-4 pl-5 pr-4 text-white/90`}>{withInlineIcons(children)}</p>;
          }
          return <p className={`${COL} my-6`}>{withInlineIcons(children)}</p>;
        },
        strong: (p) => <strong className="font-semibold text-white" {...p} />,
        a: ({ href = "", ...p }) => {
          const external = href.startsWith("http");
          return (
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="text-[#58a6ff] underline decoration-white/20 underline-offset-4 transition-colors hover:decoration-[#58a6ff]"
              {...p}
            />
          );
        },
        ul: (p) => <ul className={`${COL} my-6 list-disc space-y-2 pl-6 marker:text-white/30`} {...p} />,
        li: ({ children, ...p }) => <li {...p}>{withInlineIcons(children)}</li>,
        ol: (p) => <ol className={`${COL} my-6 list-decimal space-y-2 pl-6 marker:text-white/30`} {...p} />,
        pre: ({ children }) => {
          const el = Array.isArray(children) ? children[0] : children;
          if (isValidElement<{ className?: string; children?: ReactNode }>(el) && /language-diagram/.test(el.props.className ?? "")) {
            const source = textOf(el.props.children).trim();
            return isDeclarative(source) ? <DeclarativeDiagram source={source} /> : <Diagram id={source} />;
          }
          if (isValidElement<{ className?: string; children?: ReactNode }>(el) && /language-logos/.test(el.props.className ?? "")) {
            const ids = textOf(el.props.children).split(/\s+/).filter(isLogo);
            return ids.length ? <BuiltOn ids={ids} /> : null;
          }
          return <pre className={`${COL} my-6 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/85`}>{children}</pre>;
        },
        code: ({ className, ...p }) =>
          className?.includes("language-") ? (
            <code className={className} {...p} />
          ) : (
            <code className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[0.88em] text-[#e6edf3]" {...p} />
          ),
        blockquote: (p) => <blockquote className={`${COL} my-8 rounded-r-xl border-l-2 border-[#58a6ff]/60 bg-white/[0.03] py-3 pl-5 pr-4 italic text-white/65`} {...p} />,
        table: (p) => (
          <div className="my-8 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm max-lg:overflow-x-auto">
            <table className="w-full text-left text-[15px] leading-6" {...p} />
          </div>
        ),
        tr: (p) => <tr className="even:bg-white/[0.025]" {...p} />,
        th: (p) => <th className="sticky top-0 border-b border-white/10 bg-[#0d1117] px-4 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-white/60 first:rounded-tl-xl last:rounded-tr-xl lg:top-20" {...p} />,
        td: ({ children, ...p }) => {
          const chip = chipFor(textOf(children));
          return (
            <td className="border-b border-white/5 px-4 py-3 align-top text-white/70" {...p}>
              {chip ? <span className={`inline-block rounded-lg border px-2.5 py-1 text-sm leading-5 ${chip}`}>{children}</span> : children}
            </td>
          );
        },
      }}
    >
      {body}
    </ReactMarkdown>
  );
}
