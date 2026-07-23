# AFONSO KEVIN BURGINSKI

## Engenheiro Full-Stack Sênior — Sistemas Distribuídos · Streaming de Vídeo · NestJS / Next.js

E-mail: afonsoburginski@gmail.com • Portfólio: afonsodev.com • GitHub: github.com/afonsoburginski • LinkedIn: linkedin.com/in/afonsoburginski

## RESUMO

Engenheiro Full-Stack Sênior com 7 anos de mercado, especializado em arquitetura e operação de sistemas distribuídos de ponta a ponta. Atualmente lidera o domínio de streaming de uma plataforma de videomonitoramento urbano em larga escala — WebRTC, LL-HLS, analítico em tempo real e microsserviços orientados a eventos em Kubernetes. Especialista em streaming de vídeo e plataformização; perfil staff-track com ownership total de domínio, do design de sistemas à produção.

## HABILIDADES

**Backend & Microsserviços:** NestJS, Node.js, Go, Kotlin (Ktor), Kafka, Redis, BullMQ, Kong, CQRS, Arquitetura Orientada a Eventos, REST, WebSockets
**Dados:** PostgreSQL (particionamento temporal, indexação zero-downtime), Prisma, Drizzle, Supabase
**Vídeo & Streaming:** FFmpeg/NVENC, WebRTC, HLS/LL-HLS, ABR, H.264/H.265, ONVIF, LiveKit, Cloudflare R2/CDN
**Frontend:** Next.js (App Router, RSC), React, Angular, TypeScript, TailwindCSS, Zustand, TanStack Query
**Qualidade & Observabilidade:** Testcontainers, Jest, Prometheus, Pino structured logging
**DevOps & Cloud:** Docker, Kubernetes (RKE2), Helm, Terraform, GitHub Actions, Nx monorepo (cache remoto), AWS, Vercel

## EXPERIÊNCIA

### Engenheiro de Software Sênior — Atman Systems
Mar 2026 – Atual | Brasil

- Lidera o domínio de streaming de uma plataforma de videomonitoramento urbano em larga escala: WebRTC com fallback LL-HLS (~250ms), negociação dinâmica de codec H.265/H.264 por capacidade do cliente e qualidade adaptativa via substreams nativos de câmera — custo de infraestrutura por câmera, não por espectador.
- Construiu o pipeline de analítico de vídeo em tempo real: detecções por frame em dispositivos edge, producers Kafka on-device e reconciliador idempotente que restaura o estado após reboots.
- Projetou correlação de eventos multi-câmera (janela deslizante, deduplicação de alarmes via UUIDv5, auto-resolução) e telemetria em escala — PostgreSQL particionado por tempo, métricas Prometheus, indexação zero-downtime.
- Entregou o microsserviço de gateway de notificações do zero: e-mail, WhatsApp, WebSocket e push via BullMQ (backoff exponencial, DLQ), templates Handlebars multi-locale e trilha de auditoria completa.
- Estabeleceu gate de CI com testes de integração (Testcontainers), cache remoto Nx e provisionamento K8s em produção (RKE2 + Terraform + Helm); 75+ PRs merged em 5 meses. Selecionado para liderar o aplicativo mobile da plataforma.

### Engenheiro Full-Stack — JHONROB Silos e Secadores
Nov 2023 – Mar 2026 | Brasil

- Liderou o GEM ERP (Next.js + Supabase/PostgreSQL): redução de 80% nos erros de propostas comerciais, +14% no lucro mensal, 100+ usuários ativos diários — Kanban multi-visão em tempo real, chat corporativo, assistente GPT e trilha de auditoria append-only.
- Desenvolveu ferramental Kotlin Multiplatform (Compose + Ktor + SQLDelight) para exportação automática de arquivos CAD e módulos Android para operadores de fábrica; cache multicamada com sincronização sub-200ms em VPS Docker/Nginx.

### Engenheiro Full-Stack Sênior — afonsodev.com (Fundador & Consultor Independente)
Jan 2020 – Atual | Remoto

**Stormzplus — Plataforma de Streaming por Assinatura (Fundador & Lead Engineer)**
- Plataforma full-stack de VOD: Next.js + Supabase, pipeline de transcodificação Go/FFmpeg/NVENC acelerado por GPU (HLS 240p–4K), Cloudflare R2/CDN, assinaturas Stripe + Mercado Pago PIX com webhooks idempotentes.
- Watch Party via LiveKit (até 50 espectadores simultâneos) com protocolo de sinalização customizado; player HLS personalizado com legendas, retomada, seletor de qualidade e reprodução em background.

**Orça Norte — Marketplace B2B de Construção (orcanorte.com.br)**
- Marketplace SSR/ISR para 500+ empresas: sistema multi-tenant, planos de assinatura, RBAC e dashboards operacionais. Next.js, Prisma, PostgreSQL, NextAuth.

### Desenvolvedor Full-Stack — TopSapp
Jan 2021 – Set 2022 | Brasil
- Interfaces de gestão de provedores ISP (Next.js/React); migração de sistemas legados; CI/CD GitLab; entrega ágil Scrum/Kanban.

### Desenvolvedor de Sistemas — Ecocentauro Sistemas Inteligentes
Jan 2019 – Out 2020 | Brasil
- Modelagem de banco de dados PostgreSQL, otimização de queries e relatórios financeiros/operacionais.

## OPEN SOURCE

**Next.js FFmpeg Transcoder** (MIT) · github.com/afonsoburginski/nextjs-ffmpeg-transcoder
Serviço Go de ingestão de vídeo com aceleração GPU FFmpeg/NVENC, transcodificação HLS e armazenamento no Cloudflare R2.

## FORMAÇÃO & CERTIFICAÇÕES

**Bacharelado em Sistemas de Informação** — Unemat Sinop · 2020–2024
Meta Back-End Developer Professional Certificate · IBM Full Stack Software Developer Professional Certificate

## IDIOMAS

Português: Nativo · Inglês: B2 — comunicação técnica e reuniões com clientes
