# AFONSO KEVIN BURGINSKI

## Senior Full-Stack Engineer (Distributed Systems / Video Streaming / NestJS / Next.js)

Email: afonsoburginski@gmail.com • Portfolio: afonsodev.com • GitHub: github.com/afonsoburginski • LinkedIn: linkedin.com/in/afonsoburginski

## SUMMARY

Senior Full-Stack Engineer with 7 years of market experience architecting, building and operating production systems end to end. Currently owns the camera and video domain of a large-scale smart-city video monitoring platform — 27 NestJS microservices communicating over Kafka behind a Kong gateway — driving architecture decisions from system design to Kubernetes production. Deep specialist in video streaming: WebRTC, LL-HLS, FFmpeg encoding pipelines, codec strategy and adaptive bitrate, applied both to enterprise platforms and to Stormzplus, the subscription streaming product founded and engineered solo. Consistently raises the engineering bar through CI/CD quality gates, integration-testing standards and end-to-end observability. Operates at the intersection of architecture, hands-on delivery and platform enablement — staff-track scope.

## SKILLS

Backend & Microservices: NestJS, Node.js, Go, Kotlin (Ktor), Kafka, Redis, BullMQ, Kong API Gateway, CQRS, Event-Driven Architecture, DDD, REST APIs, WebSockets (Socket.IO)
Data: PostgreSQL (time partitioning, zero-downtime indexing), Prisma ORM, Drizzle ORM, Supabase (Auth/DB/Realtime/Storage)
Video & Streaming: FFmpeg/NVENC, WebRTC, HLS/LL-HLS, adaptive bitrate (ABR), H.264/H.265 codec strategy, ONVIF, LiveKit (WebRTC SFU), Cloudflare R2/CDN
Frontend: Next.js (App Router, RSC), React, Angular, TypeScript, TailwindCSS, Zustand, TanStack React Query, SWR
Quality & Observability: Jest, Testcontainers, Supertest, Prometheus, Pino structured logging, liveness/readiness health checks
DevOps & Cloud: Docker, Kubernetes (RKE2), Helm, Terraform, GitHub Actions, Nx monorepo (remote caching), Nginx, AWS EC2, Vercel, Linux/VPS
Payments & AI: Stripe (subscriptions, idempotent webhooks), Mercado Pago (PIX), OpenAI GPT integration

## EXPERIENCE

### Senior Software Engineer — Atman Systems
Mar 2026 – Present | Brazil

- Own the camera and video domain of a large-scale smart-city video monitoring and urban traffic platform built as 27 NestJS microservices (Nx monorepo, Kafka, Kong API Gateway, PostgreSQL/Prisma, Redis, CQRS/DDD), driving architecture decisions from system design through production operation.
- Architected the platform's low-latency adaptive streaming stack: WebRTC with automatic LL-HLS fallback (~250ms), dynamic H.265/H.264 codec negotiation with per-client capability detection, and adaptive quality leveraging native camera substreams (Axis/Hikvision) — keeping infrastructure cost per camera rather than per viewer.
- Built a real-time embedded video analytics pipeline integrated with edge devices: per-frame detections rendered as bounding boxes in the live player, on-device Kafka producers to minimize network overhead, and an idempotent reconciler that restores analytics automatically after device reboots.
- Designed a multi-camera event correlation engine: 60-second sliding-window clustering, deterministic alarm emission with UUIDv5 deduplication, 4-tier severity mapping and automatic resolution policies.
- Implemented camera health and telemetry at scale: 5-minute availability windows with 90-day rollups over time-partitioned PostgreSQL; latency, bitrate, packet-loss and TTFF metrics exposed via Prometheus; zero-downtime index deployments (CREATE INDEX CONCURRENTLY).
- Designed and delivered the platform's notification gateway microservice from scratch — email, WhatsApp, WebSocket and push channels backed by BullMQ (retry with exponential backoff, dead-letter queue), multi-locale Handlebars templates and a full PostgreSQL audit trail.
- Implemented vendor-agnostic PTZ camera control over ONVIF Profile S: relative/absolute/continuous REST commands, driver load balancing and complete command auditing.
- Raised the platform's engineering bar: integration-test CI gate with Testcontainers (real PostgreSQL), artifact hash filtering to eliminate false rebuild fan-out, self-hosted remote Nx cache (MinIO), and production Kubernetes provisioning (RKE2 + Terraform + Helm, 22 deployments).
- Selected to lead the architecture and delivery of the platform's upcoming mobile application; shipped 75+ merged pull requests across seven domains within the first five months.

### Full Stack Engineer — JHONROB Silos e Secadores
Nov 2023 – Mar 2026 | Brazil

- Led conception and development of GEM (Next.js App Router + Supabase/PostgreSQL) — enterprise ERP that replaced spreadsheet workflows with real-time collaboration: multi-view Kanban with drag-and-drop, corporate chat (channels, threads, voice messages), productivity dashboards, GPT-powered context-aware assistant, append-only audit trail (20+ event types) and server-side RBAC.
- Reduced error rate in commercial proposals by 80% and increased monthly profit by approximately 14%; 100+ daily active users across departments with 99.9% uptime.
- Engineered multi-layer caching (Zustand + TanStack Query + in-memory) with SSR/RSC strategy and sub-200ms real-time sync; 5,000+ lines of Prisma schema; deployed via Docker and Nginx on dedicated VPS.
- Developed Kotlin backend services and Kotlin Multiplatform tooling (Compose Multiplatform + Ktor + SQLDelight) for automated CAD export workflows; desktop application with Tauri for offline-first factory environments.

### Senior Full-Stack Engineer — afonsodev.com (Independent Consultant & Product Founder)
Jan 2020 – Present | Remote

**Stormzplus — Subscription Streaming Platform (Founder & Lead Engineer)**
- Founded and built a full-stack subscription VOD platform: Next.js (App Router, RSC), Supabase Auth/DB, PostgreSQL and Drizzle ORM — multi-profile accounts with tier-based feature gating, watch progress, favorites and curated rows.
- GPU-accelerated video pipeline: Go service orchestrating FFmpeg with NVIDIA NVENC for multi-bitrate HLS transcoding (240p–4K), stored on Cloudflare R2 with CDN edge caching; streaming I/O supporting 10GB+ uploads.
- Stripe billing + Mercado Pago (PIX) with idempotent webhooks and full subscription lifecycle; LiveKit WebRTC SFU for real-time Watch Party (up to 50 concurrent viewers) with custom signaling over data channels.
- Custom HLS player with captions, resume playback, quality selector and resilient error handling; full admin CMS with FFmpeg job tracking and real-time ingestion progress.

**Orça Norte — B2B Quotes Marketplace (orcanorte.com.br)**
- Built a construction marketplace serving 500+ registered companies: SEO-first architecture (SSR/ISR), multi-tenant vendor system with roles and audit trails, subscription plans and operational dashboards. Next.js, Prisma, PostgreSQL, NextAuth, TanStack Query.

### Full Stack Engineer — TopSapp (Gestão de Provedores)
Jan 2021 – Sep 2022 | Brazil

- Built and maintained ISP-management web interfaces with Next.js; migrated legacy modules to React/Next.js; implemented CI/CD pipelines with GitLab and agile delivery (Scrum/Kanban).

### System Programmer — Ecocentauro Sistemas Inteligentes
Jan 2019 – Oct 2020 | Brazil

- Managed PostgreSQL databases, schema design and query optimization; developed financial and operational reporting layouts.

## OPEN SOURCE

### Next.js FFmpeg Transcoder (MIT)
- Production-grade video ingestion and HLS transcoding extracted from Stormzplus: Go server with streaming I/O (10GB+ files), FFmpeg/NVENC GPU acceleration, Cloudflare R2 storage, Next.js admin dashboard.
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
