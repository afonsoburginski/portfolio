import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requests, user, type RequestType } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { isAdminEmail } from "@/lib/admin-helpers";
import { sendNewRequestNotification } from "@/lib/email";

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

  // Notifica o admin por email — fire and forget (não bloqueia a resposta)
  sendNewRequestNotification({
    requestId: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    priority: row.priority,
    clientName: session.user.name ?? session.user.email,
    clientEmail: session.user.email,
  }).catch((err) => console.error("[email] Falha ao notificar admin:", err));

  return NextResponse.json(row, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminByEmail = isAdminEmail(session.user.email);
  const adminByField = (session.user as { isAdmin?: boolean }).isAdmin === true;
  const userIsAdmin = adminByEmail || adminByField;

  const adminSecret = req.nextUrl.searchParams.get("admin_secret");
  const hasAdminSecret = adminSecret === process.env.DASHBOARD_ADMIN_SECRET;

  let rows;
  if (userIsAdmin || hasAdminSecret) {
    rows = await db
      .select({ request: requests, user })
      .from(requests)
      .leftJoin(user, eq(requests.user_id, user.id))
      .orderBy(desc(requests.created_at));
  } else {
    rows = await db
      .select({ request: requests, user })
      .from(requests)
      .leftJoin(user, eq(requests.user_id, user.id))
      .where(eq(requests.user_id, session.user.id))
      .orderBy(desc(requests.created_at));
  }

  return NextResponse.json(rows.map(r => ({ ...r.request, profiles: r.user })));
}
