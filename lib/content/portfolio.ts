export type Locale = "en" | "pt";
export type LocalizedText = Record<Locale, string>;

export type PortfolioProject = {
  slug: string;
  eyebrow: LocalizedText;
  title: LocalizedText;
  summary: LocalizedText;
  status: LocalizedText;
  tags: string[];
  accent: "mint" | "amber";
};

export type PortfolioContent = {
  locale: Locale;
  alternateLocale: Locale;
  nav: { work: string; experience: string; contact: string; language: string };
  hero: { eyebrow: string; title: string; body: string; primaryCta: string; secondaryCta: string };
  sections: {
    selectedWork: string;
    selectedWorkIntro: string;
    expertise: string;
    experience: string;
    philosophy: string;
    openSource: string;
    contact: string;
    contactBody: string;
  };
  projects: PortfolioProject[];
  expertise: { title: string; body: string; tools: string[] }[];
  experience: { company: string; role: string; period: string; body: string }[];
  philosophy: { title: string; body: string }[];
  openSource: { title: string; body: string }[];
  footer: { availability: string; email: string; source: string };
};

const projects: PortfolioProject[] = [
  {
    slug: "orbit",
    eyebrow: { en: "Platform engineering / internal developer platform", pt: "Platform engineering / plataforma interna" },
    title: { en: "Orbit", pt: "Orbit" },
    summary: {
      en: "A delivery platform that takes services from commit to production through GitOps, with deployment, environments, releases, observability and access in one operating surface.",
      pt: "Uma plataforma de entrega que leva serviços do commit à produção por GitOps, reunindo deploy, ambientes, releases, observabilidade e acesso em uma superfície operacional.",
    },
    status: { en: "Built · private system", pt: "Construído · sistema privado" },
    tags: ["GitOps", "Argo CD", "Kubernetes", "CI/CD"],
    accent: "mint",
  },
  {
    slug: "studio-stormz",
    eyebrow: { en: "AI media infrastructure / video streaming", pt: "Infraestrutura de mídia com IA / streaming de vídeo" },
    title: { en: "Studio / Stormz", pt: "Studio / Stormz" },
    summary: {
      en: "A media platform in development: multimodal creation in Studio and a streaming/VOD direction in Stormz, shaped around asynchronous work, media storage and playback.",
      pt: "Uma plataforma de mídia em desenvolvimento: criação multimodal no Studio e uma direção de streaming/VOD no Stormz, estruturada em torno de trabalho assíncrono, armazenamento e reprodução.",
    },
    status: { en: "In development · scope marked", pt: "Em desenvolvimento · escopo marcado" },
    tags: ["Media systems", "Async jobs", "R2", "FFmpeg planned"],
    accent: "amber",
  },
];

const expertise = [
  { title: "Streaming & media", body: "Video systems from ingest to playback: real-time transport, adaptive delivery, media processing, and the edge conditions between them.", tools: ["WebRTC", "HLS / LL-HLS", "ABR", "FFmpeg", "LiveKit", "R2 / CDN"] },
  { title: "Distributed systems", body: "Backend design for work that crosses processes, time, and failure boundaries — with explicit state, events, idempotency, and recovery paths.", tools: ["NestJS", "Node.js", "Go", "Kafka", "Redis", "PostgreSQL"] },
  { title: "Platform engineering", body: "Delivery paths that make infrastructure legible: declarative environments, repeatable releases, observability, access control, and useful developer experience.", tools: ["Kubernetes", "K3s / RKE2", "Docker", "GitOps", "Argo CD", "Terraform"] },
  { title: "Product engineering", body: "When the product needs it, I carry the system through the interface and the device — without losing sight of the operational model underneath.", tools: ["Next.js", "React", "TypeScript", "React Native", "Expo", "Kotlin"] },
];

const philosophy = [
  { title: "Make the boundary visible", body: "Most production problems live between components. I model the handoff, the failure mode, and the recovery path before polishing the happy path." },
  { title: "Trade-offs are part of the design", body: "Latency, cost, operability, and correctness pull in different directions. A strong architecture makes that tension explicit and chooses deliberately." },
  { title: "Own the loop", body: "Design is not finished at merge. I care about delivery, observability, incident feedback, and the next change being safer than the last." },
];

const openSource = [
  { title: "Technical writing and system notes", body: "I document architecture, operational boundaries, and evidence so a system can be reviewed by someone who did not build it." },
  { title: "Small, testable building blocks", body: "Reusable adapters, domain policies, queue contracts, and UI primitives are more valuable to me than a showcase of disconnected demos." },
];

const portugueseExpertise = ["Streaming & mídia", "Sistemas distribuídos", "Platform engineering", "Product engineering"];
const portuguesePhilosophy = [
  { title: "Tornar a fronteira visível", body: "A maioria dos problemas de produção mora entre componentes. Modelo a passagem, a falha e a recuperação antes de polir o caminho feliz." },
  { title: "Trade-offs fazem parte do design", body: "Latência, custo, operação e correção puxam em direções diferentes. Uma boa arquitetura explicita essa tensão e escolhe conscientemente." },
  { title: "Assumir o ciclo completo", body: "O design não termina no merge. Importam entrega, observabilidade, feedback de incidentes e tornar a próxima mudança mais segura." },
];
const portugueseOpenSource = [
  { title: "Escrita técnica e notas de sistema", body: "Documento arquitetura, limites operacionais e evidências para que um sistema possa ser revisado por quem não o construiu." },
  { title: "Blocos pequenos e testáveis", body: "Adaptadores reutilizáveis, políticas de domínio, contratos de fila e primitivos de UI valem mais do que uma vitrine de demos desconectadas." },
];

const content: Record<Locale, PortfolioContent> = {
  en: {
    locale: "en",
    alternateLocale: "pt",
    nav: { work: "Work", experience: "Experience", contact: "Contact", language: "PT" },
    hero: { eyebrow: "Afonso Kevin Burginski / Senior Software Engineer", title: "Engineering complex systems, from architecture to production.", body: "I specialize in video streaming, distributed systems, and platform engineering. I design, build, and operate media platforms and infrastructure with end-to-end ownership.", primaryCta: "Explore my work", secondaryCta: "Get in touch" },
    sections: { selectedWork: "Selected engineering work", selectedWorkIntro: "The interesting part is rarely the framework. It is the set of constraints, decisions, and operational feedback that make a system dependable.", expertise: "Engineering expertise", experience: "Professional experience", philosophy: "Engineering philosophy", openSource: "Open source & technical work", contact: "Open to the right problem", contactBody: "I am open to international roles where streaming, distributed systems, or platform reliability are central to the product." },
    projects,
    expertise,
    experience: [{ company: "Atman Systems", role: "Senior Software Engineer", period: "Experience", body: "Technical work across an urban video-monitoring platform: real-time video, backend services, event-driven processing, edge-device integration, infrastructure, and mobile surfaces. Details are intentionally kept at a non-sensitive level." }],
    philosophy,
    openSource,
    footer: { availability: "Based in Brazil · open to international opportunities", email: "afonsoburginski@gmail.com", source: "GitHub" },
  },
  pt: {
    locale: "pt",
    alternateLocale: "en",
    nav: { work: "Projetos", experience: "Experiência", contact: "Contato", language: "EN" },
    hero: { eyebrow: "Afonso Kevin Burginski / Senior Software Engineer", title: "Engenharia de sistemas complexos, da arquitetura à produção.", body: "Minha especialidade é video streaming, sistemas distribuídos e platform engineering. Projeto, construo e opero plataformas de mídia e infraestrutura com ownership ponta a ponta.", primaryCta: "Ver projetos", secondaryCta: "Entrar em contato" },
    sections: { selectedWork: "Projetos de engenharia", selectedWorkIntro: "A parte interessante raramente é o framework. São as restrições, decisões e sinais de operação que tornam um sistema confiável.", expertise: "Áreas de engenharia", experience: "Experiência profissional", philosophy: "Filosofia de engenharia", openSource: "Open source & trabalho técnico", contact: "Aberto ao problema certo", contactBody: "Estou aberto a oportunidades internacionais em que streaming, sistemas distribuídos ou confiabilidade de plataformas sejam centrais ao produto." },
    projects,
    expertise: expertise.map((item, index) => ({ ...item, title: portugueseExpertise[index] })),
    experience: [{ company: "Atman Systems", role: "Senior Software Engineer", period: "Experiência", body: "Trabalho técnico em uma plataforma urbana de videomonitoramento: vídeo em tempo real, serviços de backend, processamento orientado a eventos, integração com dispositivos de borda, infraestrutura e superfícies mobile. Os detalhes permanecem em nível não sensível." }],
    philosophy: portuguesePhilosophy,
    openSource: portugueseOpenSource,
    footer: { availability: "Baseado no Brasil · aberto a oportunidades internacionais", email: "afonsoburginski@gmail.com", source: "GitHub" },
  },
};

export function getPortfolioContent(locale: string): PortfolioContent {
  return content[locale === "pt" ? "pt" : "en"];
}

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "pt";
}
