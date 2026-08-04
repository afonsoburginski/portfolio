# AFONSO KEVIN BURGINSKI

## Engenheiro Full-Stack Sênior — Sistemas Distribuídos · Streaming de Vídeo · NestJS / Next.js

E-mail: afonsoburginski@gmail.com • Portfólio: afonsodev.com • GitHub: github.com/afonsoburginski • LinkedIn: linkedin.com/in/afonsoburginski

## RESUMO PROFISSIONAL

Sou Engenheiro Full-Stack Sênior com 7 anos de mercado, atuo do frontend à infraestrutura e sou especialista em streaming de vídeo e sistemas distribuídos. Atualmente, lidero o domínio de câmeras e vídeo de uma plataforma de videomonitoramento urbano em larga escala, que envolve WebRTC, LL-HLS, analítico em tempo real e microsserviços orientados a eventos em Kubernetes, com ownership total do design de sistemas à produção. Trabalho no dia a dia com Spec-Driven Development (SDD) e agentes de IA.

## HABILIDADES

**Backend e Microsserviços:** NestJS, Node.js, Go, Kotlin (Ktor), Kafka, Redis, BullMQ, Kong, CQRS, arquitetura orientada a eventos, REST, WebSockets
**Dados:** PostgreSQL (particionamento temporal, indexação sem downtime), Prisma, Drizzle, Supabase
**Vídeo e Streaming:** FFmpeg/NVENC, WebRTC, HLS/LL-HLS, ABR, H.264/H.265, ONVIF, LiveKit, Cloudflare R2/CDN
**Frontend e Mobile:** Next.js (App Router, RSC), React, TypeScript, TailwindCSS, Zustand, TanStack Query, React Native (Expo)
**Engenharia Assistida por IA:** Spec-Driven Development (SDD), agentes de IA (Claude Code), servidores MCP, funcionalidades de produto com LLMs (OpenAI GPT)
**DevOps e Qualidade:** Docker, Kubernetes (RKE2), Helm, Terraform, GitHub Actions, monorepo Nx (cache remoto), Testcontainers, Prometheus, Pino

## EXPERIÊNCIA PROFISSIONAL

### Engenheiro de Software Sênior — Atman Systems
Mar 2026 – Atual | Brasil

- Lidero o domínio de câmeras e vídeo de uma plataforma de videomonitoramento urbano em larga escala, composta por 27 microsserviços NestJS com monorepo Nx, Kafka, Kong, PostgreSQL/Prisma, Redis e CQRS.
- Arquitetei o stack de streaming de baixa latência da plataforma, que combina WebRTC com fallback para LL-HLS (~250 ms), negociação dinâmica de codec (H.265/H.264) conforme a capacidade do cliente e qualidade adaptativa por meio de substreams nativos das câmeras, mantendo o custo de infraestrutura por câmera, e não por espectador.
- Construí o pipeline de analítico de vídeo em tempo real, com detecções por frame em dispositivos de borda, producers Kafka embarcados e reconciliação idempotente após reinicializações, além da correlação de eventos multicâmera com janela deslizante e deduplicação de alarmes via UUIDv5 em PostgreSQL particionado por tempo.
- Entreguei o gateway de notificações do zero, com canais de e-mail, WhatsApp, WebSocket e push sustentados por BullMQ (backoff exponencial e DLQ), templates Handlebars em múltiplos idiomas e trilha de auditoria completa.
- Estabeleci o gate de testes de integração no CI (Testcontainers), o cache remoto do Nx e o provisionamento do Kubernetes de produção (RKE2, Terraform e Helm); entreguei mais de 75 pull requests em 5 meses e sou o principal responsável pelo aplicativo mobile da plataforma.
- Trabalho com Spec-Driven Development (SDD) e agentes de IA (Claude Code) no fluxo de entrega, em que as funcionalidades são especificadas antes da implementação e executadas com revisão humana e gates de CI.

### Engenheiro Full-Stack — JHONROB Silos e Secadores
Nov 2023 – Mar 2026 | Brasil

- Liderei o GEM ERP (Next.js e Supabase/PostgreSQL) e construí seu aplicativo mobile em React Native, alcançando redução de 80% nos erros de propostas comerciais, aumento de cerca de 14% no lucro mensal e mais de 100 usuários ativos diários, com Kanban multivisão em tempo real, chat corporativo, assistente com GPT e trilha de auditoria append-only.
- Desenvolvi ferramentas em Kotlin Multiplatform (Compose, Ktor e SQLDelight) para a exportação automática de arquivos CAD e módulos Android para os operadores da fábrica, com cache em múltiplas camadas e sincronização em tempo real abaixo de 200 ms em um VPS com Docker e Nginx.

### Engenheiro Full-Stack Sênior — afonsodev.com (Fundador e Consultor Independente)
Jan 2020 – Atual | Remoto

**Stormzplus — Plataforma de Streaming por Assinatura (Fundador)** · mobile, web e admin
- Construí a plataforma completa de VOD com Next.js e Supabase, pipeline de transcodificação em Go com FFmpeg/NVENC acelerado por GPU (HLS de 240p a 4K), Cloudflare R2/CDN e assinaturas via Stripe e Mercado Pago (PIX) com webhooks idempotentes.
- Implementei o Watch Party via LiveKit, que suporta até 50 espectadores simultâneos com sinalização customizada sobre data channels, além de um player HLS próprio com legendas, retomada de reprodução, seletor de qualidade e reprodução em segundo plano.

**Orça Norte — Marketplace B2B de Construção (orcanorte.com.br)** · App Store
- Construí um marketplace SSR/ISR com mais de 500 empresas cadastradas, sistema multi-tenant de fornecedores, planos de assinatura, RBAC e dashboards operacionais, usando Next.js, Prisma, PostgreSQL e NextAuth.
- Publiquei o aplicativo do marketplace na App Store, desenvolvido com Expo e expo-router, TanStack Query, Sign in with Apple, notificações push e atualizações OTA.

### Desenvolvedor Full-Stack — TopSapp
Jan 2021 – Set 2022 | Brasil
- Desenvolvi interfaces de gestão para provedores de internet com Next.js e React, migrei sistemas legados e atuei com CI/CD no GitLab em entregas com Scrum e Kanban.

### Desenvolvedor de Sistemas — Ecocentauro Sistemas Inteligentes
Jan 2019 – Out 2020 | Brasil
- Modelei bancos de dados PostgreSQL, otimizei consultas e construí relatórios financeiros e operacionais.

## OPEN SOURCE

**Next.js FFmpeg Transcoder** (MIT) · github.com/afonsoburginski/nextjs-ffmpeg-transcoder
Serviço em Go de ingestão de vídeo com aceleração por GPU (FFmpeg/NVENC), transcodificação HLS e armazenamento no Cloudflare R2.

## FORMAÇÃO E IDIOMAS

**Bacharelado em Sistemas de Informação** — Unemat Sinop · 2020–2024
Certificações: Meta Back-End Developer Professional Certificate · IBM Full Stack Software Developer Professional Certificate
Idiomas: Português (nativo) · Inglês (B2 — comunicação técnica e reuniões com clientes)
