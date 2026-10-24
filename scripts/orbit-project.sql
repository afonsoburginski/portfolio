BEGIN;

DO $orbit_seed$
DECLARE
  next_order integer;
BEGIN
  SELECT COALESCE(MAX(sort_order), 0) + 10 INTO next_order
  FROM projects
  WHERE slug <> 'orbit';

  INSERT INTO projects (
    id, slug, title, description, long_description, category, status, image, link, github,
    tags, tech_stack, features_web, features_desktop, requirements, featured, sort_order,
    subtitle, role, timeline, stack, live_url, github_url, story, image2, revenue_note,
    extra_images, objectives, highlights, outcomes, challenges, sections, updated_at
  ) VALUES (
    md5(random()::text || clock_timestamp()::text), 'orbit', 'Orbit',
    'Orbit is an internal developer platform for platform engineering: it connects CI, releases, infrastructure management, and the environments where services run.',
    'Orbit is a GitOps delivery platform for organizing application delivery and infrastructure management. It connects development to runtime environments through a GitOps repository as the source of truth, covering releases, deployments, rollbacks, runtime differences, and source-driven observability without overstating what the platform currently supports.',
    'full_system', 'production', NULL, '/case-study/orbit', NULL,
    '["CI/CD","GitOps","Infrastructure","Kubernetes","Docker Compose"]',
    '["Node.js","React","Vite","TypeScript","Docker","Kubernetes","Argo CD","GitHub Actions","Docker Hub"]',
    '["Deployments","Releases","Environments","Observability","Access control"]', '[]', NULL, TRUE, next_order,
    'An internal developer platform for Kubernetes and Docker Compose', 'Creator and engineer', 'Ongoing',
    'Node.js, React, Vite, TypeScript, Docker, Kubernetes, Argo CD, GitHub Actions, Docker Hub, and GitOps',
    NULL, NULL,
    'Orbit is designed around a clear platform-engineering boundary: development produces releases, while the GitOps repository describes what should run. The platform turns deployment and infrastructure actions into Git commits, then relies on Argo CD to apply the desired state to Kubernetes. It also includes a Docker Compose path for smaller or single-server environments.',
    NULL, NULL, '[]',
    $orbit_json$["Connect CI builds and container releases to the environments where services run.","Use a GitOps repository as the source of truth for deployments, rollbacks, and environment configuration.","Give operators one place to manage releases, services, environments, servers, observability, access, and infrastructure.","Detect runtime components and external dependencies from infrastructure data instead of fixed service names."]$orbit_json$,
    $orbit_json$["GitHub Actions builds are checked against Docker Hub images before Orbit records a release.","Deploys, rollbacks, automatic CD, and environment changes are represented as commits in GitOps.","Kubernetes environments are applied through Argo CD, with support for kind, k3s, and RKE2-based setups.","Docker Compose environments can be deployed over SSH and observed through Docker's own inspection, stats, events, and logs.","Services, infrastructure, edge components, external services, queues, and metric sources are shown only when the platform can detect them."]$orbit_json$,
    $orbit_json$["A single operational surface connects CI, releases, environments, deployment, rollback, and observability.","The same product model covers Kubernetes and Docker Compose while keeping their data sources explicit.","The platform can manage GitOps state without requiring Prometheus, Loki, or Grafana in the hub."]$orbit_json$,
    $orbit_json$[{"title":"Keeping GitOps as the source of truth","detail":"Every deployment, rollback, automatic-CD change, and environment action becomes a commit. Argo CD then applies the committed state to Kubernetes."},{"title":"Handling different runtimes","detail":"Kubernetes is read through its APIs and Argo CD, while Docker Compose is handled over SSH with Docker commands and a deploy hook. The UI keeps the common operational model but exposes runtime-specific data where necessary."},{"title":"Detecting what is actually present","detail":"Components are identified from images, ports, labels or annotations, metrics, and declared environment data. When a source is unavailable, the platform omits that panel or explains why it cannot be read."},{"title":"Protecting operational data","detail":"Secrets stay outside Git and are not sent to the interface. Environment views expose names and safe metadata while keeping secret values in the cluster or server state."}]$orbit_json$,
    $orbit_json$[{"title":"Architecture","body":["The delivery path starts with GitHub Actions and a container image in Docker Hub. Orbit checks successful CI builds, registers releases, and writes the desired service version to the GitOps repository.","Argo CD watches that repository and applies the result to the target Kubernetes environment. The repository also holds environment destinations, namespaces, domains, templates, services, infrastructure values, and application versions."],"subsections":["CI to release","GitOps to runtime"]},{"title":"What Orbit detects and manages","body":["The platform manages releases, deploy and rollback actions, automatic CD, environment configuration, templates, servers and clusters, access, notifications, and observability. It reads Kubernetes resources, Argo CD state, GitHub Actions, Docker Hub, GitOps files, and Docker data for Compose environments.","The service canvas can connect services to infrastructure, edge components, external providers, other environments, and BullMQ queues. These relationships come from manifests, environment keys, labels, annotations, network and port data, configured links, or metric sources rather than hard-coded service names.","Observability is source-driven: Kubernetes pods, events, logs, resource metrics, service metrics, traffic exporters, messaging exporters, and Docker inspection are read directly. Sections appear only when the corresponding source exists."],"subsections":["Runtime data","Dependencies and topology","Observability"]},{"title":"Runtime support","body":["The Kubernetes path supports kind and k3s in the hub, plus RKE2 and k3s clusters connected through the platform. The repository also includes a Docker Compose template and a Compose deploy hook for environments on a single server, where Orbit updates versions and runs docker compose over SSH.","The two paths share concepts such as services, versions, health, logs, and deployment state, but the underlying sources remain different: Kubernetes APIs and Argo CD on one side, Docker commands and Compose logs on the other."],"subsections":["Kubernetes","Docker Compose"]},{"title":"Limits and what needs to evolve","body":["The current implementation is source-dependent. Prometheus, Loki, and Grafana are not required or included in the hub, so traffic, messaging, and application metrics appear only when compatible exporters or service endpoints are available. Service /metrics collection is currently supported for Kubernetes environments with the required domain and configuration, not for Docker Compose.","The implementation documents Kubernetes and Docker Compose, not Docker Swarm. Swarm support is therefore not part of this case study's current claim and would require a separate runtime integration.","The remaining evolution is to broaden runtime coverage and make the limits of each data source even clearer while preserving the GitOps boundary and the rule that the interface shows only what can be detected."],"subsections":["Source-dependent observability","Runtime boundary","Next evolution"]}]$orbit_json$,
    to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
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
    challenges = EXCLUDED.challenges, sections = EXCLUDED.sections, updated_at = EXCLUDED.updated_at;
END
$orbit_seed$;

COMMIT;
