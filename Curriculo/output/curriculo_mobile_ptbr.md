# AFONSO KEVIN BURGINSKI

## Engenheiro Mobile Sênior (React Native / Kotlin / Swift · Especialista em Mídia & Streaming)

Email: afonsoburginski@gmail.com • Portfólio: afonsodev.com • GitHub: github.com/afonsoburginski • LinkedIn: linkedin.com/in/afonsoburginski

## RESUMO

Engenheiro Mobile Sênior com 7 anos de mercado entregando aplicativos em produção na App Store e no Google Play, com profundidade rara e de ponta a ponta em mídia e streaming: domina todo o caminho, dos pipelines de codificação FFmpeg, estratégia de codecs H.264/H.265 e bitrate adaptativo até players acelerados por hardware, módulos nativos em Swift (PiP, AirPlay) e fluxos de dados offline-first. Atualmente engenheiro sênior em uma plataforma de videomonitoramento urbano em larga escala, responsável pela arquitetura de streaming de ponta a ponta (WebRTC, LL-HLS) e selecionado para liderar a arquitetura e a entrega do futuro aplicativo mobile da plataforma. Fundador da Stormzplus, plataforma de streaming por assinatura publicada em ambas as lojas. Leva fundamentos de engenharia de nível staff ao trabalho mobile: arquitetura de sistemas distribuídos, quality gates de CI/CD, testes de integração e observabilidade.

## HABILIDADES

Mobile: React Native (New Architecture), Kotlin, Swift, Kotlin Multiplatform, Compose Multiplatform, Jetpack Compose, SwiftUI, Android SDK, iOS SDK
Mídia & Streaming: HLS/LL-HLS, WebRTC, pipelines de codificação FFmpeg/NVENC, bitrate adaptativo (ABR), estratégia de codecs H.264/H.265, React Native Video, expo-video, LiveKit, PiP/AirPlay nativos (Swift)
Navegação & Routing: Expo Router (file-based, deep linking), React Navigation
Estado & Dados: Zustand, SWR, AsyncStorage, SQLDelight, Supabase (Auth/DB/Realtime/Storage), PostgreSQL
Real-time & Mensageria: WebSockets (Socket.IO), Supabase Realtime, pipelines de eventos com Kafka, Firebase (push notifications)
Animações & UX: React Native Reanimated, Lottie, i18next
Release & Qualidade: EAS Build, Fastlane, App Store Connect, Google Play Console, CI/CD (GitHub Actions), Testcontainers, Docker, Git/GitHub

## EXPERIÊNCIA

### Engenheiro de Software Sênior — Atman Systems
Mar 2026 – Presente | Brasil

- Responsável pela arquitetura de streaming de vídeo de ponta a ponta de uma plataforma de videomonitoramento urbano em larga escala (27 microsserviços NestJS): pipeline câmera → borda → player com WebRTC e fallback automático para LL-HLS (~250ms), negociação dinâmica de codec H.265/H.264 orientada por detecção de capacidade de hardware do cliente e qualidade adaptativa aproveitando substreams nativos das câmeras (Axis/Hikvision).
- Selecionado para liderar a arquitetura e a entrega do futuro aplicativo mobile da plataforma, com ownership completo das decisões técnicas.
- Projetei a camada de tempo real consumida pelas aplicações cliente: subscriptions por sala via Socket.IO com autenticação JWT no handshake, transmitindo status de stream ao vivo, saúde das câmeras e eventos de analítico.
- Construí a experiência de analítico de vídeo ao vivo: detecções per-frame renderizadas como bounding boxes sobre o player, alimentadas por um pipeline Kafka embarcado no dispositivo com reconciliação idempotente após reinicializações.
- Atuo com fundamentos de engenharia de nível staff: gates de testes de integração no CI com Testcontainers (PostgreSQL real), observabilidade com Prometheus/Pino e Kubernetes de produção (RKE2 + Terraform + Helm); mais de 75 pull requests merged em sete domínios nos primeiros cinco meses.

### Engenheiro Mobile Sênior — afonsodev.com (Consultoria Independente & Fundador de Produto)
Jan 2020 – Presente | Remoto

**Stormzplus — Plataforma de Streaming por Assinatura (Fundador & Engenheiro-Chefe)** · App Store · Google Play
- Fundei e construí um app React Native (New Architecture) em produção para iOS e Android; pipeline de release via EAS Build/Fastlane. Contas multi-perfil com feature gating por plano, gestão de assinatura e deep linking via Universal Links (iOS) + App Links (Android).
- Player HLS customizado com bitrate adaptativo acelerado por hardware (240p–4K), tuning de buffer (estratégia 2–10s), detecção de capítulos (skip intro/outro), controle de velocidade (0.25x–2x), seleção de faixa de áudio, legendas e reprodução em background — save de progresso com debounce nas transições de AppState.
- Implementei módulos nativos em Swift para PiP, AirPlay e controles avançados de reprodução; route picker nativo com detecção de display externo.
- Watch Party: protocolo de sinalização customizado via data channels do LiveKit — arquitetura host/viewer com sync periódico (intervalo de 2s, rate limiting de 500ms), broadcast de seek/play/pause e 5 retries com backoff para late joiners; fallback para Supabase Broadcast para resiliência.
- Engenharia de performance: FlatLists virtualizadas (removeClippedSubviews, tuning de windowSize, getItemLayout), React.memo em list items, computações memoizadas, cache memory-disk com expo-image e prefetch de avatares em lote.
- Downloads offline com fila persistente, retry/backoff e gestão de storage; sincronização de dados em tempo real via SWR + backend Supabase.
- Também sou responsável por todo o backend de mídia: serviço Go orquestrando FFmpeg com NVIDIA NVENC para transcodificação HLS multi-bitrate, distribuição via Cloudflare R2 + CDN — os mesmos pipelines que o app consome.
- 20+ custom hooks, 9 context providers, 24+ componentes de UI (design system); animações com Reanimated + Lottie; i18n (EN/PT-BR); push notifications via Firebase.

### Engenheiro Full Stack — JHONROB Silos e Secadores
Nov 2023 – Mar 2026 | Brasil

- Construí ferramentas nativas em Kotlin Multiplatform usando Compose Multiplatform + Ktor + SQLDelight, incluindo o **GEM Exportador** — sistema automatizado de conversão de arquivos CAD com monitoramento de fila em tempo real via WebSocket, processando exportações PDF/DWG/DXF/STEP/IGES do Autodesk Inventor.
- Desenvolvi serviços backend em Kotlin para processamento de dados de produção e módulos Android que permitem aos operadores de campo gerenciar ordens e tarefas em movimento.
- Conduzi a concepção e o desenvolvimento do ERP GEM (Next.js + Supabase/PostgreSQL) — plataforma corporativa que substituiu fluxos em planilhas: Kanban multi-view em tempo real, chat corporativo, assistente com GPT, analytics de produtividade e audit log append-only; sincronização multi-usuário em tempo real sub-200ms.

### Desenvolvedor Mobile — Centro America Tecnologia
Set 2022 – Abr 2023 | Brasil

- Desenvolvi app React Native para sistema de gestão hospitalar — autenticação biométrica, dashboards operacionais em tempo real, formulários multi-step com validação e entrada de dados offline para prontuários, agendamentos e estoque.
- Foco em performance: listas virtualizadas para grandes volumes de dados de pacientes, componentes memoizados, otimização de re-renders e consumo eficiente de APIs REST com estratégias de cache e error boundaries.

## OPEN SOURCE

### Next.js FFmpeg Transcoder (MIT)
- Pipeline de ingestão de vídeo e transcodificação HLS de nível de produção extraído da Stormzplus: servidor Go com streaming I/O (arquivos de 10GB+), aceleração GPU FFmpeg/NVENC, armazenamento Cloudflare R2.
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
