CREATE TABLE IF NOT EXISTS "analytics_daily_counts" (
	"day" date NOT NULL,
	"dimension" text NOT NULL,
	"value" text NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "analytics_daily_counts_dimensions_idx" ON "analytics_daily_counts" USING btree ("day","dimension","value");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_daily_counts_day_idx" ON "analytics_daily_counts" USING btree ("day");
