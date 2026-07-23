# AFONSO KEVIN BURGINSKI

## Senior Mobile Engineer — React Native · Kotlin · Swift · Media & Streaming Specialist

Email: afonsoburginski@gmail.com • Portfolio: afonsodev.com • GitHub: github.com/afonsoburginski • LinkedIn: linkedin.com/in/afonsoburginski

## SUMMARY

Senior Mobile Engineer with 7 years of market experience shipping production apps to the App Store and Google Play. Rare depth in media and streaming — from FFmpeg pipelines and codec strategy to hardware-accelerated players and native Swift modules (PiP, AirPlay). Currently owns the streaming architecture of a large-scale smart-city video platform and selected to lead its upcoming mobile application.

## SKILLS

**Mobile:** React Native (New Architecture), Kotlin, Swift, Kotlin Multiplatform, Compose Multiplatform, Jetpack Compose, SwiftUI, Android SDK, iOS SDK
**Media & Streaming:** HLS/LL-HLS, WebRTC, FFmpeg/NVENC, ABR, H.264/H.265, React Native Video, expo-video, LiveKit, native PiP/AirPlay (Swift)
**State & Data:** Zustand, SWR, AsyncStorage, SQLDelight, Supabase, PostgreSQL
**Real-time:** WebSockets (Socket.IO), Supabase Realtime, Kafka-backed pipelines, Firebase Push
**Release & Quality:** EAS Build, Fastlane, App Store Connect, Google Play Console, GitHub Actions, Testcontainers, Docker

## EXPERIENCE

### Senior Software Engineer — Atman Systems
Mar 2026 – Present | Brazil

- Owns the end-to-end streaming architecture of a large-scale smart-city video platform: WebRTC with LL-HLS fallback (~250ms), dynamic H.265/H.264 codec negotiation per client capability, adaptive quality via native camera substreams.
- Designed the real-time layer consumed by client applications: Socket.IO room-based subscriptions with JWT auth at handshake, pushing live stream status, camera health and analytics events.
- Built the live video analytics experience: per-frame bounding-box overlays in the player fed by an on-device Kafka pipeline with idempotent reconciliation after device reboots.
- Selected to lead the architecture and delivery of the platform's upcoming mobile application; 75+ merged PRs in 5 months; CI quality gates (Testcontainers), Prometheus/Pino observability, production K8s (RKE2 + Terraform + Helm).

### Senior Mobile Engineer — afonsodev.com (Founder & Independent Consultant)
Jan 2020 – Present | Remote

**Stormzplus — Subscription Streaming Platform (Founder & Lead Engineer)** · App Store · Google Play
- Production React Native app (New Architecture): multi-profile accounts, subscription management, EAS Build/Fastlane, Universal Links (iOS) + App Links (Android).
- Custom HLS player with hardware-accelerated ABR (240p–4K), buffer tuning, chapter detection, subtitle support, background playback, native Swift modules for PiP and AirPlay.
- Watch Party via LiveKit: custom signaling protocol over data channels, host/viewer sync broadcast, 5-retry backoff for late joiners.
- Owns the full media backend: Go + FFmpeg/NVENC transcoding pipeline, Cloudflare R2/CDN, Stripe + Mercado Pago PIX subscriptions with idempotent webhooks.

### Full Stack Engineer — JHONROB Silos e Secadores
Nov 2023 – Mar 2026 | Brazil

- Built GEM Exportador in Kotlin Multiplatform (Compose + Ktor + SQLDelight): automated CAD export (PDF/DWG/DXF/STEP/IGES) with real-time WebSocket queue; Android field-ops modules for factory workers.
- Led GEM ERP (Next.js + Supabase/PostgreSQL): real-time Kanban, corporate chat, GPT assistant; 80% reduction in proposal errors, sub-200ms real-time sync.

### Mobile Developer — Centro America Tecnologia
Sep 2022 – Apr 2023 | Brazil
- React Native hospital management app: biometric auth, real-time dashboards, offline-first patient records and scheduling; virtualized lists and memoized components for large datasets.

## OPEN SOURCE

**Next.js FFmpeg Transcoder** (MIT) · github.com/afonsoburginski/nextjs-ffmpeg-transcoder
Production-grade video ingestion with FFmpeg/NVENC GPU acceleration, HLS transcoding and Cloudflare R2 storage.

## EDUCATION & CERTIFICATIONS

**B.Sc. Information Systems** — Unemat Sinop · 2020–2024
Developing Mobile Apps with React Native (Meta) · Kotlin for Java Developers (JetBrains)

## LANGUAGES

Portuguese: Native · English: B2 — technical communication and client meetings
