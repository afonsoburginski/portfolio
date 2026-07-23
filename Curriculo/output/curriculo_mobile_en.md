# AFONSO KEVIN BURGINSKI

## Senior Mobile Engineer (React Native / Kotlin / Swift · Media & Streaming Specialist)

Email: afonsoburginski@gmail.com • Portfolio: afonsodev.com • GitHub: github.com/afonsoburginski • LinkedIn: linkedin.com/in/afonsoburginski

## SUMMARY

Senior Mobile Engineer with 7 years of market experience shipping production apps to the App Store and Google Play, with rare end-to-end depth in media and streaming: owns the entire path from FFmpeg encoding pipelines, H.264/H.265 codec strategy and adaptive bitrate to hardware-accelerated players, native Swift modules (PiP, AirPlay) and offline-first data flows. Currently senior engineer on a large-scale smart-city video platform, owning its end-to-end streaming architecture (WebRTC, LL-HLS) and selected to lead the architecture and delivery of its upcoming mobile application. Founder of Stormzplus, a subscription streaming platform live on both stores. Brings staff-level engineering foundations to mobile work: distributed-systems architecture, CI/CD quality gates, integration testing and observability.

## SKILLS

Mobile: React Native (New Architecture), Kotlin, Swift, Kotlin Multiplatform, Compose Multiplatform, Jetpack Compose, SwiftUI, Android SDK, iOS SDK
Media & Streaming: HLS/LL-HLS, WebRTC, FFmpeg/NVENC encoding pipelines, adaptive bitrate (ABR), H.264/H.265 codec strategy, React Native Video, expo-video, LiveKit, native PiP/AirPlay (Swift)
Navigation & Routing: Expo Router (file-based, deep linking), React Navigation
State & Data: Zustand, SWR, AsyncStorage, SQLDelight, Supabase (Auth/DB/Realtime/Storage), PostgreSQL
Real-time & Messaging: WebSockets (Socket.IO), Supabase Realtime, Kafka-backed event pipelines, Firebase (push notifications)
Animations & UX: React Native Reanimated, Lottie, i18next
Release & Quality: EAS Build, Fastlane, App Store Connect, Google Play Console, CI/CD (GitHub Actions), Testcontainers, Docker, Git/GitHub

## EXPERIENCE

### Senior Software Engineer — Atman Systems
Mar 2026 – Present | Brazil

- Own the end-to-end video streaming architecture of a large-scale smart-city video monitoring platform (27 NestJS microservices): camera → edge → player pipeline with WebRTC and automatic LL-HLS fallback (~250ms), dynamic H.265/H.264 codec negotiation driven by client hardware capability detection, and adaptive quality leveraging native camera substreams (Axis/Hikvision).
- Selected to lead the architecture and delivery of the platform's upcoming mobile application, with end-to-end ownership of technical decisions.
- Designed the real-time layer consumed by client applications: Socket.IO room-based subscriptions with JWT authentication at handshake, pushing live stream status, camera health and analytics events.
- Built the live video analytics experience: per-frame detections rendered as bounding-box overlays in the player, fed by an on-device Kafka pipeline with idempotent reconciliation after device reboots.
- Operate with staff-level engineering foundations: integration-test CI gates with Testcontainers (real PostgreSQL), Prometheus/Pino observability and production Kubernetes (RKE2 + Terraform + Helm); shipped 75+ merged pull requests across seven domains within the first five months.

### Senior Mobile Engineer — afonsodev.com (Independent Consultant & Product Founder)
Jan 2020 – Present | Remote

**Stormzplus — Subscription Streaming Platform (Founder & Lead Engineer)** · App Store · Google Play
- Founded and built a production React Native app (New Architecture) on iOS and Android; release pipeline via EAS Build/Fastlane. Multi-profile accounts with tier-based feature gating, subscription management and deep linking via Universal Links (iOS) + App Links (Android).
- Custom HLS video player with hardware-accelerated adaptive bitrate (240p–4K), buffer tuning (2–10s playback strategy), skip intro/outro chapter detection, playback rate control (0.25x–2x), audio track selection, subtitles and background playback — debounced progress saves on AppState transitions.
- Implemented native Swift modules for PiP, AirPlay and advanced playback controls; native route picker with external display detection.
- Watch Party: custom signaling protocol over LiveKit data channels — host/viewer architecture with periodic sync (2s interval, 500ms rate limiting), seek/play/pause broadcast and 5-retry backoff for late joiners; fallback to Supabase Broadcast for resilience.
- Performance engineering: virtualized FlatLists (removeClippedSubviews, windowSize tuning, getItemLayout), React.memo on list items, memoized computations, expo-image memory-disk caching with batch avatar prefetching.
- Offline downloads with persistent queue, retry/backoff and storage management; real-time data sync via SWR + Supabase backend.
- Owns the full media backend as well: Go service orchestrating FFmpeg with NVIDIA NVENC for multi-bitrate HLS transcoding, Cloudflare R2 + CDN distribution — the same pipelines the app consumes.
- 20+ custom hooks, 9 context providers, 24+ design-system UI components; animations with Reanimated + Lottie; i18n (EN/PT-BR); push notifications via Firebase.

### Full Stack Engineer — JHONROB Silos e Secadores
Nov 2023 – Mar 2026 | Brazil

- Built native Kotlin Multiplatform tools using Compose Multiplatform + Ktor + SQLDelight, including **GEM Exportador** — automated CAD file conversion system with real-time queue monitoring via WebSocket, processing PDF/DWG/DXF/STEP/IGES exports from Autodesk Inventor.
- Developed Kotlin backend services for production data processing and Android modules enabling field workers to manage orders and tasks on the go.
- Led conception and development of GEM ERP (Next.js + Supabase/PostgreSQL) — enterprise platform that replaced spreadsheet workflows: real-time multi-view Kanban, corporate chat, GPT-powered assistant, productivity analytics and append-only audit trail; sub-200ms real-time multi-user sync.

### Mobile Developer — Centro America Tecnologia
Sep 2022 – Apr 2023 | Brazil

- Developed a React Native app for a hospital management system — biometric authentication, real-time operational dashboards, multi-step form workflows with validation and offline-capable data entry for patient records, scheduling and inventory.
- Performance focus: virtualized lists for large patient datasets, memoized components, optimized re-renders and efficient REST API consumption with caching strategies and error boundaries.

## OPEN SOURCE

### Next.js FFmpeg Transcoder (MIT)
- Production-grade video ingestion and HLS transcoding extracted from Stormzplus: Go server with streaming I/O (10GB+ files), FFmpeg/NVENC GPU acceleration, Cloudflare R2 storage.
- github.com/afonsoburginski/nextjs-ffmpeg-transcoder

## EDUCATION

### Bachelor's Degree in Information Systems — Unemat Sinop
2020 – 2024 | Brazil

## CERTIFICATIONS

- Developing Mobile Apps with React Native (Meta)
- Kotlin for Java Developers (JetBrains)

## LANGUAGES

Portuguese: Native
English: B2 — comfortable with technical communication and client meetings
