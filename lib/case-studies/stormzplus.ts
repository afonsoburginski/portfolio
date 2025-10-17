import { CaseStudy } from "./types";

export const stormzplus: CaseStudy = {
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
      subsections: [
        "Web App",
        "Auth & Database",
        "Payments",
        "Video Pipeline",
        "Observability"
      ],
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
      subsections: [
        "Content Management",
        "Customer Management",
        "Episode Ingestion"
      ],
      body: [
        "Full content CMS: create/update/delete titles, seasons, episodes, genres, and featured spots.",
        "Customer & subscription management: inspect accounts, handle plan changes, resolve invoice/payment issues.",
        "Episode ingestion: attach sources, trigger pipeline jobs, and track processing status.",
      ],
    },
    {
      title: "Video Pipeline (Go + FFmpeg NVENC)",
      subsections: [
        "Job Processing",
        "GPU Acceleration",
        "HLS Generation",
        "Cache Strategy"
      ],
      body: [
        "Each ingest job creates a UUID used for both the R2 folder and DB record, ensuring deterministic paths.",
        "FFmpeg is invoked with NVENC to leverage GPU lanes and accelerate ladder generation (multiple bitrates/resolutions).",
        "On completion, the worker persists the canonical HLS playlist URL, which becomes instantly available to the app.",
        "Immutable keys + far‑future caching headers enable excellent cache hit‑rates at the CDN edge.",
      ],
    },
    {
      title: "Lessons Learned",
      subsections: [
        "Idempotency",
        "Write Batching",
        "CDN Design"
      ],
      body: [
        "Idempotency and job queuing are critical for robust media pipelines.",
        "Batching playback writes drastically reduces DB load without losing fidelity.",
        "Designing for CDN first principles (immutable assets) pays dividends in latency and cost.",
      ],
    },
    {
      title: "Next Steps",
      subsections: [
        "Recommendations",
        "Seek Previews",
        "Publisher Accounts"
      ],
      body: [
        "Recommendations using viewing vectors and simple embeddings.",
        "Chapter thumbnails (VTT sprites) and improved seek previews.",
        "Self‑serve publisher accounts with guarded ingestion quotas.",
      ],
    },
  ],
};

