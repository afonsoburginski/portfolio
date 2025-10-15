"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { use } from "react";
import { ExternalLink, Github } from "lucide-react";

type CaseStudy = {
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  role: string;
  timeline: string;
  stack: string;
  objectives: string[];
  highlights: string[];
  liveUrl?: string;
  githubUrl?: string;
  // Narrative fields for article-style case study
  story?: string; // problem, vision, scope/MVP
  challenges?: { title: string; detail: string }[];
  outcomes?: string[]; // results, traction, revenue notes
  revenueNote?: string;
  sections?: { title: string; body: string[] }[];
};

const CASE_STUDIES: Record<string, CaseStudy> = {
  stormzplus: {
    title: "Stormzplus – Streaming Platform",
    description:
      "A full‑stack, subscription‑based streaming platform with a Netflix‑style UX. It ships multi‑profile accounts, curated content, watch progress, favorites, and a robust subscription flow. The video delivery uses HLS stored on Cloudflare R2 and distributed via CDN edge caching.",
    image: "/projects/stormzplus.png",
    role: "Full‑stack Engineer & Architect",
    timeline: "2024–2025",
    stack:
      "Next.js 15, React 19, Supabase (Auth/DB), PostgreSQL, Drizzle ORM, Go + FFmpeg (NVENC), Cloudflare R2 (HLS) + CDN, Stripe, Vercel, TypeScript, TailwindCSS, Framer Motion",
    liveUrl: "https://www.stormzplus.com/",
    story:
      "I built Stormzplus as a focused MVP to validate a curated streaming experience and subscription‑driven business model. In ~8 weeks I delivered the core UX, secure billing, and a production‑ready video pipeline that keeps costs predictable while maintaining excellent performance.",
    objectives: [
      "Design an experience users already understand: profiles, continue watching, favorites, and featured rows.",
      "Guarantee secure gated content via Supabase Auth + middleware guards tied to Stripe subscription status.",
      "Create a maintainable database model with Drizzle ORM for profiles, content metadata, episodes, playback progress, and billing events.",
      "Automate video ingestion and HLS packaging using a GPU‑accelerated FFmpeg worker (NVENC) that publishes to R2 with strong cache semantics.",
      "Optimize performance with App Router, Server Components, and CDN caching to hit green Core Web Vitals.",
    ],
    challenges: [
      {
        title: "GPU‑accelerated HLS pipeline (NVENC)",
        detail:
          "I built a Go service that orchestrates FFmpeg with NVENC across multiple codec ladders. Each ingest generates a UUID that names both the R2 directory and the database row; once packaging finishes, the service writes back the canonical HLS URL. Handling GPU contention and retryable jobs was the hardest part—solved with queued workers and idempotent records.",
      },
      {
        title: "Consistent playback state across devices",
        detail:
          "Playback events are normalized and batched into periodic checkpoints. That reduced write‑amplification and guarantees seamless resumes on mobile/desktop without drifting.",
      },
      {
        title: "Reliable subscription lifecycle",
        detail:
          "Stripe webhooks are fully idempotent; middleware verifies active plans on navigation. Users without an active plan are logged out and redirected with a friendly recovery path.",
      },
    ],
    highlights: [
      "HLS on Cloudflare R2 with edge caching and immutable asset keys.",
      "Custom video player with HLS, captions, resume playback, and resilient error handling.",
      "Role‑based gated routes with Supabase Auth and SSR checks.",
      "Admin dashboard to manage catalog, highlights, customers, subscriptions, episodes, and assets.",
      "Strong DX: Drizzle migrations, TypeScript everywhere, clean module boundaries.",
    ],
    outcomes: [
      "Deployed MVP with dozens of monthly active users and growing.",
      "Recurring revenue via Stripe from day one.",
      "Predictable infra cost thanks to CDN + R2 architecture.",
    ],
    revenueNote:
      "The product already drives recurring revenue with a steadily growing user base. The HLS‑at‑edge design keeps margins healthy while scaling.",
    sections: [
      {
        title: "Architecture Overview",
        body: [
          "Web app: Next.js 15 (App Router, RSC), React 19, TailwindCSS, Framer Motion.",
          "Auth & data: Supabase Auth + PostgreSQL accessed via Drizzle ORM.",
          "Payments: Stripe (checkout, plan changes, webhooks for source of truth).",
          "Video pipeline: Go service orchestrating FFmpeg with NVENC → HLS renditions → Cloudflare R2 storage → CDN edge cache.",
          "Observability & reliability: idempotent jobs, retry policies, and database audit fields.",
        ],
      },
      {
        title: "Admin Dashboard",
        body: [
          "Full content CMS: create/update/delete titles, seasons, episodes, genres, and featured spots.",
          "Customer & subscription management: inspect accounts, handle plan changes, resolve invoice/payment issues.",
          "Episode ingestion: attach sources, trigger pipeline jobs, and track processing status.",
        ],
      },
      {
        title: "Video Pipeline (Go + FFmpeg NVENC)",
        body: [
          "Each ingest job creates a UUID used for both the R2 folder and DB record, ensuring deterministic paths.",
          "FFmpeg is invoked with NVENC to leverage GPU lanes and accelerate ladder generation (multiple bitrates/resolutions).",
          "On completion, the worker persists the canonical HLS playlist URL, which becomes instantly available to the app.",
          "Immutable keys + far‑future caching headers enable excellent cache hit‑rates at the CDN edge.",
        ],
      },
      {
        title: "Lessons Learned",
        body: [
          "Idempotency and job queuing are critical for robust media pipelines.",
          "Batching playback writes drastically reduces DB load without losing fidelity.",
          "Designing for CDN first principles (immutable assets) pays dividends in latency and cost.",
        ],
      },
      {
        title: "Next Steps",
        body: [
          "Recommendations using viewing vectors and simple embeddings.",
          "Chapter thumbnails (VTT sprites) and improved seek previews.",
          "Self‑serve publisher accounts with guarded ingestion quotas.",
        ],
      },
    ],
  },
  orcanorte: {
    title: "Orça Norte – Real‑time Quotes Platform",
    description:
      "B2B marketplace for construction industry with real‑time quoting, vendor profiles, analytics, and subscription plans. Focus on performance, security and growth.",
    image: "/image.png",
    role: "Tech Lead & Full‑stack Engineer",
    timeline: "2024",
    stack: "Next.js, Node, Supabase/PostgreSQL, Cloudflare, Docker",
    objectives: [
      "Enable companies to receive and manage daily quotes efficiently.",
      "Build robust subscription flows and invoicing.",
      "Provide dashboards with actionable analytics.",
    ],
    highlights: [
      "Server‑side rendering, SEO, and fast indexed pages.",
      "Role‑based access, audit trails, and rate‑limited APIs.",
      "Edge cache and image optimization for catalog pages.",
    ],
  },
  gem: {
    title: "GEM – Internal Ops Portal",
    description:
      "Operational portal for teams: task pipelines, role permissions, and integrations. Designed for reliability and clear information architecture.",
    image: "/image.png",
    role: "Full‑stack Engineer",
    timeline: "2023–2024",
    stack: "Next.js, Node, PostgreSQL, Supabase, Docker",
    objectives: [
      "Consolidate workflows and reduce context switching.",
      "Expose secure internal APIs with auditing.",
      "Ship quickly with CI/CD and feature flags.",
    ],
    highlights: [
      "Accessible UI, keyboard navigation, and fast search.",
      "Strong data modeling and validation.",
      "Observability (logs/metrics/traces) for swift troubleshooting.",
    ],
  },
};

export default function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const data = CASE_STUDIES[slug];
  if (!data) return notFound();

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="relative z-20">
        <Header />
        <section className="relative pt-32 pb-20 px-6">
          <div className="max-w-[680px] mx-auto">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[42px] md:text-[52px] font-normal leading-[1.15] text-white font-satoshi mb-4"
            >
              {data.title}
            </motion.h1>

            {/* Metadata + Links */}
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
              <div className="flex items-center gap-4 text-white/60 text-sm font-sans">
                <span>{data.role}</span>
                <span>•</span>
                <span>{data.timeline}</span>
              </div>

              {(data.liveUrl || data.githubUrl) && (
                <div className="flex items-center gap-3">
                  {data.liveUrl && (
                    <a
                      href={data.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-[#0d0d0d] rounded-lg text-white/80 hover:text-white hover:bg-[#1a1a1a] transition-all text-sm font-sans"
                    >
                      <ExternalLink size={16} />
                      <span>Live Site</span>
                    </a>
                  )}
                  {data.githubUrl && (
                    <a
                      href={data.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-[#0d0d0d] rounded-lg text-white/80 hover:text-white hover:bg-[#1a1a1a] transition-all text-sm font-sans"
                    >
                      <Github size={16} />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Hero Image */}
            <div className="relative rounded-lg overflow-hidden aspect-[16/9] bg-black/40 mb-12">
              <Image
                src={data.image}
                alt={`${data.title} screenshot`}
                fill
                sizes="(max-width: 768px) 100vw, 680px"
                className="object-cover"
                priority
              />
            </div>

            {/* Story / Proposal */}
            {data.story && (
              <div className="mb-16">
                <h2 className="text-white font-satoshi text-[28px] mb-6 font-normal">Visão & MVP</h2>
                <p className="text-white/75 font-sans text-[21px] leading-[1.58] tracking-[-0.003em] font-light">
                  {data.story}
                </p>
              </div>
            )}

            {/* Description */}
            <div className="mb-16">
              <p className="text-white/75 font-sans text-[21px] leading-[1.58] tracking-[-0.003em] font-light">
                {data.description}
              </p>
            </div>

            {/* Stack */}
            <div className="mb-16">
              <h2 className="text-white font-satoshi text-[28px] mb-6 font-normal">Stack</h2>
              <p className="text-white/75 font-sans text-[21px] leading-[1.58] tracking-[-0.003em] font-light">
                {data.stack}
              </p>
            </div>

            {/* Objectives */}
            <div className="mb-16">
              <h2 className="text-white font-satoshi text-[28px] mb-6 font-normal">Objectives</h2>
              <ul className="space-y-4 text-white/75 font-sans text-[21px] leading-[1.58] tracking-[-0.003em] font-light">
                {data.objectives.map((o) => (
                  <li key={o} className="pl-8 relative before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:bg-white/40 before:rounded-full">
                    {o}
                  </li>
                ))}
              </ul>
            </div>

            {/* Challenges */}
            {data.challenges && data.challenges.length > 0 && (
              <div className="mb-16">
                <h2 className="text-white font-satoshi text-[28px] mb-6 font-normal">Desafios & Soluções</h2>
                <div className="space-y-6">
                  {data.challenges.map((c) => (
                    <div key={c.title} className="rounded-lg bg-[#0d0d0d] p-5 border border-white/5">
                      <p className="text-white font-sans mb-2">{c.title}</p>
                      <p className="text-white/70 font-sans text-[15px] leading-relaxed">{c.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            <div className="mb-16">
              <h2 className="text-white font-satoshi text-[28px] mb-6 font-normal">Key Highlights</h2>
              <ul className="space-y-4 text-white/75 font-sans text-[21px] leading-[1.58] tracking-[-0.003em] font-light">
                {data.highlights.map((h) => (
                  <li key={h} className="pl-8 relative before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:bg-white/40 before:rounded-full">
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Optional narrative sections */}
            {data.sections && data.sections.length > 0 && (
              <div className="mb-16">
                {data.sections.map((s) => (
                  <div key={s.title} className="mb-12">
                    <h2 className="text-white font-satoshi text-[28px] mb-6 font-normal">{s.title}</h2>
                    <div className="space-y-4">
                      {s.body.map((p, idx) => (
                        <p key={idx} className="text-white/75 font-sans text-[21px] leading-[1.58] tracking-[-0.003em] font-light">{p}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Outcomes */}
            {data.outcomes && data.outcomes.length > 0 && (
              <div className="mb-10">
                <h2 className="text-white font-satoshi text-[28px] mb-6 font-normal">Resultados</h2>
                <ul className="space-y-3 text-white/80 font-sans text-base leading-relaxed">
                  {data.outcomes.map((o) => (
                    <li key={o} className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-white/40">
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.revenueNote && (
              <div className="rounded-lg bg-[#0d0d0d] p-5 border border-white/5 text-white/80 font-sans">
                {data.revenueNote}
              </div>
            )}
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
}


