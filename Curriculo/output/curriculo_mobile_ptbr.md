# AFONSO KEVIN BURGINSKI

## Engenheiro Mobile Sênior — React Native · Kotlin · Swift · Especialista em Mídia e Streaming

E-mail: afonsoburginski@gmail.com • Portfólio: afonsodev.com • GitHub: github.com/afonsoburginski • LinkedIn: linkedin.com/in/afonsoburginski

## RESUMO PROFISSIONAL

Sou Engenheiro Mobile Sênior e especialista em mídia e streaming, com 7 anos de mercado e aplicativos projetados, construídos e publicados de ponta a ponta na App Store e no Google Play. Minha especialidade vai de pipelines FFmpeg e estratégia de codecs a players com aceleração de hardware e módulos nativos em Swift, como PiP e AirPlay. Atualmente, lidero a arquitetura de streaming de uma plataforma de videomonitoramento urbano em larga escala, na qual também sou o principal responsável pelo aplicativo mobile, e trabalho no dia a dia com Spec-Driven Development (SDD) e agentes de IA.

## HABILIDADES

**Mobile:** React Native (New Architecture), Expo (EAS, expo-router), Kotlin, Swift, Kotlin/Compose Multiplatform, Jetpack Compose, SwiftUI
**Mídia e Streaming:** HLS/LL-HLS, WebRTC, FFmpeg/NVENC, ABR, H.264/H.265, React Native Video, expo-video, LiveKit, PiP/AirPlay nativos (Swift)
**Estado e Dados:** Zustand, SWR, TanStack Query, AsyncStorage, SQLDelight, Supabase, PostgreSQL
**Tempo Real e Release:** WebSockets (Socket.IO), Supabase Realtime, notificações push, atualizações OTA, EAS Build, Fastlane, App Store Connect, Google Play Console
**Engenharia Assistida por IA:** Spec-Driven Development (SDD), agentes de IA (Claude Code), servidores MCP, funcionalidades de produto com LLMs (OpenAI GPT)
**Qualidade e DevOps:** GitHub Actions, Testcontainers, Docker, observabilidade com Prometheus e Pino

## EXPERIÊNCIA PROFISSIONAL

### Engenheiro de Software Sênior — Atman Systems
Mar 2026 – Atual | Brasil

- Lidero a arquitetura de streaming de ponta a ponta de uma plataforma de videomonitoramento urbano em larga escala, que combina WebRTC com fallback para LL-HLS (~250 ms), negociação dinâmica de codec (H.265/H.264) conforme a capacidade do cliente e qualidade adaptativa por meio de substreams nativos das câmeras.
- Projetei a camada de tempo real consumida pelos aplicativos clientes, na qual assinaturas Socket.IO autenticadas via JWT transmitem o status das transmissões, a saúde das câmeras e os eventos de analítico, e construí o overlay de análise ao vivo, que renderiza bounding boxes por frame alimentadas por um pipeline Kafka embarcado.
- Sou o principal responsável pelo aplicativo mobile da plataforma, a versão mobile do produto web, liderando sua arquitetura e sua entrega; entreguei mais de 75 pull requests em 5 meses, com gates de qualidade no CI (Testcontainers) e Kubernetes em produção.
- Trabalho com Spec-Driven Development (SDD) e agentes de IA (Claude Code) no fluxo de entrega, em que as funcionalidades são especificadas antes da implementação e executadas com revisão humana e gates de CI.

### Engenheiro Mobile Sênior — afonsodev.com (Fundador e Consultor Independente)
Jan 2020 – Atual | Remoto

**Stormzplus — Plataforma de Streaming por Assinatura (Fundador)** · mobile, web e admin
- Construí e mantenho em produção um aplicativo React Native (New Architecture) com contas de múltiplos perfis, gestão de assinaturas, pipeline EAS Build/Fastlane, Universal Links no iOS e App Links no Android.
- Desenvolvi um player HLS próprio com ABR acelerado por hardware (de 240p a 4K), legendas, reprodução em segundo plano e módulos nativos em Swift para PiP e AirPlay, além do recurso de Watch Party via LiveKit, com sinalização customizada sobre data channels.
- Construí e opero o backend de mídia completo, com pipeline de transcodificação em Go com FFmpeg/NVENC, Cloudflare R2/CDN e assinaturas via Stripe e Mercado Pago (PIX) com webhooks idempotentes.

**Orça Norte — Marketplace de Materiais de Construção (Fundador)** · App Store · orcanorte.com.br
- Projetei, construí e publiquei o aplicativo sozinho, usando Expo com expo-router, TanStack Query, Sign in with Apple, notificações push e atualizações OTA (expo-updates), com geração e compartilhamento de orçamentos em PDF dentro do app.
- Sou responsável pelo produto completo por trás do aplicativo: um marketplace multi-tenant em Next.js e PostgreSQL, com mais de 500 empresas cadastradas, planos de assinatura e dashboards operacionais.

### Engenheiro Full-Stack — JHONROB Silos e Secadores
Nov 2023 – Mar 2026 | Brasil

- Construí o aplicativo mobile do GEM ERP em React Native, a versão mobile do ERP web em Next.js que também desenvolvi, levando ordens de produção, Kanban e apontamentos ao chão de fábrica com sincronização em tempo real via Supabase.
- Construí o GEM Exportador em Kotlin Multiplatform (Compose, Ktor e SQLDelight), um sistema de exportação automática de arquivos CAD (PDF, DWG, DXF, STEP e IGES) com fila monitorada via WebSocket, além de módulos Android para os operadores da fábrica.
- Liderei o GEM ERP web (Next.js e Supabase/PostgreSQL), com Kanban em tempo real, chat corporativo e assistente com GPT, alcançando redução de 80% nos erros de propostas e sincronização abaixo de 200 ms.

### Desenvolvedor Mobile — Centro America Tecnologia
Set 2022 – Abr 2023 | Brasil
- Desenvolvi um aplicativo React Native para gestão hospitalar, com autenticação biométrica, dashboards em tempo real e prontuários e agendamentos offline-first, usando listas virtualizadas e componentes memoizados para grandes volumes de dados.

## OPEN SOURCE

**Next.js FFmpeg Transcoder** (MIT) · github.com/afonsoburginski/nextjs-ffmpeg-transcoder
Serviço em Go de ingestão de vídeo com aceleração por GPU (FFmpeg/NVENC), transcodificação HLS e armazenamento no Cloudflare R2.

## FORMAÇÃO E IDIOMAS

**Bacharelado em Sistemas de Informação** — Unemat Sinop · 2020–2024
Certificações: Developing Mobile Apps with React Native (Meta) · Kotlin for Java Developers (JetBrains)
Idiomas: Português (nativo) · Inglês (B2 — comunicação técnica e reuniões com clientes)
