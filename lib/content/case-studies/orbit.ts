import type { CaseStudyContent } from "./types";

export const orbitCaseStudy: Record<"en" | "pt", CaseStudyContent> = {
  en: {
    slug: "orbit",
    locale: "en",
    eyebrow: "Internal developer platform / platform engineering",
    title: "Orbit",
    summary:
      "A delivery and operations surface that connects a commit to a running environment without hiding the state transitions in between.",
    tags: ["GitOps", "Argo CD", "Kubernetes", "Docker Compose", "Observability"],
    architectureLabel: "Orbit / architecture",
    architectureDescription:
      "The GitOps repository is the durable boundary. Orbit coordinates releases and operations; Argo CD reconciles Kubernetes state, while Compose environments are observed and changed over SSH.",
    flowLabel: "Orbit / delivery flow",
    flowDescription:
      "A green CI build becomes a release, then a GitOps commit. Automatic deployment is a policy on top of that recorded state, not a second source of truth.",
    sections: [
      {
        id: "context",
        title: "Context and problem",
        intro:
          "Orbit was built to make delivery and day-two operations legible across services, environments, clusters, and servers. The problem was not only deploying an image: it was keeping release history, desired state, runtime health, access, and recovery in one coherent operating model.",
        points: [
          "The product README describes the path from commit to production through CI, an image registry, a release record, GitOps, and Argo CD.",
          "The same surface covers releases, environments, servers, observability, terminal access, and access control.",
        ],
      },
      {
        id: "role",
        title: "My role",
        intro:
          "I designed and implemented the platform surface and the backend integrations that connect delivery intent to the infrastructure where services run.",
        points: [
          "I worked across the frontend console, the Node backend, GitOps templates, deployment hooks, runtime inspection, and operational feedback loops.",
          "The ownership boundary includes both the happy path and the recovery path: deploy, rollback, health, logs, alerts, and permissions.",
        ],
      },
      {
        id: "requirements",
        title: "Challenges and requirements",
        intro:
          "The platform had to support different runtime shapes without pretending they were the same system.",
        points: [
          "Kubernetes environments use Argo CD, manifests, services, pods, HPA settings, probes, and cluster APIs.",
          "Docker Compose environments use SSH and Docker inspection, stats, events, and logs on the host.",
          "Discovery must use data such as images, ports, labels, domains, and metrics — never product names or hard-coded service assumptions.",
          "Access is permissioned by capability, including delivery, environment changes, monitoring, and terminal access.",
        ],
      },
      {
        id: "architecture",
        title: "Architecture overview",
        intro:
          "Orbit is an orchestration layer around an explicit desired-state repository. Its integrations read the runtime differently, but both paths preserve the same operational concepts: version, environment, health, evidence, and action history.",
        points: [
          "CI publishes an image tagged by commit SHA; Orbit identifies the changed service and records a release.",
          "A deploy, rollback, environment change, or automatic remediation becomes a Git commit in the GitOps repository.",
          "Argo CD applies that state to kind, k3s, or RKE2-based Kubernetes environments.",
          "Compose deployment hooks and runtime inspection go through SSH and Docker commands on the target server.",
        ],
      },
      {
        id: "decisions",
        title: "Technical decisions and alternatives",
        intro:
          "The main design decision was to keep intent declarative and observable instead of making the console an opaque imperative deploy runner.",
        points: [
          "GitOps is the source of truth, so deploys and rollbacks are auditable commits rather than mutable console-only state.",
          "Detection is signal-based, so the same console can understand services and external dependencies without coupling to a product name.",
          "Argo CD remains the Kubernetes reconciler; Orbit adds a focused operating surface instead of replacing reconciliation.",
          "The documented runtime alternatives are Kubernetes and Docker Compose. Swarm is not supported by the evidence in this repository.",
        ],
      },
      {
        id: "tradeoffs",
        title: "Trade-offs: latency, scale, cost, reliability",
        intro:
          "The system favors inspectable state and bounded operational behavior over an abstract promise that every runtime behaves identically.",
        points: [
          "Git commits add reconciliation delay, but make intent durable and recoverable. The documented Argo/ApplicationSet polling intervals are explicit rather than hidden.",
          "Runtime metrics and logs are collected on schedules and caches, reducing load while making freshness visible in the UI.",
          "A service that is unhealthy does not automatically block every other service; rollout health gates and wave behavior limit blast radius.",
          "Automatic remediation can adjust memory or roll back a failed release within documented guardrails, trading speed for conservative, reviewable changes.",
        ],
      },
      {
        id: "implementation",
        title: "Implementation and operation",
        intro:
          "The console exposes delivery as an operating loop rather than a single deploy button.",
        points: [
          "Releases can be searched, deployed, or rolled back; environments expose service versions, automatic-deploy policy, infrastructure, variables, topics, and access.",
          "The monitoring surface combines Kubernetes/Argo data with service metrics, logs, events, queues, and infrastructure signals when available.",
          "Compose uses SSH-backed collection for Docker stats, inspection, events, health checks, logs, and live log follow.",
          "The canvas groups traffic edges, external dependencies, queues, and services from observed signals; it is not a manually curated product map.",
        ],
      },
      {
        id: "results",
        title: "Verifiable results",
        intro:
          "The repository proves capabilities, not business outcomes. These are the claims supported by its README, source, tests, and documentation.",
        points: [
          "The codebase contains backend tests for rollout, deploy hooks, service metrics, Compose inspection, remediation, queues, and signal loading.",
          "The documented runtime matrix includes kind, k3s, and RKE2 for Kubernetes plus Docker Compose via SSH.",
          "The console includes release, fleet, monitoring, service, notification, access, terminal, and GitOps-oriented surfaces.",
          "Impact metrics such as deployment frequency, lead time, failure rate, and recovery time are not published in the source and remain pending evidence.",
        ],
      },
      {
        id: "lessons",
        title: "Lessons learned",
        intro:
          "A platform becomes trustworthy when its boundaries are visible: desired state versus observed state, runtime differences, and action permissions.",
        points: [
          "A single abstraction is useful only when it preserves the differences that operators actually need to see.",
          "Observability is part of the delivery product: a release without health, logs, or rollback context is an incomplete workflow.",
          "Data-driven discovery keeps the platform extensible and prevents operational logic from becoming a list of exceptions.",
        ],
      },
      {
        id: "next",
        title: "Next evolutions",
        intro:
          "The next step is stronger evidence and safer scale, not a broader list of integrations for its own sake.",
        points: [
          "Instrument and publish outcome metrics for delivery performance and reliability, with definitions that distinguish capability from measured impact.",
          "Continue tightening signal quality and failure explanations across Kubernetes and Compose so every dashboard state has a clear source.",
          "Extend recovery policies only when their blast radius, permissions, and audit trail remain explicit.",
        ],
      },
    ],
    verifiedLabel: "Evidence boundary",
    verifiedItems: [
      "Documented: Kubernetes with Argo CD and GitOps; Compose through SSH.",
      "Documented: signal-based discovery using images, ports, labels, domains, and metrics.",
      "Not evidenced: Docker Swarm support or outcome benchmarks.",
    ],
    evidenceNote:
      "This case study intentionally does not claim Swarm support. The Orbit repository documents kind/k3s/RKE2 and Docker Compose via SSH; any additional runtime claim needs separate evidence.",
    statusLabel: "Built / private system",
  },
  pt: {
    slug: "orbit",
    locale: "pt",
    eyebrow: "Plataforma interna de desenvolvimento / platform engineering",
    title: "Orbit",
    summary:
      "Uma superfície de entrega e operação que conecta um commit a um ambiente em execução sem esconder as transições de estado no caminho.",
    tags: ["GitOps", "Argo CD", "Kubernetes", "Docker Compose", "Observabilidade"],
    architectureLabel: "Orbit / arquitetura",
    architectureDescription:
      "O repositório GitOps é a fronteira durável. O Orbit coordena releases e operação; o Argo CD reconcilia o estado no Kubernetes, enquanto ambientes Compose são observados e alterados por SSH.",
    flowLabel: "Orbit / fluxo de entrega",
    flowDescription:
      "Um build verde do CI vira uma release e depois um commit no GitOps. O deploy automático é uma política sobre esse estado registrado, não uma segunda fonte de verdade.",
    sections: [
      {
        id: "context",
        title: "Contexto e problema",
        intro:
          "O Orbit foi construído para tornar entrega e operação de dia dois legíveis entre serviços, ambientes, clusters e servidores. O problema não era apenas publicar uma imagem: era manter histórico de release, estado desejado, saúde do runtime, acesso e recuperação em um modelo operacional coerente.",
        points: [
          "O README descreve o caminho do commit à produção por CI, registro de imagens, registro de release, GitOps e Argo CD.",
          "A mesma superfície cobre releases, ambientes, servidores, observabilidade, terminal e controle de acesso.",
        ],
      },
      {
        id: "role",
        title: "Meu papel",
        intro:
          "Projetei e implementei a superfície da plataforma e as integrações de backend que conectam a intenção de entrega à infraestrutura onde os serviços rodam.",
        points: [
          "Atuei no console frontend, backend Node, templates GitOps, ganchos de deploy, inspeção de runtime e ciclos de feedback operacional.",
          "A responsabilidade inclui caminho feliz e recuperação: deploy, rollback, saúde, logs, alertas e permissões.",
        ],
      },
      {
        id: "requirements",
        title: "Desafios e requisitos",
        intro:
          "A plataforma precisava suportar runtimes diferentes sem fingir que eram o mesmo sistema.",
        points: [
          "Ambientes Kubernetes usam Argo CD, manifestos, serviços, pods, HPA, probes e APIs do cluster.",
          "Ambientes Docker Compose usam SSH e inspeção, métricas, eventos e logs do Docker no host.",
          "A descoberta usa dados como imagens, portas, labels, domínios e métricas — nunca nomes de produto ou suposições fixas.",
          "O acesso é permissionado por capacidade, incluindo entrega, mudanças de ambiente, monitoramento e terminal.",
        ],
      },
      {
        id: "architecture",
        title: "Visão geral da arquitetura",
        intro:
          "O Orbit é uma camada de orquestração em torno de um repositório explícito de estado desejado. As integrações leem o runtime de formas diferentes, mas preservam os mesmos conceitos: versão, ambiente, saúde, evidência e histórico de ação.",
        points: [
          "O CI publica uma imagem identificada pelo SHA do commit; o Orbit identifica o serviço alterado e registra a release.",
          "Deploy, rollback, mudança de ambiente ou autocorreção vira um commit no repositório GitOps.",
          "O Argo CD aplica esse estado em ambientes Kubernetes baseados em kind, k3s ou RKE2.",
          "Ganchos de deploy e inspeção de Compose passam por SSH e comandos Docker no servidor alvo.",
        ],
      },
      {
        id: "decisions",
        title: "Decisões técnicas e alternativas",
        intro:
          "A decisão central foi manter a intenção declarativa e observável, em vez de transformar o console em um executor imperativo opaco.",
        points: [
          "GitOps é a fonte de verdade: deploys e rollbacks são commits auditáveis, não estado mutável apenas no console.",
          "A detecção é baseada em sinais, permitindo entender serviços e dependências externas sem acoplamento a nomes de produto.",
          "O Argo CD continua sendo o reconciliador Kubernetes; o Orbit fornece uma superfície operacional focada.",
          "As alternativas documentadas são Kubernetes e Docker Compose. O repositório não comprova suporte a Swarm.",
        ],
      },
      {
        id: "tradeoffs",
        title: "Trade-offs: latência, escala, custo e confiabilidade",
        intro:
          "O sistema favorece estado inspecionável e comportamento operacional limitado, sem prometer que todos os runtimes se comportam de forma idêntica.",
        points: [
          "Commits Git adicionam o atraso da reconciliação, mas tornam a intenção durável e recuperável. Os intervalos documentados do Argo/ApplicationSet ficam explícitos.",
          "Métricas e logs são coletados por agendamento e cache, reduzindo carga e tornando a atualidade visível na interface.",
          "Um serviço não saudável não bloqueia automaticamente todos os outros; gates de saúde e ondas limitam o raio de impacto.",
          "A autocorreção pode ajustar memória ou reverter uma release com falha dentro de guardrails documentados, trocando velocidade por mudanças conservadoras e auditáveis.",
        ],
      },
      {
        id: "implementation",
        title: "Implementação e operação",
        intro:
          "O console expõe entrega como um ciclo operacional, não como um único botão de deploy.",
        points: [
          "Releases podem ser buscadas, aplicadas ou revertidas; ambientes expõem versões, política de deploy automático, infraestrutura, variáveis, tópicos e acesso.",
          "A superfície de monitoramento combina dados de Kubernetes/Argo com métricas, logs, eventos, filas e infraestrutura quando disponíveis.",
          "Compose usa coleta por SSH para stats, inspeção, eventos, health checks, logs e acompanhamento ao vivo.",
          "O canvas agrupa bordas de tráfego, dependências externas, filas e serviços a partir de sinais observados; não é um mapa manual.",
        ],
      },
      {
        id: "results",
        title: "Resultados verificáveis",
        intro:
          "O repositório prova capacidades, não resultados comerciais. Estas são as afirmações suportadas por README, código, testes e documentação.",
        points: [
          "Há testes de backend para rollout, ganchos de deploy, métricas, inspeção de Compose, autocorreção, filas e carregamento de sinais.",
          "A matriz documentada inclui kind, k3s e RKE2 para Kubernetes, além de Docker Compose via SSH.",
          "O console inclui superfícies de releases, frota, monitoramento, serviços, notificações, acesso, terminal e GitOps.",
          "Métricas de impacto como frequência de deploy, lead time, taxa de falhas e tempo de recuperação não aparecem no código e continuam pendentes.",
        ],
      },
      {
        id: "lessons",
        title: "Lições aprendidas",
        intro:
          "Uma plataforma se torna confiável quando suas fronteiras ficam visíveis: estado desejado versus observado, diferenças de runtime e permissões de ação.",
        points: [
          "Uma abstração só é útil quando preserva as diferenças que operadores realmente precisam enxergar.",
          "Observabilidade faz parte do produto de entrega: uma release sem saúde, logs ou contexto de rollback é um fluxo incompleto.",
          "Descoberta orientada por dados mantém a plataforma extensível e evita uma lista de exceções operacionais.",
        ],
      },
      {
        id: "next",
        title: "Próximas evoluções",
        intro:
          "O próximo passo é evidência mais forte e escala mais segura, não uma lista maior de integrações por si só.",
        points: [
          "Instrumentar e publicar métricas de resultado de entrega e confiabilidade, distinguindo capacidade do sistema de impacto medido.",
          "Aprofundar a qualidade dos sinais e das explicações de falha em Kubernetes e Compose, para que cada estado tenha uma fonte clara.",
          "Estender políticas de recuperação somente quando raio de impacto, permissões e trilha de auditoria continuarem explícitos.",
        ],
      },
    ],
    verifiedLabel: "Limite da evidência",
    verifiedItems: [
      "Documentado: Kubernetes com Argo CD e GitOps; Compose por SSH.",
      "Documentado: descoberta por sinais usando imagens, portas, labels, domínios e métricas.",
      "Sem evidência: suporte a Docker Swarm ou benchmarks de resultado.",
    ],
    evidenceNote:
      "Este estudo não afirma suporte a Swarm. O repositório do Orbit documenta kind/k3s/RKE2 e Docker Compose via SSH; qualquer runtime adicional precisa de evidência separada.",
    statusLabel: "Construído / sistema privado",
  },
};
