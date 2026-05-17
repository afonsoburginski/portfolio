-- Rewrites any remaining Vercel Blob URLs to the Cloudflare R2 CDN
-- after the asset migration. Safe to run multiple times.

UPDATE "projects"
SET "image" = REPLACE("image",
  'https://y3s2nvfmhyxopshw.public.blob.vercel-storage.com',
  'https://cdn.afonsodev.com')
WHERE INSTR("image", 'y3s2nvfmhyxopshw') > 0;
