BEGIN;

DO $media_projects_seed$
DECLARE
  next_order integer;
BEGIN
  SELECT COALESCE(MAX(sort_order), 0) + 10 INTO next_order
  FROM projects
  WHERE slug NOT IN ('studio', 'stormz');

  INSERT INTO projects (
    id, slug, title, description, long_description, category, status, image, link, github,
    tags, tech_stack, features_web, features_desktop, requirements, featured, sort_order,
    subtitle, role, timeline, stack, live_url, github_url, story, image2, revenue_note,
    extra_images, objectives, highlights, outcomes, challenges, sections, updated_at
  ) VALUES (
    md5(random()::text || clock_timestamp()::text), 'studio', 'Studio',
    'Studio is an in-development AI media infrastructure project for creating images and videos through integrations with model providers.',
    'Studio is being developed as an AI media infrastructure product. Its intended scope includes provider and model integrations, asynchronous orchestration, queues and events, media processing, and an operational path for assets. The project is in development and this seed does not claim a finished product or production outcomes.',
    'full_system', 'development', NULL, '/case-study/studio', NULL,
    '["AI media infrastructure","Asynchronous orchestration","Media processing"]',
    '["TypeScript","Node.js","FFmpeg","PostgreSQL","Docker","Cloudflare R2","CDN"]',
    '["Model integrations","Jobs and events","Media pipelines","Asset handling"]', '[]', NULL, TRUE, next_order,
    'AI media infrastructure for image and video creation', 'Creator and engineer', 'In development',
    'TypeScript, Node.js, FFmpeg, PostgreSQL, Docker, Cloudflare R2, and CDN integrations',
    NULL, NULL,
    'Studio is in development. The current direction explores how provider integrations, asynchronous jobs, event-driven coordination, and media processing can form a dependable creation workflow. Delivered scope, production readiness, and measurable outcomes remain to be confirmed as the project evolves.',
    NULL, NULL, '[]',
    $studio_json$["Coordinate image and video creation across model providers.","Represent long-running media work as observable asynchronous jobs.","Keep media processing and asset handling explicit as the product evolves."]$studio_json$,
    $studio_json$["Project status is in development.","Provider integrations and processing flows are part of the current direction, not a claim of completed production scope."]$studio_json$,
    '[]',
    $studio_json$[{"title":"Current status","detail":"Studio is in development. The portfolio should distinguish explored architecture and planned flows from features that have been delivered and validated."}]$studio_json$,
    $studio_json$[{"title":"Scope and orchestration","body":["The project explores integrations with AI image and video providers, asynchronous orchestration, queues or events, and media processing workflows.","Production scope, reliability characteristics, and measurable outcomes are not claimed here while development continues."],"subsections":["In development","Planned direction"]}]$studio_json$,
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

  INSERT INTO projects (
    id, slug, title, description, long_description, category, status, image, link, github,
    tags, tech_stack, features_web, features_desktop, requirements, featured, sort_order,
    subtitle, role, timeline, stack, live_url, github_url, story, image2, revenue_note,
    extra_images, objectives, highlights, outcomes, challenges, sections, updated_at
  ) VALUES (
    md5(random()::text || clock_timestamp()::text), 'stormz', 'Stormz',
    'Stormz is an in-development video streaming and VOD platform exploring a Netflix-style viewing experience.',
    'Stormz is being developed as a video streaming and VOD project. Its intended direction includes HLS and adaptive bitrate delivery, FFmpeg-based transcoding, object storage and CDN delivery, custom players, and full-cycle work across backend, frontend, mobile, and infrastructure. The project is in development and this seed does not claim a finished platform or production scale.',
    'full_system', 'development', NULL, '/case-study/stormz', NULL,
    '["Video streaming","VOD","Adaptive bitrate","Media infrastructure"]',
    '["HLS","ABR","FFmpeg","Cloudflare R2","CDN","TypeScript","React Native","Kubernetes"]',
    '["Video library","Transcoding pipeline","Custom playback","Delivery infrastructure"]', '[]', NULL, TRUE, next_order + 10,
    'Video streaming and VOD infrastructure in development', 'Creator and engineer', 'In development',
    'HLS, adaptive bitrate, FFmpeg, Cloudflare R2, CDN, TypeScript, React Native, and Kubernetes',
    NULL, NULL,
    'Stormz is in development. The project explores a full-cycle streaming and VOD architecture, from media processing and storage through delivery and playback. Implemented scope, reliability characteristics, and measurable outcomes remain to be confirmed as the project evolves.',
    NULL, NULL, '[]',
    $stormz_json$["Explore a dependable streaming and VOD delivery path.","Connect transcoding, storage, CDN delivery, and custom playback.","Keep backend, frontend, mobile, and infrastructure concerns visible across the product."]$stormz_json$,
    $stormz_json$["Project status is in development.","HLS, adaptive bitrate, FFmpeg, storage, CDN, and custom playback are the current direction, not a claim of completed production scope."]$stormz_json$,
    '[]',
    $stormz_json$[{"title":"Current status","detail":"Stormz is in development. The portfolio should distinguish explored architecture and planned flows from features that have been delivered and validated."}]$stormz_json$,
    $stormz_json$[{"title":"Streaming direction","body":["The project explores HLS and adaptive bitrate delivery, FFmpeg transcoding, object storage, CDN delivery, and custom players.","Backend, frontend, mobile, and infrastructure responsibilities are part of the intended full-cycle scope; production readiness and outcomes are not claimed yet."],"subsections":["In development","Planned direction"]}]$stormz_json$,
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
$media_projects_seed$;

COMMIT;
