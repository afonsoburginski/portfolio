import type { CaseStudyContent } from "./types";

export const studioStormzCaseStudy: Record<"en" | "pt", CaseStudyContent> = {
  en: {
    slug: "studio-stormz",
    locale: "en",
    eyebrow: "AI media infrastructure / Studio and Stormz direction",
    title: "Studio / Stormz",
    summary:
      "A media product in development: asynchronous creation in Studio today, with a streaming and VOD direction that is intentionally separated from what is already shipped.",
    tags: ["Bun + Hono", "BullMQ", "Postgres", "Redis", "R2", "Media systems"],
    architectureLabel: "Studio / architecture",
    architectureDescription:
      "The implemented path keeps business state in Postgres, bytes in R2, and long-running work in workers. The Stormz playback and VOD layer remains a planned extension, not a delivered pipeline.",
    flowLabel: "Studio / generation flow",
    flowDescription:
      "A request is quoted and authorized, recorded with an outbox event, published to BullMQ, processed by a worker, and persisted to R2 before becoming ready.",
    sections: [
      {
        id: "context",
        title: "Context and problem",
        intro:
          "Studio is a multimodal creation product for image, video, voice, music, sound effects, and transcription in one project and timeline. The engineering problem is coordinating expensive, failure-prone work without making the interface wait on providers or turning remote media URLs into permanent product state.",
        points: [
          "The repository describes a Vite/React client, a Hono + Bun API, BullMQ workers, Postgres, Redis, and Cloudflare R2.",
          "Stormz is the adjacent streaming/VOD direction; the current repository does not prove that a production HLS/ABR catalog or player has shipped.",
        ],
      },
      {
        id: "role",
        title: "My role",
        intro:
          "I shaped the full-cycle product architecture: domain boundaries, asynchronous execution, storage contracts, provider integration, frontend state, and the operational path around them.",
        points: [
          "The work spans the React client, modular Hono server, queue workers, generation domain, asset storage, provider adapters, billing/credits, and project data.",
          "The case study separates implemented foundations from the future media-delivery surface so product direction is not presented as production evidence.",
        ],
      },
      {
        id: "requirements",
        title: "Challenges and requirements",
        intro:
          "Generation and media systems cross time, money, external providers, and storage boundaries. The system needs explicit state and safe retries at every boundary.",
        points: [
          "The API must remain responsive; long-running generation belongs to workers, not HTTP handlers.",
          "A business transaction and its outbox event must commit together so work is recoverable if Redis or a worker is unavailable.",
          "Retries must be idempotent and provider failures must distinguish retryable errors from permanent failures and ambiguous submissions.",
          "Tenant ownership and signed URLs must protect private media while allowing controlled publication of preview assets.",
        ],
      },
      {
        id: "architecture",
        title: "Architecture overview",
        intro:
          "The implemented Studio architecture is a modular monolith plus a separate worker process. Postgres owns business truth, Redis carries queue and cache concerns, and R2 owns media bytes.",
        points: [
          "The client calls the Hono API; the API validates, quotes, reserves credits, records generation state, and writes an outbox event.",
          "An outbox publisher reads Postgres with row locking, enqueues a BullMQ job using the event id as job id, and marks the event processed only after enqueue succeeds.",
          "Generation workers submit or poll providers, download outputs, write them to tenant-scoped R2 keys, and finalize the database state.",
          "The future Stormz layer can consume ready media, but HLS packaging, ABR policy, CDN delivery, and a production player are not evidenced as implemented here.",
        ],
      },
      {
        id: "decisions",
        title: "Technical decisions and alternatives",
        intro:
          "The design prefers explicit contracts over hidden retries and keeps provider vocabulary at the adapter boundary.",
        points: [
          "The outbox pattern is used instead of publishing directly from a request, so Postgres remains the durable source for work that must not disappear.",
          "BullMQ is a delivery mechanism, not the source of business state; workers reread generation state from Postgres.",
          "R2 stores bytes while Postgres stores metadata and ownership; media is uploaded directly with signed URLs instead of passing through Hono.",
          "Provider adapters implement a shared generation contract without leaking provider-specific parameter names into the domain.",
          "A future streaming pipeline should be evaluated against direct progressive delivery, HLS/ABR packaging, and managed media services; no alternative is claimed as already discarded by the repository.",
        ],
      },
      {
        id: "tradeoffs",
        title: "Trade-offs: latency, scale, cost, reliability",
        intro:
          "The current system spends complexity on correctness and recovery because an AI generation is both slow and billable.",
        points: [
          "Polling introduces delay, but makes provider state recoverable over HTTP and avoids treating a transient connection as final truth.",
          "Postgres is deliberately the source of truth; Redis can lose in-flight performance state without erasing account or generation records.",
          "Signed URLs and direct-to-R2 transfer reduce API bandwidth and protect private bytes, at the cost of URL expiry and explicit publication semantics.",
          "Credits, concurrency limits, daily budgets, idempotency keys, and retry policy bound provider spend and duplicate work.",
          "HLS/ABR and CDN choices remain open trade-offs for Stormz because the repository does not yet contain a verified playback pipeline.",
        ],
      },
      {
        id: "implementation",
        title: "Implementation and operation",
        intro:
          "The implemented loop covers uploads, generation orchestration, provider adapters, notifications, and media retention boundaries.",
        points: [
          "Uploads use intent, direct signed PUT, and confirmation; the server checks the object before treating the asset as confirmed.",
          "Generation states include queued, submitting, polling, ready, failed, rejected, canceled, and an ambiguous submission state that is reconciled before retrying.",
          "The worker process registers media, notification, generation, webhook, maintenance, and analytics groups; queue groups can be enabled independently.",
          "R2 uses tenant-scoped owners paths, signed reads, a public preview prefix, lifecycle rules, and a WAF boundary between public previews and private media.",
          "The client already contains project, timeline, job, upload, library, and media-oriented surfaces; Stormz playback remains in development/planned scope.",
        ],
      },
      {
        id: "results",
        title: "Verifiable results",
        intro:
          "The source proves an implemented asynchronous media foundation. It does not prove a shipped streaming service or commercial outcome.",
        points: [
          "The specs mark idempotency, generation authorization, outbox publishing, generation workers, sandbox flow, provider adapters, and generation HTTP routes as implemented and tested.",
          "The documented sandbox path runs a request through quote, reservation, queue, worker, R2, and credit settlement.",
          "The repository contains React client features for Studio projects, timeline composition, jobs, uploads, library, and generation playback surfaces.",
          "No verified implementation of FFmpeg-based video transcoding, HLS/LL-HLS packaging, ABR ladders, a Stormz VOD catalog, or production video player was found; those metrics and artifacts remain pending.",
        ],
      },
      {
        id: "lessons",
        title: "Lessons learned",
        intro:
          "Media products become easier to evolve when the system treats bytes, metadata, provider state, and product state as separate but linked concerns.",
        points: [
          "The outbox gives asynchronous work a durable handoff without making Redis responsible for business truth.",
          "A provider timeout is not the same as a provider rejection; modeling ambiguity avoids blind duplicate submissions.",
          "Storage layout and tenant ownership are architecture, not an implementation detail added after the player.",
          "A direction such as streaming needs its own evidence gate before HLS, CDN, or player claims belong in a delivered-results section.",
        ],
      },
      {
        id: "next",
        title: "Next evolutions",
        intro:
          "The next evolution is to close the media-delivery loop while keeping the current correctness boundaries intact.",
        points: [
          "Connect the generation and asset model to a verified media processing pipeline, with explicit FFmpeg or managed-transcode decisions.",
          "Define the Stormz playback contract: packaging, HLS/ABR profiles, CDN cache policy, authorization, captions, and player behavior.",
          "Add end-to-end evidence for processing latency, queue age, provider failure rate, storage cost, playback startup, and rebuffering.",
          "Validate web and mobile playback surfaces only after the delivery path is implemented and observable.",
        ],
      },
    ],
    verifiedLabel: "Implementation boundary",
    verifiedItems: [
      "Implemented/documented: async generation, outbox, BullMQ workers, Postgres, Redis, R2, signed media access.",
      "In development/planned: Stormz VOD, FFmpeg/transcoding, HLS/ABR, CDN playback, and mobile streaming surfaces.",
      "Not evidenced: production playback metrics or a shipped Netflix-style catalog.",
    ],
    evidenceNote:
      "Studio has an implemented asynchronous generation and asset foundation. The repository does not yet prove the Stormz HLS/ABR/VOD pipeline, so those elements are labeled in development or planned rather than shipped.",
    statusLabel: "In development / scope marked",
  },
  pt: {
    slug: "studio-stormz",
    locale: "pt",
    eyebrow: "Infraestrutura de mídia com IA / direção Studio e Stormz",
    title: "Studio / Stormz",
    summary:
      "Um produto de mídia em desenvolvimento: criação assíncrona no Studio hoje e uma direção de streaming/VOD separada explicitamente do que já foi entregue.",
    tags: ["Bun + Hono", "BullMQ", "Postgres", "Redis", "R2", "Sistemas de mídia"],
    architectureLabel: "Studio / arquitetura",
    architectureDescription:
      "O caminho implementado mantém estado de negócio no Postgres, bytes no R2 e trabalho longo em workers. A camada de playback e VOD do Stormz continua planejada, não é um pipeline entregue.",
    flowLabel: "Studio / fluxo de geração",
    flowDescription:
      "Um pedido é cotado e autorizado, gravado com um evento outbox, publicado no BullMQ, processado por um worker e persistido no R2 antes de ficar pronto.",
    sections: [
      {
        id: "context",
        title: "Contexto e problema",
        intro:
          "O Studio é um produto de criação multimodal para imagem, vídeo, voz, música, efeitos e transcrição em um mesmo projeto e timeline. O problema de engenharia é coordenar trabalho caro e sujeito a falhas sem fazer a interface esperar provedores ou transformar URLs remotas em estado permanente do produto.",
        points: [
          "O repositório descreve cliente Vite/React, API Hono + Bun, workers BullMQ, Postgres, Redis e Cloudflare R2.",
          "Stormz é a direção adjacente de streaming/VOD; o repositório atual não comprova um catálogo HLS/ABR ou player de produção entregue.",
        ],
      },
      {
        id: "role",
        title: "Meu papel",
        intro:
          "Modelei a arquitetura full-cycle do produto: limites de domínio, execução assíncrona, contratos de armazenamento, integração com provedores, estado do frontend e operação ao redor deles.",
        points: [
          "O trabalho atravessa cliente React, servidor Hono modular, workers, domínio de geração, armazenamento de assets, adaptadores de provedores, créditos e projetos.",
          "O estudo separa fundações implementadas da futura superfície de entrega de mídia, sem apresentar direção de produto como evidência de produção.",
        ],
      },
      {
        id: "requirements",
        title: "Desafios e requisitos",
        intro:
          "Geração e mídia atravessam tempo, dinheiro, provedores externos e armazenamento. O sistema precisa de estado explícito e retries seguros em cada fronteira.",
        points: [
          "A API precisa continuar responsiva; trabalho longo pertence aos workers, não aos handlers HTTP.",
          "A transação de negócio e seu evento outbox precisam ser confirmados juntos, para que o trabalho seja recuperável se Redis ou worker estiver indisponível.",
          "Retries devem ser idempotentes, distinguindo falhas retentáveis, permanentes e submissões ambíguas.",
          "Ownership por tenant e URLs assinadas protegem mídia privada enquanto permitem publicação controlada de previews.",
        ],
      },
      {
        id: "architecture",
        title: "Visão geral da arquitetura",
        intro:
          "A arquitetura implementada do Studio é um monólito modular com um processo separado de workers. O Postgres é a fonte da verdade, o Redis cuida de fila e cache, e o R2 guarda bytes de mídia.",
        points: [
          "O cliente chama a API Hono; a API valida, cota, reserva créditos, grava a geração e escreve um evento outbox.",
          "Um publicador lê o Postgres com lock de linhas, enfileira no BullMQ usando o id do evento como job id e só marca o evento como processado depois do enqueue.",
          "Workers de geração submetem ou consultam provedores, baixam saídas, gravam chaves do tenant no R2 e finalizam o estado no banco.",
          "A futura camada Stormz pode consumir mídia pronta, mas empacotamento HLS, política ABR, CDN e player de produção não têm evidência de implementação aqui.",
        ],
      },
      {
        id: "decisions",
        title: "Decisões técnicas e alternativas",
        intro:
          "O design prefere contratos explícitos a retries escondidos e mantém o vocabulário de cada provedor na borda do adaptador.",
        points: [
          "O padrão outbox substitui publicação direta a partir da requisição, mantendo no Postgres a fonte durável do trabalho que não pode desaparecer.",
          "BullMQ é mecanismo de entrega, não fonte de estado de negócio; workers relêem a geração no Postgres.",
          "R2 guarda bytes e Postgres guarda metadados e ownership; mídia vai direto por URL assinada em vez de atravessar o Hono.",
          "Adaptadores implementam um contrato comum sem vazar parâmetros específicos de provedor para o domínio.",
          "Um pipeline futuro de streaming deverá comparar entrega progressiva, empacotamento HLS/ABR e serviços gerenciados; o repositório não registra alternativa descartada como fato já decidido.",
        ],
      },
      {
        id: "tradeoffs",
        title: "Trade-offs: latência, escala, custo e confiabilidade",
        intro:
          "O sistema atual investe em correção e recuperação porque uma geração de IA é lenta e faturável.",
        points: [
          "Polling adiciona atraso, mas torna o estado recuperável por HTTP e evita tratar conexão transitória como verdade final.",
          "Postgres é deliberadamente a fonte de verdade; Redis pode perder desempenho de jobs em voo sem apagar registros de conta ou geração.",
          "URLs assinadas e transferência direta para R2 reduzem banda da API e protegem bytes privados, ao custo de expiração e semântica explícita de publicação.",
          "Créditos, limites de concorrência, orçamento diário, idempotência e retry limitam custo de provedor e trabalho duplicado.",
          "HLS/ABR e CDN continuam trade-offs abertos para Stormz, pois o repositório ainda não contém um pipeline de playback verificável.",
        ],
      },
      {
        id: "implementation",
        title: "Implementação e operação",
        intro:
          "O ciclo implementado cobre uploads, orquestração de geração, adaptadores, notificações e fronteiras de retenção de mídia.",
        points: [
          "Uploads usam intenção, PUT assinado direto e confirmação; o servidor confere o objeto antes de tratar o asset como confirmado.",
          "Estados de geração incluem queued, submitting, polling, ready, failed, rejected, canceled e submissão ambígua, reconciliada antes de retry.",
          "O processo worker registra grupos de mídia, notificações, geração, webhooks, manutenção e analytics; grupos podem ser ativados separadamente.",
          "O R2 usa caminhos owners por tenant, leituras assinadas, prefixo público de previews, lifecycle e uma fronteira WAF entre previews públicos e mídia privada.",
          "O cliente já tem superfícies de projetos, timeline, jobs, uploads, biblioteca e mídia; playback Stormz continua em desenvolvimento/planejado.",
        ],
      },
      {
        id: "results",
        title: "Resultados verificáveis",
        intro:
          "O código prova uma fundação assíncrona de mídia implementada. Não prova um serviço de streaming ou resultado comercial entregue.",
        points: [
          "As specs marcam idempotência, autorização, outbox, workers de geração, sandbox, adaptadores e rotas HTTP de geração como implementados e testados.",
          "O caminho sandbox documentado passa por cotação, reserva, fila, worker, R2 e liquidação de créditos.",
          "O repositório contém features React para projetos, timeline, jobs, uploads, biblioteca e superfícies de playback de geração.",
          "Não encontrei implementação verificável de transcodificação FFmpeg, empacotamento HLS/LL-HLS, ladders ABR, catálogo VOD Stormz ou player de vídeo de produção; métricas e artefatos continuam pendentes.",
        ],
      },
      {
        id: "lessons",
        title: "Lições aprendidas",
        intro:
          "Produtos de mídia evoluem melhor quando bytes, metadados, estado do provedor e estado do produto são preocupações separadas, mas conectadas.",
        points: [
          "O outbox cria uma passagem durável para o trabalho assíncrono sem tornar Redis responsável pela verdade de negócio.",
          "Timeout de provedor não é rejeição; modelar a ambiguidade evita submissões duplicadas às cegas.",
          "Layout de storage e ownership por tenant são arquitetura, não detalhe para decidir depois do player.",
          "Uma direção de streaming precisa de uma porta de evidência própria antes de claims sobre HLS, CDN ou player entrarem em resultados entregues.",
        ],
      },
      {
        id: "next",
        title: "Próximas evoluções",
        intro:
          "A próxima evolução é fechar o ciclo de entrega de mídia mantendo as fronteiras de correção atuais.",
        points: [
          "Conectar o modelo de geração e assets a um pipeline verificável de processamento, com decisão explícita entre FFmpeg e transcodificação gerenciada.",
          "Definir o contrato de playback do Stormz: empacotamento, perfis HLS/ABR, cache de CDN, autorização, legendas e comportamento do player.",
          "Adicionar evidência ponta a ponta de latência de processamento, idade de fila, falhas de provedor, custo de storage, início de playback e rebuffering.",
          "Validar superfícies web e mobile de playback somente depois de o caminho de entrega estar implementado e observável.",
        ],
      },
    ],
    verifiedLabel: "Limite da implementação",
    verifiedItems: [
      "Implementado/documentado: geração assíncrona, outbox, workers BullMQ, Postgres, Redis, R2 e acesso assinado.",
      "Em desenvolvimento/planejado: VOD Stormz, FFmpeg/transcodificação, HLS/ABR, playback por CDN e superfícies mobile.",
      "Sem evidência: métricas de playback ou catálogo estilo Netflix entregue.",
    ],
    evidenceNote:
      "O Studio tem uma fundação implementada para geração assíncrona e assets. O repositório ainda não prova o pipeline HLS/ABR/VOD do Stormz; por isso esses elementos estão marcados como em desenvolvimento ou planejados.",
    statusLabel: "Em desenvolvimento / escopo marcado",
  },
};
