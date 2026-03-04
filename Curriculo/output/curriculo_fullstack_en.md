# AFONSO KEVIN BURGINSKI

## Senior Full-Stack Engineer (Next.js / React / Supabase / Go)

Email: afonsoburginski@gmail.com • Portfolio: afonsodev.com • GitHub: github.com/afonsoburginski • LinkedIn: linkedin.com/in/afonsoburginski

## SUMMARY

Senior Full-Stack Engineer with 6+ years designing, building and shipping entire products used by thousands every day. Works across the full stack from database modeling and real-time APIs to polished, high-performance UIs. Deep expertise in real-time architectures, multi-layer caching strategies (SSR/RSC, Zustand, TanStack Query), payment integrations, video pipelines and AI-powered features. Focused on delivering systems that drive real business results with clean architecture, RBAC, audit trails and scalable infrastructure. Full ownership of the product lifecycle: architecture, backend services, frontend, DevOps and deployment.

## SKILLS

Frontend: Next.js (App Router, RSC, Turbopack), React, TypeScript, TailwindCSS, Radix UI, Framer Motion, Zustand, TanStack React Query, SWR, Recharts, ReactFlow
Backend & Data: Supabase (Auth/DB/Realtime/Storage), PostgreSQL, Prisma ORM, Drizzle ORM, Go, Kotlin, Node.js, REST APIs
Payments & Billing: Stripe (checkout, webhooks, subscriptions), Mercado Pago (PIX)
Real-time & Video: LiveKit (WebRTC SFU), WebSockets, Supabase Realtime, FFmpeg/NVENC (HLS transcoding), Cloudflare R2/CDN
AI: OpenAI GPT integration, context-aware assistants, function execution
Architecture: Clean Architecture, SOLID, RBAC, SSR/ISR, real-time sync, offline-first, HLS video pipelines
DevOps & Cloud: Docker, AWS EC2, Nginx, Vercel, Cloudflare R2/CDN, Tauri, CI/CD, Linux/VPS, Git/GitHub

## EXPERIENCE

### Full Stack Engineer — JHONROB Silos e Secadores
Nov 2023 – Present | Brazil

- Led conception and development of GEM (Next.js App Router + Supabase/Postgres) — enterprise ERP that replaced Excel-based workflows, accelerating company processes by up to 80% and eliminating communication gaps through real-time collaboration and append-only audit trail.
- Multi-layer caching (Zustand + TanStack Query + in-memory), SSR/RSC strategy and real-time subscriptions; 5,000+ lines of Prisma schema. Deployed via Docker and Nginx on dedicated VPS.
- **Dashboards & Analytics**: construction progress tracking, productivity metrics per user and per column, completion rates, trend analysis (7d/30d/90d/1y), financial dashboards (accounts payable/receivable), all powered by Recharts.
- **Real-time Kanban**: multi-view (board, table, list, consultation) with drag-and-drop (dnd-kit), subtasks with time tracking, task triggers/automation, attachments via Supabase Storage, comments with mentions, and real-time multi-user cursor tracking.
- **Corporate chat**: workspaces, public/private channels, DMs, threads, reactions, mentions, voice messages, pinned messages, announcements, and document sharing — all real-time via Supabase Realtime/WebSockets, validated in multi-user scenarios.
- **AI assistant**: GPT-powered context-aware assistant integrated into chat that can execute functions, generate channel summaries, extract updates and perform AI-powered search.
- **Audit & RBAC**: append-only audit log with before/after snapshots and 20+ event types; full traceability of critical changes and server-side RBAC validation.
- Developed Kotlin backend services and native tooling (Kotlin Multiplatform + Ktor + SQLDelight) for automated CAD file export workflows.
- Desktop application with Tauri for offline-first workflows in factory environments.

### Senior Full-Stack Developer — afonsodev.com (Independent Consultant)
Jan 2020 – Present | Remote

**Stormzplus — Subscription Streaming Platform (Web + Admin)**
- Built full-stack web platform with Next.js (App Router, RSC), React, Supabase Auth/DB, PostgreSQL and Drizzle ORM — multi-profile accounts with tier-based feature gating (FREE/STANDARD/PREMIUM), curated content, watch progress, favorites and featured rows.
- GPU-accelerated video pipeline: Go service orchestrating FFmpeg with NVIDIA NVENC for multi-bitrate HLS transcoding (240p–4K), stored on Cloudflare R2 with CDN edge caching and immutable asset keys. Streaming I/O supporting 10GB+ uploads.
- Stripe billing + Mercado Pago (PIX) with idempotent webhooks and full subscription lifecycle management.
- Integrated LiveKit WebRTC SFU for real-time Watch Party (up to 50 concurrent viewers) — custom signaling protocol over data channels with host/viewer sync, fallback to Supabase Broadcast for resilience.
- Custom HLS video player with captions, resume playback, quality selector (240p–4K), skip intro/outro chapter detection and resilient error handling.
- Role-based gated routes with Supabase Auth and SSR middleware checks tied to plan tier. Multi-layer caching (Zustand + SWR + in-memory).
- Full admin CMS: content management (titles, seasons, episodes, genres), customer & subscription management, episode ingestion pipeline with FFmpeg job tracking and real-time progress.
- Desktop app with Tauri for native performance.

**Orça Norte — B2B Quotes Marketplace (orcanorte.com.br)**
- Built a construction marketplace serving 500+ registered companies and thousands of end-users generating quotes daily.
- Next.js, Prisma ORM, PostgreSQL, NextAuth, Zustand, TanStack React Query, Recharts, Radix UI.
- SEO-first architecture with SSR/ISR and indexable vendor/product pages. Multi-tenant vendor system with roles, audit trails and bulk import. Subscription plans with zero selling fees and boosted ranking.

### Full Stack Engineer — TopSapp (Gestão de Provedores)
Jan 2021 – Sep 2022 | Brazil

- Built and maintained web interfaces with Next.js for ISP management (customer data, billing, support flows). Migrated legacy modules to React/Next.js. Implemented CI/CD pipelines with GitLab and agile methodologies (Scrum/Kanban).

### System Programmer — Ecocentauro Sistemas Inteligentes
Jan 2019 – Oct 2020 | Brazil

- Managed PostgreSQL databases, schema design and query optimization. Developed report layouts for financial and operational reporting.

## OPEN SOURCE

### Next.js FFmpeg Transcoder (MIT)
- Production-grade video ingestion and HLS transcoding extracted from Stormzplus. Unlimited uploads via Go server with streaming I/O (10GB+), FFmpeg/NVENC GPU acceleration, Cloudflare R2 storage, modern Next.js admin dashboard.
- github.com/afonsoburginski/nextjs-ffmpeg-transcoder

## CERTIFICATIONS

- Meta Back-End Developer Professional Certificate (Meta)
- IBM Full Stack Software Developer Professional Certificate (IBM)

## EDUCATION

### Bachelor's Degree in Information Systems — Unemat Sinop
2020 – 2024 | Brazil

## LANGUAGES

Portuguese: Native
English: B2 — comfortable with technical communication and client meetings
