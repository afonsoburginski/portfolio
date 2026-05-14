CREATE TABLE IF NOT EXISTS "request_attachments" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "request_id" TEXT NOT NULL REFERENCES "requests"("id") ON DELETE CASCADE,
  "url" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "mime_type" TEXT,
  "size" INTEGER,
  "kind" TEXT NOT NULL DEFAULT 'file',
  "position" REAL NOT NULL DEFAULT 0,
  "created_at" TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO "request_attachments" (
  "id",
  "request_id",
  "url",
  "name",
  "mime_type",
  "size",
  "kind",
  "position",
  "created_at"
)
SELECT
  lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))),
  "id",
  "image_url",
  'anexo importado',
  NULL,
  NULL,
  CASE
    WHEN lower("image_url") GLOB '*.png'
      OR lower("image_url") GLOB '*.jpg'
      OR lower("image_url") GLOB '*.jpeg'
      OR lower("image_url") GLOB '*.webp'
      OR lower("image_url") GLOB '*.gif'
      OR lower("image_url") GLOB '*.avif'
      OR lower("image_url") GLOB '*.svg'
    THEN 'image'
    ELSE 'file'
  END,
  0,
  "created_at"
FROM "requests"
WHERE "image_url" IS NOT NULL
  AND "image_url" != ''
  AND NOT EXISTS (
    SELECT 1
    FROM "request_attachments"
    WHERE "request_attachments"."request_id" = "requests"."id"
      AND "request_attachments"."url" = "requests"."image_url"
  );
