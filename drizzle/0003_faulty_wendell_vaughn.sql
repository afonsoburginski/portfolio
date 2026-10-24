CREATE TABLE "social_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"platform" text DEFAULT 'linkedin' NOT NULL,
	"kind" text NOT NULL,
	"urn" text,
	"url" text NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"image" text,
	"published_at" text NOT NULL,
	"created_at" text DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')) NOT NULL,
	"updated_at" text DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')) NOT NULL,
	CONSTRAINT "social_posts_urn_unique" UNIQUE("urn"),
	CONSTRAINT "social_posts_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE INDEX "social_posts_published_at_idx" ON "social_posts" USING btree ("published_at");