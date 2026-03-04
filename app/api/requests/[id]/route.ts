import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requests, request_comments, user } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { isAdminEmail } from "@/lib/admin-helpers";

async function getSession(req: NextRequest) {
  return auth.api.getSession({ headers: req.headers });
}

function userIsAdmin(u: { email?: string | null; isAdmin?: boolean } | null) {
  if (!u) return false;
  return u.isAdmin === true || isAdminEmail(u.email);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({ request: requests, user })
    .from(requests)
    .leftJoin(user, eq(requests.user_id, user.id))
    .where(eq(requests.id, id));

  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = rows[0].request.user_id === session.user.id;
  const admin = userIsAdmin(session.user as { email?: string | null; isAdmin?: boolean });

  if (!isOwner && !admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const comments = await db
    .select({ comment: request_comments, user })
    .from(request_comments)
    .leftJoin(user, eq(request_comments.user_id, user.id))
    .where(eq(request_comments.request_id, id))
    .orderBy(request_comments.created_at);

  return NextResponse.json({
    ...rows[0].request,
    profiles: rows[0].user,
    request_comments: comments.map(c => ({ ...c.comment, profiles: c.user })),
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const admin = userIsAdmin(session.user as { email?: string | null; isAdmin?: boolean });
  const hasAdminSecret = body.admin_secret === process.env.DASHBOARD_ADMIN_SECRET;

  if (admin || hasAdminSecret) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { admin_secret: _s, ...updates } = body;
    const patch: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
    if (updates.status === "quoted") patch.quoted_at = new Date().toISOString();
    if (updates.status === "delivered") patch.delivered_at = new Date().toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [row] = await db.update(requests).set(patch as any).where(eq(requests.id, id)).returning();

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  }

  const [existing] = await db
    .select({ user_id: requests.user_id, status: requests.status })
    .from(requests)
    .where(eq(requests.id, id));

  if (!existing || existing.user_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (existing.status !== "quoted") {
    return NextResponse.json({ error: "Can only respond to quoted requests" }, { status: 400 });
  }

  if (!["approved", "rejected"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const clientPatch: Record<string, unknown> = {
    status: body.status,
    updated_at: new Date().toISOString(),
  };
  if (body.client_notes) clientPatch.client_notes = body.client_notes;
  if (body.status === "approved") clientPatch.approved_at = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [row] = await db.update(requests).set(clientPatch as any).where(and(eq(requests.id, id), eq(requests.user_id, session.user.id))).returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}
