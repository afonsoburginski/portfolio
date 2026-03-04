# AFONSO KEVIN BURGINSKI

## Senior Mobile Developer (React Native / Kotlin / Swift)

Email: afonsoburginski@gmail.com • Portfolio: afonsodev.com • GitHub: github.com/afonsoburginski • LinkedIn: linkedin.com/in/afonsoburginski

## SUMMARY

Senior Mobile Engineer with 6+ years shipping production apps to the App Store and Google Play. Works end-to-end from native modules in Swift and Kotlin to full React Native products. Deep expertise in real-time architectures, offline-first data flows, advanced media playback and complex state management. Focused on performance engineering, scalable component architecture and release quality. Full ownership of the mobile product lifecycle: architecture decisions, native integrations, CI/CD pipelines and store deployment.

## SKILLS

Mobile: React Native, Kotlin, Swift, Kotlin Multiplatform, Compose Multiplatform, Jetpack Compose, SwiftUI, Android SDK, iOS SDK
Navigation & Routing: Expo Router (file-based, deep linking), React Navigation
Video & Real-time: React Native Video, HLS streaming, WebRTC (react-native-webrtc), LiveKit
State & Data: Zustand, SWR, AsyncStorage, SQLDelight, Supabase (Auth/DB/Realtime/Storage), PostgreSQL
Native Tooling: Ktor (HTTP server + WebSocket), Compose UI, SQLDelight
Animations & UX: React Native Reanimated, Lottie, i18next, Firebase (push notifications)
Release & Quality: EAS Build, Fastlane, App Store Connect, Google Play Console, CI/CD, Docker, Git/GitHub

## EXPERIENCE

### Senior Mobile Developer — afonsodev.com (Independent Consultant)
Jan 2020 – Present | Remote

**Stormzplus — Subscription Streaming Platform (Mobile App)** · App Store · Google Play
- React Native app (New Architecture) on iOS and Android; release pipeline via EAS Build/Fastlane. Multi-profile accounts with tier-based feature gating (FREE/STANDARD/PREMIUM), subscription management and deep linking via Universal Links (iOS) + App Links (Android).
- Custom HLS video player with hardware-accelerated adaptive bitrate (240p–4K), buffer tuning (2–10s playback strategy), skip intro/outro chapter detection, playback rate control (0.25x–2x), audio track selection, subtitles and background playback — debounced progress saves on AppState transitions.
- Implemented native Swift modules for PiP, AirPlay and advanced playback controls; native route picker with external display detection.
- Watch Party: custom signaling protocol over LiveKit data channels — host/viewer architecture with periodic sync (2s interval, 500ms rate limiting), seek/play/pause broadcast and 5-retry backoff for late joiners. Fallback to Supabase Broadcast for resilience.
- Performance: virtualized FlatLists (removeClippedSubviews, windowSize tuning, getItemLayout), React.memo on list items, memoized computations, expo-image memory-disk caching with batch avatar prefetching.
- Offline downloads with persistent queue, retry/backoff and storage management. Real-time data sync via SWR + Supabase backend.
- 20+ custom hooks (auth, data, features), 9 context providers, 24+ UI components (design system). Animations with Reanimated + Lottie; i18n (EN/PT-BR); push notifications via Firebase.

### Full Stack Engineer — JHONROB Silos e Secadores
Nov 2023 – Present | Brazil

- Built native Kotlin Multiplatform tools using Compose Multiplatform + Ktor + SQLDelight, including **GEM Exportador** — automated CAD file conversion system with real-time queue monitoring via WebSocket, processing PDF/DWG/DXF/STEP/IGES exports from Autodesk Inventor.
- Developed Kotlin backend services for production data processing and Android modules enabling field workers to manage orders and tasks on-the-go.
- Led conception and development of GEM ERP (Next.js + Supabase/Postgres) — enterprise platform that replaced Excel workflows, accelerating processes by up to 80%. Construction progress dashboards, real-time Kanban (multi-view), corporate chat, document sharing, GPT-powered AI assistant, productivity analytics, append-only audit trail.
- Real-time multi-user collaboration via Supabase Realtime, validated in multi-user scenarios.

### Mobile Developer — Centro America Tecnologia
Sep 2022 – Apr 2023 | Brazil

- Developed a React Native mobile app for a hospital management system — biometric authentication, real-time operational dashboards, multi-step form workflows with validation and offline-capable data entry for patient records, scheduling and inventory.
- Performance focus: virtualized lists for large patient datasets, memoized components, optimized re-renders and efficient REST API consumption with loading states, error boundaries and caching strategies.
- Responsive UI following design system patterns and mobile best practices — platform-adaptive components and consistent UX across iOS and Android.

## OPEN SOURCE

### Next.js FFmpeg Transcoder (MIT)
- Production-grade video ingestion and HLS transcoding extracted from Stormzplus. Go server with streaming I/O (10GB+ files), FFmpeg/NVENC GPU acceleration, Cloudflare R2 storage.
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
