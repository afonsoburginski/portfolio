import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

export const orbitProject = {
  id: crypto.randomUUID(),
  slug: "orbit",
  title: "Orbit",
  description: "I created Orbit, a GitOps delivery platform that connects CI, releases, infrastructure management, and the environments where services run.",
  long_description: "I created Orbit, a CI/CD platform for organizing application delivery and infrastructure management. It connects development to the environment where services will run, using a GitOps repository as the source of truth. This case study explains the architecture, the runtime differences the platform handles, and the limits that still need to evolve.",
  category: "full_system",
  status: "production",
  image: null,
  link: "/case-study/orbit",
  github: null,
  tags: JSON.stringify(["CI/CD", "GitOps", "Infrastructure", "Kubernetes", "Docker Compose"]),
  tech_stack: JSON.stringify(["Node.js", "React", "Vite", "TypeScript", "Docker", "Kubernetes", "Argo CD", "GitHub Actions", "Docker Hub"]),
  features_web: JSON.stringify(["Deployments", "Releases", "Environments", "Observability", "Access control"]),
  features_desktop: "[]",
  requirements: null,
  featured: true,
  subtitle: "A GitOps delivery platform for Kubernetes and Docker Compose",
  role: "Creator and developer",
  timeline: "Ongoing",
  stack: "Node.js, React, Vite, TypeScript, Docker, Kubernetes, Argo CD, GitHub Actions, Docker Hub, and GitOps",
  live_url: null,
  github_url: null,
  story: "Orbit is designed around a simple boundary: development produces releases, while the GitOps repository describes what should run. The platform turns deployment and infrastructure actions into Git commits, then relies on Argo CD to apply the desired state to Kubernetes. It also includes a Docker Compose path for smaller or single-server environments.",
  image2: null,
  revenue_note: null,
  extra_images: "[]",
  objectives: JSON.stringify([
    "Connect CI builds and container releases to the environments where services run.",
    "Use a GitOps repository as the source of truth for deployments, rollbacks, and environment configuration.",
    "Give operators one place to manage releases, services, environments, servers, observability, access, and infrastructure.",
    "Detect runtime components and external dependencies from infrastructure data instead of fixed service names.",
  ]),
  highlights: JSON.stringify([
    "GitHub Actions builds are checked against Docker Hub images before Orbit records a release.",
    "Deploys, rollbacks, automatic CD, and environment changes are represented as commits in GitOps.",
    "Kubernetes environments are applied through Argo CD, with support for kind, k3s, and RKE2-based setups.",
    "Docker Compose environments can be deployed over SSH and observed through Docker's own inspection, stats, events, and logs.",
    "Services, infrastructure, edge components, external services, queues, and metric sources are shown only when the platform can detect them.",
  ]),
  outcomes: JSON.stringify([
    "A single operational surface connects CI, releases, environments, deployment, rollback, and observability.",
    "The same product model covers Kubernetes and Docker Compose while keeping their data sources explicit.",
    "The platform can manage GitOps state without requiring Prometheus, Loki, or Grafana in the hub.",
  ]),
  challenges: JSON.stringify([
    { title: "Keeping GitOps as the source of truth", detail: "Every deployment, rollback, automatic-CD change, and environment action becomes a commit. Argo CD then applies the committed state to Kubernetes." },
    { title: "Handling different runtimes", detail: "Kubernetes is read through its APIs and Argo CD, while Docker Compose is handled over SSH with Docker commands and a deploy hook. The UI keeps the common operational model but exposes runtime-specific data where necessary." },
    { title: "Detecting what is actually present", detail: "Components are identified from images, ports, labels or annotations, metrics, and declared environment data. When a source is unavailable, the platform omits that panel or explains why it cannot be read." },
    { title: "Protecting operational data", detail: "Secrets stay outside Git and are not sent to the interface. Environment views expose names and safe metadata while keeping secret values in the cluster or server state." },
  ]),
  sections: JSON.stringify([
    { title: "Architecture", body: [
      "The delivery path starts with GitHub Actions and a container image in Docker Hub. Orbit checks successful CI builds, registers releases, and writes the desired service version to the GitOps repository.",
      "Argo CD watches that repository and applies the result to the target Kubernetes environment. The repository also holds environment destinations, namespaces, domains, templates, services, infrastructure values, and application versions.",
    ], subsections: ["CI to release", "GitOps to runtime"] },
    { title: "What Orbit detects and manages", body: [
      "The platform manages releases, deploy and rollback actions, automatic CD, environment configuration, templates, servers and clusters, access, notifications, and observability. It reads Kubernetes resources, Argo CD state, GitHub Actions, Docker Hub, GitOps files, and Docker data for Compose environments.",
      "The service canvas can connect services to infrastructure, edge components, external providers, other environments, and BullMQ queues. These relationships come from manifests, environment keys, labels, annotations, network and port data, configured links, or metric sources rather than hard-coded service names.",
      "Observability is source-driven: Kubernetes pods, events, logs, resource metrics, service metrics, traffic exporters, messaging exporters, and Docker inspection are read directly. Sections appear only when the corresponding source exists.",
    ], subsections: ["Runtime data", "Dependencies and topology", "Observability"] },
    { title: "Runtime support", body: [
      "The Kubernetes path supports kind and k3s in the hub, plus RKE2 and k3s clusters connected through the platform. The repository also includes a Docker Compose template and a Compose deploy hook for environments on a single server, where Orbit updates versions and runs docker compose over SSH.",
      "The two paths share concepts such as services, versions, health, logs, and deployment state, but the underlying sources remain different: Kubernetes APIs and Argo CD on one side, Docker commands and Compose logs on the other.",
    ], subsections: ["Kubernetes", "Docker Compose"] },
    { title: "Limits and what needs to evolve", body: [
      "The current implementation is source-dependent. Prometheus, Loki, and Grafana are not required or included in the hub, so traffic, messaging, and application metrics appear only when compatible exporters or service endpoints are available. Service /metrics collection is currently supported for Kubernetes environments with the required domain and configuration, not for Docker Compose.",
      "The implementation documents Kubernetes and Docker Compose, not Docker Swarm. Swarm support is therefore not part of this case study's current claim and would require a separate runtime integration.",
      "The remaining evolution is to broaden runtime coverage and make the limits of each data source even clearer while preserving the GitOps boundary and the rule that the interface shows only what can be detected.",
    ], subsections: ["Source-dependent observability", "Runtime boundary", "Next evolution"] },
  ]),
};

function nextSortOrder(sql) {
  return sql`(SELECT COALESCE(MAX(sort_order), 0) + 10 FROM projects WHERE slug <> ${orbitProject.slug})`;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  const { default: postgres } = await import("postgres");
  const sql = postgres(databaseUrl);
  try {
    const now = new Date().toISOString();
    await sql.begin(async (tx) => {
      await tx`
        INSERT INTO projects (
          id, slug, title, description, long_description, category, status, image, link, github,
          tags, tech_stack, features_web, features_desktop, requirements, featured, sort_order,
          subtitle, role, timeline, stack, live_url, github_url, story, image2, revenue_note,
          extra_images, objectives, highlights, outcomes, challenges, sections, updated_at
        ) VALUES (
          ${orbitProject.id}, ${orbitProject.slug}, ${orbitProject.title}, ${orbitProject.description},
          ${orbitProject.long_description}, ${orbitProject.category}, ${orbitProject.status}, ${orbitProject.image},
          ${orbitProject.link}, ${orbitProject.github}, ${orbitProject.tags}, ${orbitProject.tech_stack},
          ${orbitProject.features_web}, ${orbitProject.features_desktop}, ${orbitProject.requirements},
          ${orbitProject.featured}, ${nextSortOrder(tx)}, ${orbitProject.subtitle}, ${orbitProject.role},
          ${orbitProject.timeline}, ${orbitProject.stack}, ${orbitProject.live_url}, ${orbitProject.github_url},
          ${orbitProject.story}, ${orbitProject.image2}, ${orbitProject.revenue_note}, ${orbitProject.extra_images},
          ${orbitProject.objectives}, ${orbitProject.highlights}, ${orbitProject.outcomes}, ${orbitProject.challenges},
          ${orbitProject.sections}, ${now}
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title, description = EXCLUDED.description, long_description = EXCLUDED.long_description,
          category = EXCLUDED.category, status = EXCLUDED.status, image = EXCLUDED.image, link = EXCLUDED.link,
          github = EXCLUDED.github, tags = EXCLUDED.tags, tech_stack = EXCLUDED.tech_stack,
          features_web = EXCLUDED.features_web, features_desktop = EXCLUDED.features_desktop,
          requirements = EXCLUDED.requirements, featured = EXCLUDED.featured, sort_order = EXCLUDED.sort_order,
          subtitle = EXCLUDED.subtitle, role = EXCLUDED.role, timeline = EXCLUDED.timeline, stack = EXCLUDED.stack,
          live_url = EXCLUDED.live_url, github_url = EXCLUDED.github_url, story = EXCLUDED.story,
          image2 = EXCLUDED.image2, revenue_note = EXCLUDED.revenue_note, extra_images = EXCLUDED.extra_images,
          objectives = EXCLUDED.objectives, highlights = EXCLUDED.highlights, outcomes = EXCLUDED.outcomes,
          challenges = EXCLUDED.challenges, sections = EXCLUDED.sections, updated_at = EXCLUDED.updated_at
      `;
    });
  } finally {
    await sql.end();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
