import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// Used by the Docker/Dokploy healthcheck and the CI deploy probe.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ status: "ok", db: true });
  } catch (err) {
    console.error("[health] db check failed:", err);
    return Response.json({ status: "degraded", db: false }, { status: 503 });
  }
}
