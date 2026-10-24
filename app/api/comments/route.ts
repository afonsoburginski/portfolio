import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { request_comments, requests, user } from "@/lib/schema";
import { and, eq } from "drizzle-orm";

async function ownsRequest(requestId: string, userId: string) {
  const [request] = await db
    .select({ user_id: requests.user_id })
    .from(requests)
    .where(eq(requests.id, requestId));
  return request?.user_id === userId;
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestId = req.nextUrl.searchParams.get("requestId");
  if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });
  if (!(await ownsRequest(requestId, session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await db
    .select({ comment: request_comments, user })
    .from(request_comments)
    .leftJoin(user, eq(request_comments.user_id, user.id))
    .where(eq(request_comments.request_id, requestId))
    .orderBy(request_comments.created_at);

  return NextResponse.json(rows.map(r => ({ ...r.comment, profiles: r.user })));
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestId, content } = await req.json();
  if (!requestId || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (!(await ownsRequest(requestId, session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [row] = await db
    .insert(request_comments)
    .values({ request_id: requestId, user_id: session.user.id, content, is_admin: false })
    .returning();

  return NextResponse.json(row, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const [comment] = await db
    .select({ request_id: request_comments.request_id })
    .from(request_comments)
    .where(eq(request_comments.id, id));
  if (!comment || !(await ownsRequest(comment.request_id, session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(request_comments).where(and(eq(request_comments.id, id), eq(request_comments.user_id, session.user.id)));
  return NextResponse.json({ ok: true });
}
