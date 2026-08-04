# AFONSO KEVIN BURGINSKI

## Senior Full-Stack Engineer — Distributed Systems · Video Streaming · NestJS / Next.js

Email: afonsoburginski@gmail.com • Portfolio: afonsodev.com • GitHub: github.com/afonsoburginski • LinkedIn: linkedin.com/in/afonsoburginski

## PROFESSIONAL SUMMARY

Senior Full-Stack Engineer with 7 years of market experience, working across the entire stack, from frontend to infrastructure, and a specialist in video streaming and distributed systems. I currently own the camera and video domain of a large-scale smart-city video monitoring platform, which involves WebRTC, LL-HLS, real-time analytics and event-driven microservices on Kubernetes, with full ownership from system design to production. I work daily with Spec-Driven Development (SDD) and AI coding agents.

## SKILLS

**Backend & Microservices:** NestJS, Node.js, Go, Kotlin (Ktor), Kafka, Redis, BullMQ, Kong, CQRS, event-driven architecture, REST, WebSockets
**Data:** PostgreSQL (time partitioning, zero-downtime indexing), Prisma, Drizzle, Supabase
**Video & Streaming:** FFmpeg/NVENC, WebRTC, HLS/LL-HLS, ABR, H.264/H.265, ONVIF, LiveKit, Cloudflare R2/CDN
**Frontend & Mobile:** Next.js (App Router, RSC), React, TypeScript, TailwindCSS, Zustand, TanStack Query, React Native (Expo)
**AI-Assisted Engineering:** Spec-Driven Development (SDD), AI coding agents (Claude Code), MCP servers, LLM-powered product features (OpenAI GPT)
**DevOps & Quality:** Docker, Kubernetes (RKE2), Helm, Terraform, GitHub Actions, Nx monorepo (remote cache), Testcontainers, Prometheus, Pino

## PROFESSIONAL EXPERIENCE

### Senior Software Engineer — Atman Systems
Mar 2026 – Present | Brazil

- Own the camera and video domain of a large-scale smart-city video platform, built on 27 NestJS microservices with an Nx monorepo, Kafka, Kong, PostgreSQL/Prisma, Redis and CQRS.
- Architected the platform's low-latency streaming stack, which combines WebRTC with LL-HLS fallback (~250 ms), dynamic H.265/H.264 codec negotiation based on client capability and adaptive quality through native camera substreams, keeping infrastructure costs tied to cameras rather than viewers.
- Built the real-time video analytics pipeline, with per-frame detections on edge devices, on-device Kafka producers and idempotent reconciliation after reboots, as well as multi-camera event correlation with sliding-window clustering and UUIDv5 alarm deduplication on time-partitioned PostgreSQL.
- Delivered the platform's notification gateway from scratch, with email, WhatsApp, WebSocket and push channels backed by BullMQ (exponential backoff and DLQ), multi-language Handlebars templates and a complete audit trail.
- Established the CI integration-test gate (Testcontainers), the remote Nx cache and the production Kubernetes provisioning (RKE2, Terraform and Helm); merged 75+ pull requests in 5 months and am the lead engineer responsible for the platform's mobile application.
- Work with Spec-Driven Development (SDD) and AI coding agents (Claude Code) in the delivery workflow, in which features are specified before implementation and executed under human review and CI gates.

### Full-Stack Engineer — JHONROB Silos e Secadores
Nov 2023 – Mar 2026 | Brazil

- Led GEM ERP (Next.js and Supabase/PostgreSQL) and built its mobile app in React Native, achieving an 80% reduction in commercial proposal errors, a ~14% increase in monthly profit and 100+ daily active users, with real-time multi-view Kanban, corporate chat, a GPT-powered assistant and an append-only audit trail.
- Developed Kotlin Multiplatform tooling (Compose, Ktor and SQLDelight) for automated CAD export workflows and Android modules for factory floor operators, with multi-layer caching and sub-200 ms real-time sync on a Docker/Nginx VPS.

### Senior Full-Stack Engineer — afonsodev.com (Founder & Independent Consultant)
Jan 2020 – Present | Remote

**Stormzplus — Subscription Streaming Platform (Founder)** · mobile, web and admin
- Built the entire VOD platform with Next.js and Supabase, a GPU-accelerated Go transcoding pipeline using FFmpeg/NVENC (240p to 4K HLS), Cloudflare R2/CDN, and Stripe and Mercado Pago (PIX) subscriptions with idempotent webhooks.
- Implemented a Watch Party via LiveKit that supports up to 50 concurrent viewers with custom signaling over data channels, plus a custom HLS player with subtitles, playback resume, a quality selector and background playback.

**Orça Norte — B2B Construction Marketplace (orcanorte.com.br)** · App Store
- Built an SSR/ISR marketplace with 500+ registered companies, a multi-tenant vendor system, subscription plans, RBAC and operational dashboards, using Next.js, Prisma, PostgreSQL and NextAuth.
- Shipped the marketplace's consumer app to the App Store, developed with Expo and expo-router, TanStack Query, Sign in with Apple, push notifications and OTA updates.

### Full-Stack Developer — TopSapp
Jan 2021 – Sep 2022 | Brazil
- Developed management interfaces for internet service providers with Next.js and React, migrated legacy systems and worked with GitLab CI/CD in Scrum and Kanban deliveries.

### System Developer — Ecocentauro Sistemas Inteligentes
Jan 2019 – Oct 2020 | Brazil
- Designed PostgreSQL schemas, optimized queries and built financial and operational reports.

## OPEN SOURCE

**Next.js FFmpeg Transcoder** (MIT) · github.com/afonsoburginski/nextjs-ffmpeg-transcoder
Go video ingestion service with GPU acceleration (FFmpeg/NVENC), HLS transcoding and Cloudflare R2 storage.

## EDUCATION & LANGUAGES

**B.Sc. in Information Systems** — Unemat Sinop · 2020–2024
Certifications: Meta Back-End Developer Professional Certificate · IBM Full Stack Software Developer Professional Certificate
Languages: Portuguese (native) · English (B2 — technical communication and client meetings)
