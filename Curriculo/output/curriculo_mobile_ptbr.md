# AFONSO KEVIN BURGINSKI

## Desenvolvedor Mobile Sênior (React Native / Kotlin / Swift)

Email: afonsoburginski@gmail.com • Portfólio: afonsodev.com • GitHub: github.com/afonsoburginski • LinkedIn: linkedin.com/in/afonsoburginski

## RESUMO

Engenheiro Mobile Sênior com 6+ anos entregando apps em produção na App Store e Google Play. Atua de ponta a ponta, de módulos nativos em Swift e Kotlin a produtos completos em React Native. Domínio profundo de arquiteturas real-time, fluxos offline-first, reprodução avançada de mídia e gerenciamento de estado complexo. Foco em engenharia de performance, arquitetura escalável de componentes e qualidade de release. Responsável por todo o ciclo do produto mobile: decisões de arquitetura, integrações nativas, pipelines CI/CD e deploy nas stores.

## HABILIDADES

Mobile: React Native, Kotlin, Swift, Kotlin Multiplatform, Compose Multiplatform, Jetpack Compose, SwiftUI, Android SDK, iOS SDK
Navegação & Routing: Expo Router (file-based, deep linking), React Navigation
Vídeo & Real-time: React Native Video, HLS streaming, WebRTC (react-native-webrtc), LiveKit
Estado & Dados: Zustand, SWR, AsyncStorage, SQLDelight, Supabase (Auth/DB/Realtime/Storage), PostgreSQL
Tooling Nativo: Ktor (HTTP server + WebSocket), Compose UI, SQLDelight
Animações & UX: React Native Reanimated, Lottie, i18next, Firebase (push notifications)
Release & Qualidade: EAS Build, Fastlane, App Store Connect, Google Play Console, CI/CD, Docker, Git/GitHub

## EXPERIÊNCIA

### Desenvolvedor Mobile Sênior — afonsodev.com (Consultoria Independente)
Jan 2020 – Presente | Remoto

**Stormzplus — Plataforma de Streaming por Assinatura (App Mobile)** · App Store · Google Play
- App React Native (New Architecture) para iOS e Android; pipeline de release via EAS Build/Fastlane. Multi-perfil com feature gating por tier de assinatura (FREE/STANDARD/PREMIUM), gestão de assinatura e deep linking via Universal Links (iOS) + App Links (Android).
- Player HLS customizado com bitrate adaptativo acelerado por hardware (240p–4K), tuning de buffer (estratégia 2–10s), detecção de capítulos (skip intro/outro), controle de velocidade (0.25x–2x), seleção de faixa de áudio, legendas e reprodução em background — save de progresso com debounce nas transições de AppState.
- Implementei módulos nativos Swift para PiP, AirPlay e controles avançados de reprodução; route picker nativo com detecção de display externo.
- Watch Party: protocolo de sinalização customizado via data channels LiveKit — arquitetura host/viewer com sync periódico (intervalo 2s, rate limiting 500ms), broadcast de seek/play/pause e 5 retries com backoff para late joiners. Fallback para Supabase Broadcast para resiliência.
- Performance: FlatLists virtualizadas (removeClippedSubviews, tuning de windowSize, getItemLayout), React.memo em list items, computações memoizadas, cache expo-image memory-disk com batch prefetching de avatares.
- Downloads offline com fila persistente, retry/backoff e gestão de storage. Sincronização real-time via SWR + backend Supabase.
- 20+ custom hooks (auth, data, features), 9 context providers, 24+ componentes UI (design system). Animações com Reanimated + Lottie; i18n (EN/PT-BR); push notifications via Firebase.

### Engenheiro Full Stack — JHONROB Silos e Secadores
Nov 2023 – Presente | Brasil

- Construí ferramentas nativas em Kotlin Multiplatform usando Compose Multiplatform + Ktor + SQLDelight, incluindo **GEM Exportador** — sistema automatizado de conversão de arquivos CAD com monitoramento de fila em tempo real via WebSocket, processando exportações PDF/DWG/DXF/STEP/IGES do Autodesk Inventor.
- Desenvolvi serviços backend em Kotlin para processamento de dados de produção e módulos Android para acesso mobile dos operadores de fábrica.
- Conduzi a concepção e o desenvolvimento do ERP GEM (Next.js + Supabase/Postgres) — plataforma corporativa que substituiu fluxos em Excel, acelerando processos em até 80%. Dashboards de progresso de obras, Kanban real-time (multi-view), chat corporativo, compartilhamento de documentos, assistente IA (GPT), analytics de produtividade, audit log append-only.
- Colaboração multi-usuário em tempo real via Supabase Realtime, validada em cenários multiusuário.

### Desenvolvedor Mobile — Centro America Tecnologia
Set 2022 – Abr 2023 | Brasil

- Desenvolvi app React Native para sistema de gestão hospitalar — autenticação biométrica, dashboards operacionais em tempo real, formulários multi-step com validação e entrada de dados offline para prontuários, agendamentos e estoque.
- Foco em performance: listas virtualizadas para grandes volumes de dados de pacientes, componentes memoizados, otimização de re-renders e consumo eficiente de APIs REST com loading states, error boundaries e estratégias de cache.
- UI responsiva seguindo padrões de design system e boas práticas mobile — componentes adaptativos por plataforma e UX consistente entre iOS e Android.

## OPEN SOURCE

### Next.js FFmpeg Transcoder (MIT)
- Pipeline de ingestão de vídeo e transcodificação HLS extraída do Stormzplus. Servidor Go com streaming I/O (10GB+), aceleração GPU FFmpeg/NVENC, armazenamento Cloudflare R2.
- github.com/afonsoburginski/nextjs-ffmpeg-transcoder

## FORMAÇÃO

### Bacharelado em Sistemas de Informação — Unemat Sinop
2020 – 2024 | Brasil

## CERTIFICAÇÕES

- Developing Mobile Apps with React Native (Meta)
- Kotlin for Java Developers (JetBrains)

## IDIOMAS

Português: Nativo
Inglês: B2 — confortável com comunicação técnica e reuniões com clientes
