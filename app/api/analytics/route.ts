import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { analytics_daily_counts, linkedin_tokens } from "@/lib/schema";
import { getOwnerState } from "@/lib/owner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const numberValue = (value: unknown) => Number(value ?? 0);

export async function GET(request: NextRequest) {
  const owner = await getOwnerState(request.headers);
  if (owner.state !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: owner.state === "none" ? 401 : 403, headers: { "Cache-Control": "no-store" } });
  }

  const today = new Date().toISOString().slice(0, 10);
  const since = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const trendSince = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [summaryRows, todayRows, trendRows, pageRows, referrerRows, countryRows, deviceRows, linkedinRows] = await Promise.all([
    db.select({
      views: sql<number>`coalesce(sum(${analytics_daily_counts.views}), 0)`,
      articleViews: sql<number>`coalesce(sum(case when ${analytics_daily_counts.value} like '/articles/%' then ${analytics_daily_counts.views} else 0 end), 0)`,
      pages: sql<number>`count(distinct ${analytics_daily_counts.value})`,
    }).from(analytics_daily_counts).where(and(gte(analytics_daily_counts.day, since), eq(analytics_daily_counts.dimension, "page"))),
    db.select({ views: sql<number>`coalesce(sum(${analytics_daily_counts.views}), 0)` })
      .from(analytics_daily_counts).where(and(eq(analytics_daily_counts.day, today), eq(analytics_daily_counts.dimension, "page"))),
    db.select({ day: analytics_daily_counts.day, views: sql<number>`sum(${analytics_daily_counts.views})` })
      .from(analytics_daily_counts).where(and(gte(analytics_daily_counts.day, trendSince), eq(analytics_daily_counts.dimension, "page")))
      .groupBy(analytics_daily_counts.day).orderBy(analytics_daily_counts.day),
    db.select({ path: analytics_daily_counts.value, views: sql<number>`sum(${analytics_daily_counts.views})` })
      .from(analytics_daily_counts).where(and(gte(analytics_daily_counts.day, since), eq(analytics_daily_counts.dimension, "page")))
      .groupBy(analytics_daily_counts.value).orderBy(desc(sql`sum(${analytics_daily_counts.views})`)).limit(8),
    db.select({ domain: analytics_daily_counts.value, views: sql<number>`sum(${analytics_daily_counts.views})` })
      .from(analytics_daily_counts).where(and(gte(analytics_daily_counts.day, since), eq(analytics_daily_counts.dimension, "referrer")))
      .groupBy(analytics_daily_counts.value).orderBy(desc(sql`sum(${analytics_daily_counts.views})`)).limit(8),
    db.select({ country: analytics_daily_counts.value, views: sql<number>`sum(${analytics_daily_counts.views})` })
      .from(analytics_daily_counts).where(and(gte(analytics_daily_counts.day, since), eq(analytics_daily_counts.dimension, "country"), sql`${analytics_daily_counts.value} <> 'unknown'`))
      .groupBy(analytics_daily_counts.value).orderBy(desc(sql`sum(${analytics_daily_counts.views})`)).limit(8),
    db.select({ device: analytics_daily_counts.value, views: sql<number>`sum(${analytics_daily_counts.views})` })
      .from(analytics_daily_counts).where(and(gte(analytics_daily_counts.day, since), eq(analytics_daily_counts.dimension, "device")))
      .groupBy(analytics_daily_counts.value).orderBy(desc(sql`sum(${analytics_daily_counts.views})`)),
    db.select({ scopes: linkedin_tokens.scopes }).from(linkedin_tokens).orderBy(desc(linkedin_tokens.updated_at)).limit(1),
  ]);

  const linkedInAnalyticsAvailable = (linkedinRows[0]?.scopes ?? "").split(/[ ,]+/).includes("r_member_postAnalytics");
  const totals = summaryRows[0];

  return NextResponse.json({
    range: { since, today },
    summary: {
      views30d: numberValue(totals?.views),
      articleViews30d: numberValue(totals?.articleViews),
      pages30d: numberValue(totals?.pages),
      viewsToday: numberValue(todayRows[0]?.views),
    },
    daily: trendRows.map((row) => ({ day: row.day, views: numberValue(row.views) })),
    pages: pageRows.map((row) => ({ path: row.path, views: numberValue(row.views) })),
    referrers: referrerRows.map((row) => ({ domain: row.domain, views: numberValue(row.views) })),
    countries: countryRows.map((row) => ({ country: row.country, views: numberValue(row.views) })),
    devices: deviceRows.map((row) => ({ device: row.device, views: numberValue(row.views) })),
    linkedin: {
      connected: Boolean(linkedinRows[0]),
      analyticsAvailable: linkedInAnalyticsAvailable,
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
