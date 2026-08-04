# AFONSO KEVIN BURGINSKI

## Senior Mobile Engineer — React Native · Kotlin · Swift · Media & Streaming Specialist

Email: afonsoburginski@gmail.com • Portfolio: afonsodev.com • GitHub: github.com/afonsoburginski • LinkedIn: linkedin.com/in/afonsoburginski

## PROFESSIONAL SUMMARY

Senior Mobile Engineer and media and streaming specialist, with 7 years of market experience and consumer apps designed, built and shipped end to end to the App Store and Google Play. My specialty spans from FFmpeg pipelines and codec strategy to hardware-accelerated players and native Swift modules such as PiP and AirPlay. I currently own the streaming architecture of a large-scale smart-city video platform, where I am also the lead engineer responsible for the mobile application, and I work daily with Spec-Driven Development (SDD) and AI coding agents.

## SKILLS

**Mobile:** React Native (New Architecture), Expo (EAS, expo-router), Kotlin, Swift, Kotlin/Compose Multiplatform, Jetpack Compose, SwiftUI
**Media & Streaming:** HLS/LL-HLS, WebRTC, FFmpeg/NVENC, ABR, H.264/H.265, React Native Video, expo-video, LiveKit, native PiP/AirPlay (Swift)
**State & Data:** Zustand, SWR, TanStack Query, AsyncStorage, SQLDelight, Supabase, PostgreSQL
**Real-time & Release:** WebSockets (Socket.IO), Supabase Realtime, push notifications, OTA updates, EAS Build, Fastlane, App Store Connect, Google Play Console
**AI-Assisted Engineering:** Spec-Driven Development (SDD), AI coding agents (Claude Code), MCP servers, LLM-powered product features (OpenAI GPT)
**Quality & DevOps:** GitHub Actions, Testcontainers, Docker, observability with Prometheus and Pino

## PROFESSIONAL EXPERIENCE

### Senior Software Engineer — Atman Systems
Mar 2026 – Present | Brazil

- Own the end-to-end streaming architecture of a large-scale smart-city video platform, which combines WebRTC with LL-HLS fallback (~250 ms), dynamic H.265/H.264 codec negotiation based on client capability and adaptive quality through native camera substreams.
- Designed the real-time layer consumed by client applications, in which JWT-authenticated Socket.IO room subscriptions push live stream status, camera health and analytics events, and built the live analytics overlay, which renders per-frame bounding boxes fed by an on-device Kafka pipeline.
- Own the platform's mobile application, the mobile version of the web product, driving its architecture and delivery as lead engineer; merged 75+ pull requests in 5 months, with CI quality gates (Testcontainers) and Kubernetes in production.
- Work with Spec-Driven Development (SDD) and AI coding agents (Claude Code) in the delivery workflow, in which features are specified before implementation and executed under human review and CI gates.

### Senior Mobile Engineer — afonsodev.com (Founder & Independent Consultant)
Jan 2020 – Present | Remote

**Stormzplus — Subscription Streaming Platform (Founder)** · mobile, web and admin
- Built and maintain in production a React Native app (New Architecture) with multi-profile accounts, subscription management, an EAS Build/Fastlane pipeline, Universal Links on iOS and App Links on Android.
- Developed a custom HLS player with hardware-accelerated ABR (240p to 4K), subtitles, background playback and native Swift modules for PiP and AirPlay, as well as a Watch Party feature via LiveKit with custom signaling over data channels.
- Built and operate the entire media backend, with a Go transcoding pipeline using FFmpeg/NVENC, Cloudflare R2/CDN, and Stripe and Mercado Pago (PIX) subscriptions with idempotent webhooks.

**Orça Norte — Construction Materials Marketplace (Founder)** · App Store · orcanorte.com.br
- Designed, built and shipped the consumer app solo, using Expo with expo-router, TanStack Query, Sign in with Apple, push notifications and OTA updates (expo-updates), with in-app PDF quote generation and sharing.
- Own the entire product behind the app: a multi-tenant marketplace built with Next.js and PostgreSQL that serves 500+ registered companies, with subscription plans and operational dashboards.

### Full-Stack Engineer — JHONROB Silos e Secadores
Nov 2023 – Mar 2026 | Brazil

- Built the GEM ERP mobile app in React Native, the mobile version of the Next.js web ERP I also developed, bringing production orders, Kanban and shop-floor tracking to factory workers with real-time sync via Supabase.
- Built GEM Exportador in Kotlin Multiplatform (Compose, Ktor and SQLDelight), an automated CAD export system (PDF, DWG, DXF, STEP and IGES) with a real-time WebSocket queue, plus Android modules for factory floor operators.
- Led the GEM ERP web platform (Next.js and Supabase/PostgreSQL), with real-time Kanban, corporate chat and a GPT-powered assistant, achieving an 80% reduction in proposal errors and sub-200 ms real-time sync.

### Mobile Developer — Centro America Tecnologia
Sep 2022 – Apr 2023 | Brazil
- Developed a React Native hospital management app with biometric authentication, real-time dashboards and offline-first patient records and scheduling, using virtualized lists and memoized components for large datasets.

## OPEN SOURCE

**Next.js FFmpeg Transcoder** (MIT) · github.com/afonsoburginski/nextjs-ffmpeg-transcoder
Go video ingestion service with GPU acceleration (FFmpeg/NVENC), HLS transcoding and Cloudflare R2 storage.

## EDUCATION & LANGUAGES

**B.Sc. in Information Systems** — Unemat Sinop · 2020–2024
Certifications: Developing Mobile Apps with React Native (Meta) · Kotlin for Java Developers (JetBrains)
Languages: Portuguese (native) · English (B2 — technical communication and client meetings)
