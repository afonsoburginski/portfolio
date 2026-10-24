BEGIN;

DO $media_projects_seed$
DECLARE
  next_order integer;
BEGIN
  SELECT COALESCE(MAX(sort_order), 0) + 10 INTO next_order
  FROM projects
  WHERE slug NOT IN ('studio', 'stormz');

  INSERT INTO projects (
    id, slug, title, description, long_description, category, status, image, link, github, tags, tech_stack, features_web, features_desktop, requirements, featured, sort_order, subtitle, role, timeline, stack, live_url, github_url, story, image2, revenue_note, extra_images, objectives, highlights, outcomes, challenges, sections, updated_at
  ) VALUES (
    md5(random()::text || clock_timestamp()::text),
    'studio',
    'Studio',
    'Studio is an in-development workspace for planning and creating image, video, voice, and sound within one project.',
    'Studio is in development. Its public pre-launch preview presents a scene-based workspace for image, video, voice, and sound. The code separates the creator interface, provider integrations, asynchronous generation jobs, and asset handling. This case study describes the implemented architecture and public preview; it does not claim production readiness or measured results.',
    'full_system',
    'development',
    'https://cdn.afonsodev.com/projects/studio-ee6931e2.webp',
    '/case-study/studio',
    NULL,
    '["Media creation","Asynchronous generation","Asset workflows"]',
    '["React","TypeScript","Bun","Hono","PostgreSQL","Redis","BullMQ","Cloudflare R2","Docker"]',
    '["Public pre-launch preview","Model catalog","Scene-based workspace"]',
    '[]',
    NULL,
    TRUE,
    next_order,
    'A media creation workspace in development',
    'Creator and engineer',
    'In development',
    'React, TypeScript, Bun, Hono, PostgreSQL, Redis, BullMQ, Cloudflare R2, Docker',
    'https://app.afonsodev.com',
    NULL,
    'Studio is in development. Its public pre-launch preview presents a scene-based workspace for image, video, voice, and sound. The code separates the creator interface, provider integrations, asynchronous generation jobs, and asset handling. This case study describes the implemented architecture and public preview; it does not claim production readiness or measured results.',
    NULL,
    NULL,
    '[]',
    '["Bring scene planning and media creation into one project workspace.","Make model capabilities and prices visible before a generation starts.","Track long-running provider work through persisted jobs and explicit asset states."]',
    '["A public pre-launch landing page, model catalog, and example workflow are available.","The server uses BullMQ workers for generation submission and polling, with generation state stored in PostgreSQL.","Media is stored in Cloudflare R2; asset inspection can derive thumbnails and audio waveforms."]',
    '["Published a public pre-launch preview and model catalog.","Implementation and validation continue; production outcomes are not claimed."]',
    '[{"title":"Coordinating slow provider work","detail":"The generation flow records state in PostgreSQL and uses BullMQ submission and polling workers so requests do not depend on a single synchronous response."},{"title":"Keeping assets explicit","detail":"Upload intents, stored assets, inspection, and derived previews are handled as distinct steps around R2 storage."}]',
    '[{"title":"Public product preview","body":["The public site introduces a scene-based workspace and a model catalog covering image, video, voice, sound, music, and transcription. The showcase is an example workflow, not a customer result.","Studio is labeled pre-launch and remains in development."]},{"title":"Generation architecture","body":["The React client connects to a Hono server. Provider adapters submit generation requests while BullMQ workers handle submission and polling. PostgreSQL stores generation state and job identifiers.","The implementation includes provider integrations, but this case study does not imply that every advertised workflow has been validated in production."]},{"title":"Media pipeline","body":["Cloudflare R2 stores media bytes. The server tracks asset state and handles upload confirmation, inspection, and derived thumbnails or waveforms.","The current processing path focuses on asset inspection and previews while the product continues to develop."]}]',
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
