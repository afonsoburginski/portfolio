# AFONSO KEVIN BURGINSKI

## Engenheiro Full-Stack Sênior (Next.js / React / Supabase / Go)

Email: afonsoburginski@gmail.com • Portfólio: afonsodev.com • GitHub: github.com/afonsoburginski • LinkedIn: linkedin.com/in/afonsoburginski

## RESUMO

Engenheiro Full-Stack Sênior com 6+ anos projetando, construindo e entregando produtos inteiros usados por milhares de pessoas todos os dias. Atua em toda a stack, da modelagem de banco e APIs real-time a interfaces polidas e de alta performance. Domínio profundo de arquiteturas real-time, estratégias de cache em múltiplas camadas (SSR/RSC, Zustand, TanStack Query), integrações de pagamento, pipelines de vídeo e funcionalidades com IA. Foco em entregar sistemas que geram resultados reais de negócio com clean architecture, RBAC, trilhas de auditoria e infraestrutura escalável. Responsável por todo o ciclo do produto: arquitetura, serviços backend, frontend, DevOps e deploy.

## HABILIDADES

Frontend: Next.js (App Router, RSC, Turbopack), React, TypeScript, TailwindCSS, Radix UI, Framer Motion, Zustand, TanStack React Query, SWR, Recharts, ReactFlow
Backend & Dados: Supabase (Auth/DB/Realtime/Storage), PostgreSQL, Prisma ORM, Drizzle ORM, Go, Kotlin, Node.js, REST APIs
Pagamentos & Billing: Stripe (checkout, webhooks, assinaturas), Mercado Pago (PIX)
Real-time & Vídeo: LiveKit (WebRTC SFU), WebSockets, Supabase Realtime, FFmpeg/NVENC (transcodificação HLS), Cloudflare R2/CDN
IA: Integração OpenAI GPT, assistentes context-aware, execução de funções
Arquitetura: Clean Architecture, SOLID, RBAC, SSR/ISR, sincronização real-time, offline-first, pipelines de vídeo HLS
DevOps & Cloud: Docker, AWS EC2, Nginx, Vercel, Cloudflare R2/CDN, Tauri, CI/CD, Linux/VPS, Git/GitHub

## EXPERIÊNCIA

### Engenheiro Full Stack — JHONROB Silos e Secadores
Nov 2023 – Presente | Brasil

- Conduzi a concepção e o desenvolvimento do GEM (Next.js App Router + Supabase/Postgres) — ERP industrial que substituiu fluxos em Excel, acelerando processos em até 80% e eliminando falhas de comunicação via colaboração real-time e audit log append-only.
- Cache em múltiplas camadas (Zustand + TanStack Query + in-memory), estratégia SSR/RSC e subscriptions real-time; 5.000+ linhas de schema Prisma. Deploy via Docker e Nginx em VPS dedicado.
- **Dashboards & Analytics**: acompanhamento de progresso de obras, métricas de produtividade por usuário e por coluna, taxas de conclusão, análise de tendências (7d/30d/90d/1a), dashboards financeiros (contas a pagar/receber), tudo com Recharts.
- **Kanban em tempo real**: multi-view (board, tabela, lista, consulta) com drag-and-drop (dnd-kit), subtarefas com time tracking, triggers/automação, anexos via Supabase Storage, comentários com menções e tracking de cursor multi-usuário em tempo real.
- **Chat corporativo**: workspaces, canais públicos/privados, DMs, threads, reações, menções, mensagens de voz, fixadas, anúncios e compartilhamento de documentos — tudo real-time via Supabase Realtime/WebSockets, validado em cenários multiusuário.
- **Assistente IA**: assistente GPT context-aware integrado ao chat que executa funções, gera resumos de canais, extrai atualizações e realiza busca inteligente.
- **Auditoria & RBAC**: audit log append-only com snapshots antes/depois e 20+ tipos de evento; rastreabilidade de mudanças críticas e validação RBAC server-side.
- Desenvolvi serviços backend em Kotlin e ferramentas nativas (Kotlin Multiplatform + Ktor + SQLDelight) para automação de exportação de arquivos CAD.
- Aplicação desktop com Tauri para fluxos offline-first em ambientes fabris.

### Desenvolvedor Full-Stack Sênior — afonsodev.com (Consultoria Independente)
Jan 2020 – Presente | Remoto

**Stormzplus — Plataforma de Streaming por Assinatura (Web + Admin)**
- Construí plataforma web full-stack com Next.js (App Router, RSC), React, Supabase Auth/DB, PostgreSQL e Drizzle ORM — multi-perfil com feature gating por tier (FREE/STANDARD/PREMIUM), conteúdo curado, progresso de visualização, favoritos e destaques.
- Pipeline de vídeo GPU-acelerado: serviço Go orquestrando FFmpeg com NVIDIA NVENC para transcodificação HLS multi-bitrate (240p–4K), armazenado no Cloudflare R2 com cache CDN e chaves imutáveis. Streaming I/O suportando uploads de 10GB+.
- Billing Stripe + Mercado Pago (PIX) com webhooks idempotentes e gestão completa do ciclo de assinatura.
- Integrei LiveKit WebRTC SFU para Watch Party em tempo real (até 50 viewers simultâneos) — protocolo de sinalização customizado via data channels com sync host/viewer, fallback para Supabase Broadcast para resiliência.
- Player HLS customizado com legendas, retomada, seletor de qualidade (240p–4K), detecção de capítulos (skip intro/outro) e tratamento resiliente de erros.
- Rotas com controle de acesso via Supabase Auth e middleware SSR vinculado ao tier do plano. Cache em múltiplas camadas (Zustand + SWR + in-memory).
- CMS Admin completo: gestão de conteúdo (títulos, temporadas, episódios, gêneros), clientes e assinaturas, pipeline de ingestão com tracking de jobs FFmpeg e progresso real-time.
- Aplicação desktop com Tauri para performance nativa.

**Orça Norte — Marketplace B2B de Orçamentos (orcanorte.com.br)**
- Construí marketplace para construção servindo 500+ empresas cadastradas e milhares de usuários finais gerando orçamentos diariamente.
- Next.js, Prisma ORM, PostgreSQL, NextAuth, Zustand, TanStack React Query, Recharts, Radix UI.
- Arquitetura SEO-first com SSR/ISR e páginas indexáveis. Sistema multi-tenant com roles, trilha de auditoria e importação em lote. Planos de assinatura sem taxas e ranking boosted.

### Engenheiro Full Stack — TopSapp (Gestão de Provedores)
Jan 2021 – Set 2022 | Brasil

- Construí e mantive interfaces web com Next.js para gestão de provedores de internet (dados de clientes, billing, suporte). Migrei módulos legados para React/Next.js. Implementei pipelines CI/CD com GitLab e metodologias ágeis (Scrum/Kanban).

### Programador de Sistemas — Ecocentauro Sistemas Inteligentes
Jan 2019 – Out 2020 | Brasil

- Gerenciei bancos PostgreSQL, design de schemas e otimização de queries. Desenvolvi layouts de relatórios financeiros e operacionais.

## OPEN SOURCE

### Next.js FFmpeg Transcoder (MIT)
- Pipeline de ingestão de vídeo e transcodificação HLS extraída do Stormzplus. Uploads ilimitados via servidor Go com streaming I/O (10GB+), aceleração GPU FFmpeg/NVENC, armazenamento Cloudflare R2, dashboard admin Next.js.
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
