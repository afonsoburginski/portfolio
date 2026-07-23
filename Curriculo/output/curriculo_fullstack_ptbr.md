# AFONSO KEVIN BURGINSKI

## Engenheiro Full-Stack Sênior (Sistemas Distribuídos / Streaming de Vídeo / NestJS / Next.js)

Email: afonsoburginski@gmail.com • Portfólio: afonsodev.com • GitHub: github.com/afonsoburginski • LinkedIn: linkedin.com/in/afonsoburginski

## RESUMO

Engenheiro Full-Stack Sênior com 7 anos de mercado projetando, construindo e operando sistemas em produção de ponta a ponta. Atualmente responsável pelo domínio de câmeras e vídeo de uma plataforma de videomonitoramento urbano em larga escala — 27 microsserviços NestJS comunicando-se via Kafka atrás de um gateway Kong — conduzindo decisões de arquitetura do design do sistema à produção em Kubernetes. Especialista em streaming de vídeo: WebRTC, LL-HLS, pipelines de codificação FFmpeg, estratégia de codecs e bitrate adaptativo, aplicados tanto em plataformas corporativas quanto na Stormzplus, produto de streaming por assinatura que fundou e desenvolveu integralmente. Eleva consistentemente o padrão de engenharia por meio de quality gates de CI/CD, cultura de testes de integração e observabilidade de ponta a ponta. Atua na interseção entre arquitetura, entrega hands-on e capacitação de plataforma — escopo de trajetória staff.

## HABILIDADES

Backend & Microsserviços: NestJS, Node.js, Go, Kotlin (Ktor), Kafka, Redis, BullMQ, Kong API Gateway, CQRS, Arquitetura Orientada a Eventos, DDD, REST APIs, WebSockets (Socket.IO)
Dados: PostgreSQL (particionamento temporal, indexação zero-downtime), Prisma ORM, Drizzle ORM, Supabase (Auth/DB/Realtime/Storage)
Vídeo & Streaming: FFmpeg/NVENC, WebRTC, HLS/LL-HLS, bitrate adaptativo (ABR), estratégia de codecs H.264/H.265, ONVIF, LiveKit (WebRTC SFU), Cloudflare R2/CDN
Frontend: Next.js (App Router, RSC), React, Angular, TypeScript, TailwindCSS, Zustand, TanStack React Query, SWR
Qualidade & Observabilidade: Jest, Testcontainers, Supertest, Prometheus, Pino structured logging, health checks (liveness/readiness)
DevOps & Cloud: Docker, Kubernetes (RKE2), Helm, Terraform, GitHub Actions, monorepo Nx (cache remoto), Nginx, AWS EC2, Vercel, Linux/VPS
Pagamentos & IA: Stripe (assinaturas, webhooks idempotentes), Mercado Pago (PIX), integração OpenAI GPT

## EXPERIÊNCIA

### Engenheiro de Software Sênior — Atman Systems
Mar 2026 – Presente | Brasil

- Responsável pelo domínio de câmeras e vídeo de uma plataforma de videomonitoramento e tráfego urbano em larga escala, composta por 27 microsserviços NestJS (monorepo Nx, Kafka, Kong API Gateway, PostgreSQL/Prisma, Redis, CQRS/DDD), conduzindo decisões de arquitetura do design do sistema à operação em produção.
- Arquitetei a stack de streaming adaptativo de baixa latência da plataforma: WebRTC com fallback automático para LL-HLS (~250ms), negociação dinâmica de codec H.265/H.264 com detecção de capacidade por cliente e qualidade adaptativa aproveitando substreams nativos das câmeras (Axis/Hikvision) — mantendo o custo de infraestrutura por câmera, e não por espectador.
- Construí um pipeline de analítico de vídeo em tempo real integrado a dispositivos de borda: detecções per-frame renderizadas como bounding boxes no player ao vivo, producers Kafka embarcados no dispositivo para minimizar overhead de rede e reconciliador idempotente que restaura o analítico automaticamente após reinicializações.
- Projetei um motor de correlação de eventos multi-câmera: clustering em janela deslizante de 60 segundos, emissão determinística de alarmes com deduplicação via UUIDv5, mapeamento de severidade em 4 níveis e políticas de resolução automática.
- Implementei telemetria e monitoramento de saúde de câmeras em escala: janelas de disponibilidade de 5 minutos com rollups de 90 dias sobre PostgreSQL particionado por tempo; métricas de latência, bitrate, packet loss e TTFF expostas via Prometheus; deploy de índices sem downtime (CREATE INDEX CONCURRENTLY).
- Projetei e entreguei do zero o microsserviço de gateway de notificações da plataforma — canais de email, WhatsApp, WebSocket e push sustentados por BullMQ (retry com backoff exponencial, dead-letter queue), templates Handlebars multi-idioma e trilha de auditoria completa em PostgreSQL.
- Implementei controle PTZ de câmeras agnóstico a fabricante via ONVIF Profile S: comandos REST relativos/absolutos/contínuos, balanceamento de carga de drivers e auditoria completa de comandos.
- Elevei o padrão de engenharia da plataforma: gate de testes de integração no CI com Testcontainers (PostgreSQL real), filtro de hash de artefatos eliminando rebuilds desnecessários, cache remoto Nx self-hosted (MinIO) e provisionamento de Kubernetes de produção (RKE2 + Terraform + Helm, 22 Deployments).
- Selecionado para liderar a arquitetura e a entrega do futuro aplicativo mobile da plataforma; mais de 75 pull requests merged em sete domínios nos primeiros cinco meses.

### Engenheiro Full Stack — JHONROB Silos e Secadores
Nov 2023 – Mar 2026 | Brasil

- Conduzi a concepção e o desenvolvimento do GEM (Next.js App Router + Supabase/PostgreSQL) — ERP corporativo que substituiu fluxos em planilhas por colaboração em tempo real: Kanban multi-view com drag-and-drop, chat corporativo (canais, threads, mensagens de voz), dashboards de produtividade, assistente GPT context-aware, audit log append-only (20+ tipos de evento) e RBAC com validação server-side.
- Reduzi a taxa de erro em propostas comerciais em 80% e aumentei o lucro mensal em aproximadamente 14%; 100+ usuários ativos diários em múltiplos departamentos com 99,9% de uptime.
- Projetei cache em múltiplas camadas (Zustand + TanStack Query + in-memory) com estratégia SSR/RSC e sincronização em tempo real sub-200ms; 5.000+ linhas de schema Prisma; deploy via Docker e Nginx em VPS dedicado.
- Desenvolvi serviços backend em Kotlin e ferramentas Kotlin Multiplatform (Compose Multiplatform + Ktor + SQLDelight) para automação de exportação de arquivos CAD; aplicação desktop com Tauri para fluxos offline-first em ambientes fabris.

### Engenheiro Full-Stack Sênior — afonsodev.com (Consultoria Independente & Fundador de Produto)
Jan 2020 – Presente | Remoto

**Stormzplus — Plataforma de Streaming por Assinatura (Fundador & Engenheiro-Chefe)**
- Fundei e construí uma plataforma VOD por assinatura full-stack: Next.js (App Router, RSC), Supabase Auth/DB, PostgreSQL e Drizzle ORM — contas multi-perfil com feature gating por plano, progresso de visualização, favoritos e destaques curados.
- Pipeline de vídeo acelerado por GPU: serviço Go orquestrando FFmpeg com NVIDIA NVENC para transcodificação HLS multi-bitrate (240p–4K), armazenado no Cloudflare R2 com cache de borda via CDN; streaming I/O suportando uploads de 10GB+.
- Billing Stripe + Mercado Pago (PIX) com webhooks idempotentes e ciclo de vida completo de assinaturas; LiveKit WebRTC SFU para Watch Party em tempo real (até 50 espectadores simultâneos) com sinalização customizada via data channels.
- Player HLS customizado com legendas, retomada de reprodução, seletor de qualidade e tratamento resiliente de erros; CMS administrativo completo com tracking de jobs FFmpeg e progresso de ingestão em tempo real.

**Orça Norte — Marketplace B2B de Orçamentos (orcanorte.com.br)**
- Construí um marketplace de construção civil atendendo 500+ empresas cadastradas: arquitetura SEO-first (SSR/ISR), sistema multi-tenant de fornecedores com papéis e trilhas de auditoria, planos de assinatura e dashboards operacionais. Next.js, Prisma, PostgreSQL, NextAuth, TanStack Query.

### Engenheiro Full Stack — TopSapp (Gestão de Provedores)
Jan 2021 – Set 2022 | Brasil

- Construí e mantive interfaces web com Next.js para gestão de provedores de internet; migrei módulos legados para React/Next.js; implementei pipelines CI/CD com GitLab e entrega ágil (Scrum/Kanban).

### Programador de Sistemas — Ecocentauro Sistemas Inteligentes
Jan 2019 – Out 2020 | Brasil

- Gerenciei bancos PostgreSQL, design de schemas e otimização de queries; desenvolvi layouts de relatórios financeiros e operacionais.

## OPEN SOURCE

### Next.js FFmpeg Transcoder (MIT)
- Pipeline de ingestão de vídeo e transcodificação HLS de nível de produção extraído da Stormzplus: servidor Go com streaming I/O (arquivos de 10GB+), aceleração GPU FFmpeg/NVENC, armazenamento Cloudflare R2, dashboard administrativo Next.js.
- github.com/afonsoburginski/nextjs-ffmpeg-transcoder

## CERTIFICAÇÕES

- Meta Back-End Developer Professional Certificate (Meta)
- IBM Full Stack Software Developer Professional Certificate (IBM)

## FORMAÇÃO

### Bacharelado em Sistemas de Informação — Unemat Sinop
2020 – 2024 | Brasil

## IDIOMAS

Português: Nativo
Inglês: B2 — confortável com comunicação técnica e reuniões com clientes
