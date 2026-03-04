import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/schema";
import { and, eq, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.user_id, session.user.id), eq(notifications.read, false)));

  return NextResponse.json({ count: row?.count ?? 0 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestId } = await req.json().catch(() => ({}));

  if (requestId) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.user_id, session.user.id),
          eq(notifications.request_id, requestId),
          eq(notifications.read, false)
        )
      );
  } else {
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.user_id, session.user.id), eq(notifications.read, false)));
  }

  return NextResponse.json({ ok: true });
}
