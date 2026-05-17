-- Adds rich case-study fields to the projects table so each project IS
-- its own case study (single source of truth).

ALTER TABLE "projects" ADD COLUMN "subtitle" TEXT;
ALTER TABLE "projects" ADD COLUMN "role" TEXT;
ALTER TABLE "projects" ADD COLUMN "timeline" TEXT;
ALTER TABLE "projects" ADD COLUMN "stack" TEXT;
ALTER TABLE "projects" ADD COLUMN "live_url" TEXT;
ALTER TABLE "projects" ADD COLUMN "github_url" TEXT;
ALTER TABLE "projects" ADD COLUMN "story" TEXT;
ALTER TABLE "projects" ADD COLUMN "image2" TEXT;
ALTER TABLE "projects" ADD COLUMN "revenue_note" TEXT;
ALTER TABLE "projects" ADD COLUMN "extra_images" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "projects" ADD COLUMN "objectives" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "projects" ADD COLUMN "highlights" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "projects" ADD COLUMN "outcomes" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "projects" ADD COLUMN "challenges" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "projects" ADD COLUMN "sections" TEXT NOT NULL DEFAULT '[]';
