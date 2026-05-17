-- Seeds the 6 projects currently hardcoded in components/projects-section.
-- Idempotent: uses INSERT OR IGNORE keyed by slug.

INSERT OR IGNORE INTO "projects" (
  "id", "slug", "title", "description", "category", "status",
  "image", "link", "featured", "sort_order"
) VALUES
  (
    'home-orcanorte',
    'orcanorte',
    'Orcanorte',
    'B2B marketplace for the construction industry with real-time quotes.',
    'web',
    'production',
    'https://cdn.afonsodev.com/projects/orcanorte-1.png',
    '/case-study/orcanorte',
    1,
    10
  ),
  (
    'home-stormzplus-mobile',
    'stormzplus-mobile',
    'Stormz+ Mobile',
    'Mobile app for the Stormz+ streaming platform.',
    'mobile',
    'production',
    'https://y3s2nvfmhyxopshw.public.blob.vercel-storage.com/projects/stormzplus-app.png',
    '/case-study/stormzplus-mobile',
    1,
    20
  ),
  (
    'home-gem-jhonrob',
    'gem-jhonrob',
    'GEM JHONROB',
    'Jewelry shop showcase and catalog.',
    'web',
    'production',
    'https://y3s2nvfmhyxopshw.public.blob.vercel-storage.com/projects/gem-jhonrob-1.png',
    '/case-study/gem-jhonrob',
    1,
    30
  ),
  (
    'home-easydriver',
    'easydriver',
    'EasyDriver',
    'Driver management platform with admin and mobile clients.',
    'full_system',
    'production',
    'https://y3s2nvfmhyxopshw.public.blob.vercel-storage.com/projects/easydriver-admin.png',
    '/case-study/easydriver',
    1,
    40
  ),
  (
    'home-stormzplus',
    'stormzplus',
    'Stormz+ Web',
    'Stormz+ streaming web platform.',
    'web',
    'production',
    'https://y3s2nvfmhyxopshw.public.blob.vercel-storage.com/projects/stormzplus.png',
    '/case-study/stormzplus',
    1,
    50
  ),
  (
    'home-nextjs-ffmpeg-transcoder',
    'nextjs-ffmpeg-transcoder',
    'FFmpeg Transcoder',
    'Server-side media transcoder built with Next.js and FFmpeg.',
    'web',
    'production',
    'https://y3s2nvfmhyxopshw.public.blob.vercel-storage.com/projects/nextjs-ffmpeg-transcoder-1.png',
    '/case-study/nextjs-ffmpeg-transcoder',
    1,
    60
  );
