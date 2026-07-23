# AFONSO KEVIN BURGINSKI

## Senior Full-Stack Engineer — Distributed Systems · Video Streaming · NestJS / Next.js

Email: afonsoburginski@gmail.com • Portfolio: afonsodev.com • GitHub: github.com/afonsoburginski • LinkedIn: linkedin.com/in/afonsoburginski

## SUMMARY

Senior Full-Stack Engineer with 7 years of market experience architecting and operating distributed systems end to end. Currently owns the streaming domain of a large-scale smart-city video monitoring platform — WebRTC, LL-HLS, real-time analytics and event-driven microservices on Kubernetes. Deep specialist in video streaming and platform engineering; staff-track scope with full ownership from system design to production.

## SKILLS

**Backend & Microservices:** NestJS, Node.js, Go, Kotlin (Ktor), Kafka, Redis, BullMQ, Kong, CQRS, Event-Driven Architecture, REST, WebSockets
**Data:** PostgreSQL (time partitioning, zero-downtime indexing), Prisma, Drizzle, Supabase
**Video & Streaming:** FFmpeg/NVENC, WebRTC, HLS/LL-HLS, ABR, H.264/H.265, ONVIF, LiveKit, Cloudflare R2/CDN
**Frontend:** Next.js (App Router, RSC), React, Angular, TypeScript, TailwindCSS, Zustand, TanStack Query
**Quality & Observability:** Testcontainers, Jest, Prometheus, Pino structured logging
**DevOps & Cloud:** Docker, Kubernetes (RKE2), Helm, Terraform, GitHub Actions, Nx monorepo (remote cache), AWS, Vercel

## EXPERIENCE

### Senior Software Engineer — Atman Systems
Mar 2026 – Present | Brazil

- Owns the streaming domain of a large-scale smart-city video platform: WebRTC with LL-HLS fallback (~250ms), dynamic H.265/H.264 codec negotiation per-client and adaptive quality via native camera substreams — infrastructure cost per camera, not per viewer.
- Built the real-time video analytics pipeline: per-frame detections on edge devices, on-device Kafka producers and an idempotent reconciler that restores analytics state after device reboots.
- Designed multi-camera event correlation (sliding-window clustering, UUIDv5 alarm dedup, auto-resolution) and telemetry at scale — time-partitioned PostgreSQL, Prometheus metrics, zero-downtime indexing.
- Delivered the platform's notification gateway from scratch: email, WhatsApp, WebSocket and push via BullMQ (exponential backoff, DLQ), multi-locale Handlebars templates and full audit trail.
- Established CI integration-test gate (Testcontainers), remote Nx cache and production Kubernetes provisioning (RKE2 + Terraform + Helm); 75+ merged PRs in 5 months. Selected to lead the platform's upcoming mobile application.

### Full Stack Engineer — JHONROB Silos e Secadores
Nov 2023 – Mar 2026 | Brazil

- Led GEM ERP (Next.js + Supabase/PostgreSQL): reduced commercial proposal errors by 80%, increased monthly profit ~14%, 100+ daily active users — real-time multi-view Kanban, corporate chat, GPT-powered assistant and append-only audit trail.
- Engineered Kotlin Multiplatform tooling (Compose + Ktor + SQLDelight) for automated CAD export workflows and Android field-ops modules; multi-layer caching with sub-200ms real-time sync via Docker/Nginx VPS.

### Senior Full-Stack Engineer — afonsodev.com (Founder & Independent Consultant)
Jan 2020 – Present | Remote

**Stormzplus — Subscription VOD Platform (Founder & Lead Engineer)**
- Full-stack streaming platform: Next.js + Supabase, GPU-accelerated Go/FFmpeg/NVENC transcoding (240p–4K HLS), Cloudflare R2/CDN, Stripe + Mercado Pago PIX subscriptions with idempotent webhooks.
- LiveKit Watch Party (up to 50 concurrent viewers) with custom signaling over data channels; custom HLS player with captions, resume, quality selector and background playback.

**Orça Norte — B2B Construction Marketplace (orcanorte.com.br)**
- SSR/ISR marketplace for 500+ companies: multi-tenant vendor system, subscription plans, RBAC and operational dashboards. Next.js, Prisma, PostgreSQL, NextAuth.

### Full Stack Developer — TopSapp
Jan 2021 – Sep 2022 | Brazil
- ISP management interfaces (Next.js/React); legacy system migration; GitLab CI/CD; Scrum/Kanban delivery.

### System Developer — Ecocentauro Sistemas Inteligentes
Jan 2019 – Oct 2020 | Brazil
- PostgreSQL schema design, query optimization and financial/operational reporting.

## OPEN SOURCE

**Next.js FFmpeg Transcoder** (MIT) · github.com/afonsoburginski/nextjs-ffmpeg-transcoder
Go video ingestion service with FFmpeg/NVENC GPU acceleration, HLS transcoding and Cloudflare R2 storage.

## EDUCATION & CERTIFICATIONS

**B.Sc. Information Systems** — Unemat Sinop · 2020–2024
Meta Back-End Developer Professional Certificate · IBM Full Stack Software Developer Professional Certificate

## LANGUAGES

Portuguese: Native · English: B2 — technical communication and client meetings
