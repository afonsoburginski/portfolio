import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { analytics_daily_counts } from "@/lib/schema";
import { getArticle } from "@/lib/articles";
import { getProjectBySlug } from "@/lib/dashboard-data";

export const runtime = "nodejs";

const SITE_HOSTS = new Set(["afonsodev.com", "www.afonsodev.com"]);
const SAFE_REFERRER = /^[a-z0-9.-]{1,253}$/i;
const REFERRER_GROUPS = ["linkedin.com", "lnkd.in", "google.com", "bing.com", "github.com", "x.com", "twitter.com", "facebook.com", "instagram.com", "reddit.com", "medium.com", "dev.to"];

function referrerGroup(referrer: string) {
  if (referrer === "direct" || referrer === "internal") return referrer;
  if (/(^|\.)google\.[a-z.]+$/.test(referrer)) return "google";
  return REFERRER_GROUPS.find((domain) => referrer === domain || referrer.endsWith(`.${domain}`)) ?? "other";
}

function deviceClass(userAgent: string) {
  if (/bot|crawler|spider|slurp|headless|preview|facebookexternalhit|linkedinbot/i.test(userAgent)) return "bot";
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|ipod|android/i.test(userAgent)) return "mobile";
  if (userAgent) return "desktop";
  return "unknown";
}

function isTrustedRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    return parsed.protocol === "https:" && !parsed.port && SITE_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isTrustedRequest(request)) return new NextResponse(null, { status: 204 });
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 512) return new NextResponse(null, { status: 204 });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return new NextResponse(null, { status: 204 });

  const rawBody = await request.text();
  if (rawBody.length > 512) return new NextResponse(null, { status: 204 });
  let body: { path?: unknown; referrer?: unknown } | null;
  try {
    body = JSON.parse(rawBody) as { path?: unknown; referrer?: unknown };
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  if (!body || typeof body.path !== "string" || body.path.length > 200) return new NextResponse(null, { status: 204 });

  let path: string;
  try {
    const parsed = new URL(body.path, request.nextUrl.origin);
    if (parsed.origin !== request.nextUrl.origin || parsed.search || parsed.hash || !parsed.pathname.startsWith("/")) {
      return new NextResponse(null, { status: 204 });
    }
    path = parsed.pathname.length > 1 ? parsed.pathname.replace(/\/+$/, "") : parsed.pathname;
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  if (!path || path.startsWith("/dashboard") || path.startsWith("/api/") || path.startsWith("/oauth/") || path.startsWith("/_next/")) {
    return new NextResponse(null, { status: 204 });
  }
  if (!/^\/$|^\/articles\/[a-z0-9-]+$|^\/case-study\/[a-z0-9-]+$/i.test(path)) {
    return new NextResponse(null, { status: 204 });
  }
  const device = deviceClass(request.headers.get("user-agent") ?? "");
  if (device === "bot") return new NextResponse(null, { status: 204 });

  const countryHeader = (request.headers.get("cf-ipcountry") ?? "").toUpperCase();
  const country = /^[A-Z]{2}$/.test(countryHeader) && !["XX", "T1"].includes(countryHeader)
    ? countryHeader
    : "unknown";
  const rawReferrer = typeof body.referrer === "string" ? body.referrer.toLowerCase().replace(/^www\./, "") : "direct";
  const referrer = referrerGroup(SAFE_REFERRER.test(rawReferrer) ? rawReferrer : "direct");

  try {
    if (path.startsWith("/articles/") && !(await getArticle(path.slice("/articles/".length)))) return new NextResponse(null, { status: 204 });
    if (path.startsWith("/case-study/") && !(await getProjectBySlug(path.slice("/case-study/".length)))) return new NextResponse(null, { status: 204 });

    const day = new Date().toISOString().slice(0, 10);
    const dimensions = [
      { dimension: "page" as const, value: path },
      { dimension: "referrer" as const, value: referrer },
      { dimension: "country" as const, value: country },
      { dimension: "device" as const, value: device },
    ];
    await db.insert(analytics_daily_counts).values(dimensions.map((item) => ({ day, ...item, views: 1 }))).onConflictDoUpdate({
      target: [analytics_daily_counts.day, analytics_daily_counts.dimension, analytics_daily_counts.value],
      set: { views: sql`${analytics_daily_counts.views} + 1`, updated_at: new Date() },
    });
  } catch {
    // Analytics must never interrupt a public page view.
  }

  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
