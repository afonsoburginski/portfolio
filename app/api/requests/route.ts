import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requests, user, type RequestType } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

async function getSession(req: NextRequest) {
  return auth.api.getSession({ headers: req.headers });
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, type, priority } = body;

  if (!title || !description || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [row] = await db
    .insert(requests)
    .values({
      user_id: session.user.id,
      title,
      description,
      type: type as RequestType,
      priority: priority ?? 2,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({ request: requests, user })
    .from(requests)
    .leftJoin(user, eq(requests.user_id, user.id))
    .where(eq(requests.user_id, session.user.id))
    .orderBy(desc(requests.created_at));

  return NextResponse.json(rows.map(r => ({ ...r.request, profiles: r.user })));
}
