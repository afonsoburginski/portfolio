# AFONSO KEVIN BURGINSKI

## Engenheiro Mobile Sênior — React Native · Kotlin · Swift · Especialista em Mídia & Streaming

E-mail: afonsoburginski@gmail.com • Portfólio: afonsodev.com • GitHub: github.com/afonsoburginski • LinkedIn: linkedin.com/in/afonsoburginski

## RESUMO

Engenheiro Mobile Sênior com 7 anos de mercado, com aplicativos em produção na App Store e no Google Play. Profundidade rara em mídia e streaming — de pipelines FFmpeg e estratégia de codec a players com aceleração de hardware e módulos nativos Swift (PiP, AirPlay). Atualmente lidera a arquitetura de streaming de uma plataforma de videomonitoramento urbano em larga escala e foi selecionado para encabeçar seu aplicativo mobile.

## HABILIDADES

**Mobile:** React Native (New Architecture), Kotlin, Swift, Kotlin Multiplatform, Compose Multiplatform, Jetpack Compose, SwiftUI, Android SDK, iOS SDK
**Mídia & Streaming:** HLS/LL-HLS, WebRTC, FFmpeg/NVENC, ABR, H.264/H.265, React Native Video, expo-video, LiveKit, PiP/AirPlay nativos (Swift)
**Estado & Dados:** Zustand, SWR, AsyncStorage, SQLDelight, Supabase, PostgreSQL
**Tempo Real:** WebSockets (Socket.IO), Supabase Realtime, pipelines Kafka, Firebase Push
**Release & Qualidade:** EAS Build, Fastlane, App Store Connect, Google Play Console, GitHub Actions, Testcontainers, Docker

## EXPERIÊNCIA

### Engenheiro de Software Sênior — Atman Systems
Mar 2026 – Atual | Brasil

- Lidera a arquitetura de streaming de ponta a ponta de uma plataforma de videomonitoramento urbano em larga escala: WebRTC com fallback LL-HLS (~250ms), negociação dinâmica de codec H.265/H.264 por capacidade do cliente e qualidade adaptativa via substreams nativos de câmera.
- Projetou a camada em tempo real consumida pelos clientes: assinaturas Socket.IO baseadas em salas com autenticação JWT no handshake, transmitindo status de stream, saúde da câmera e eventos de analítico.
- Construiu a experiência de analítico de vídeo ao vivo: overlays de bounding boxes por frame no player, alimentados por pipeline Kafka on-device com reconciliação idempotente após reboots.
- Selecionado para liderar a arquitetura e entrega do aplicativo mobile da plataforma; 75+ PRs merged em 5 meses; gates de CI (Testcontainers), observabilidade Prometheus/Pino, K8s em produção (RKE2 + Terraform + Helm).

### Engenheiro Mobile Sênior — afonsodev.com (Fundador & Consultor Independente)
Jan 2020 – Atual | Remoto

**Stormzplus — Plataforma de Streaming por Assinatura (Fundador & Lead Engineer)** · App Store · Google Play
- Aplicativo React Native (New Architecture) em produção nas duas lojas: contas multi-perfil, gestão de assinaturas, pipeline EAS Build/Fastlane, Universal Links (iOS) + App Links (Android).
- Player HLS customizado com ABR acelerado por hardware (240p–4K), buffer tuning, detecção de capítulos, legendas, reprodução em background e módulos Swift nativos para PiP e AirPlay.
- Watch Party via LiveKit: protocolo de sinalização customizado sobre data channels, broadcast de sincronização, 5-retry backoff para espectadores tardios.
- Lidera também o backend de mídia: pipeline de transcodificação Go + FFmpeg/NVENC, Cloudflare R2/CDN, assinaturas Stripe + Mercado Pago PIX com webhooks idempotentes.

### Engenheiro Full-Stack — JHONROB Silos e Secadores
Nov 2023 – Mar 2026 | Brasil

- Construiu o GEM Exportador em Kotlin Multiplatform (Compose + Ktor + SQLDelight): exportação automática de CAD (PDF/DWG/DXF/STEP/IGES) com monitoramento de fila via WebSocket; módulos Android para operadores de fábrica.
- Liderou o GEM ERP (Next.js + Supabase/PostgreSQL): Kanban em tempo real, chat corporativo, assistente GPT; redução de 80% nos erros de propostas, sincronização sub-200ms.

### Desenvolvedor Mobile — Centro America Tecnologia
Set 2022 – Abr 2023 | Brasil
- Aplicativo React Native para gestão hospitalar: autenticação biométrica, dashboards em tempo real, formulários offline-first para prontuários e agendamentos; listas virtualizadas e componentes memoizados para grandes conjuntos de dados.

## OPEN SOURCE

**Next.js FFmpeg Transcoder** (MIT) · github.com/afonsoburginski/nextjs-ffmpeg-transcoder
Serviço Go de ingestão de vídeo com aceleração GPU FFmpeg/NVENC, transcodificação HLS e armazenamento no Cloudflare R2.

## FORMAÇÃO & CERTIFICAÇÕES

**Bacharelado em Sistemas de Informação** — Unemat Sinop · 2020–2024
Developing Mobile Apps with React Native (Meta) · Kotlin for Java Developers (JetBrains)

## IDIOMAS

Português: Nativo · Inglês: B2 — comunicação técnica e reuniões com clientes
