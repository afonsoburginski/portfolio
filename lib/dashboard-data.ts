"use server";

import { db } from "./db";
import { requests, request_attachments, request_comments, request_tasks, request_stages, user_preferences, notifications, user, projects } from "./schema";
import { eq, desc, inArray, and, sql, asc } from "drizzle-orm";
import { auth } from "./auth";
import { headers } from "next/headers";
import type { RequestStatus, RequestType, RequestTaskStatus, ProjectCategory, ProjectStatus } from "./schema";
import { isAdmin } from "./admin-helpers";

async function requireAdmin() {
  const u = await currentUser();
  if (!isAdmin(u)) throw new Error("Forbidden");
  return u!;
}

async function currentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

// ——— Requests ———

export async function getMyRequests() {
  const u = await currentUser();
  if (!u) throw new Error("Not authenticated");
  const rows = await db
    .select({ request: requests, user })
    .from(requests)
    .leftJoin(user, eq(requests.user_id, user.id))
    .where(eq(requests.user_id, u.id))
    .orderBy(desc(requests.created_at));
  return rows.map(r => ({ ...r.request, profiles: r.user }));
}

export async function getAllRequests() {
  const rows = await db
    .select({ request: requests, user })
    .from(requests)
    .leftJoin(user, eq(requests.user_id, user.id))
    .orderBy(desc(requests.created_at));
  return rows.map(r => ({ ...r.request, profiles: r.user }));
}

export async function getRequestById(id: string) {
  const rows = await db
    .select({ request: requests, user })
    .from(requests)
    .leftJoin(user, eq(requests.user_id, user.id))
    .where(eq(requests.id, id));
  if (!rows[0]) return null;
  const comments = await db
    .select({ comment: request_comments, user })
    .from(request_comments)
    .leftJoin(user, eq(request_comments.user_id, user.id))
    .where(eq(request_comments.request_id, id))
    .orderBy(request_comments.created_at);
  return {
    ...rows[0].request,
    profiles: rows[0].user,
    request_comments: comments.map(c => ({ ...c.comment, profiles: c.user })),
  };
}

export async function createRequest(payload: {
  title: string;
  description: string;
  type: RequestType;
  priority: number;
}) {
  const u = await currentUser();
  if (!u) throw new Error("Not authenticated");
  const [row] = await db
    .insert(requests)
    .values({ ...payload, user_id: u.id })
    .returning();
  return row;
}

export async function updateRequestAsAdmin(
  id: string,
  patch: Partial<{
    status: RequestStatus;
    title: string;
    description: string;
    type: RequestType;
    priority: number;
    budget: string;
    payment_deadline: string;
    delivery_deadline: string;
    admin_notes: string;
    image_url: string | null;
    paid_manually: boolean;
    paid_at: string | null;
  }>
) {
  const updates: Record<string, unknown> = {
    ...patch,
    updated_at: new Date().toISOString(),
  };
  if (patch.status === "quoted") updates.quoted_at = new Date().toISOString();
  if (patch.status === "approved") updates.approved_at = new Date().toISOString();
  if (patch.status === "delivered") updates.delivered_at = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [row] = await db.update(requests).set(updates as any).where(eq(requests.id, id)).returning();
  return row;
}

export async function cancelRequest(id: string) {
  const [row] = await db
    .update(requests)
    .set({ status: "cancelled", updated_at: new Date().toISOString() })
    .where(eq(requests.id, id))
    .returning();
  return row;
}

export async function deleteRequest(id: string) {
  await db.delete(request_comments).where(eq(request_comments.request_id, id));
  await db.delete(request_attachments).where(eq(request_attachments.request_id, id));
  await db.delete(request_tasks).where(eq(request_tasks.request_id, id));
  await db.delete(requests).where(eq(requests.id, id));
}

export async function respondToQuote(
  id: string,
  status: "approved" | "rejected",
  clientNotes?: string
) {
  const patch: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (clientNotes) patch.client_notes = clientNotes;
  if (status === "approved") patch.approved_at = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [row] = await db.update(requests).set(patch as any).where(eq(requests.id, id)).returning();
  return row;
}

export async function changeRequestClient(requestId: string, newUserId: string) {
  const [row] = await db
    .update(requests)
    .set({ user_id: newUserId, updated_at: new Date().toISOString() })
    .where(eq(requests.id, requestId))
    .returning();
  if (!row) throw new Error("Request not found");
  return row;
}

// ——— Users / Profiles ———

export async function getAllProfiles() {
  return db.select().from(user).orderBy(user.name);
}

// ——— Image upload ———

export async function updateRequestImage(requestId: string, imageUrl: string | null) {
  const u = await currentUser();
  if (!u) throw new Error("Not authenticated");
  const isAdm = isAdmin(u);

  // Admin pode atualizar qualquer request, usuário só os próprios
  if (isAdm) {
    await db
      .update(requests)
      .set({ image_url: imageUrl, updated_at: new Date().toISOString() })
      .where(eq(requests.id, requestId));
  } else {
    await db
      .update(requests)
      .set({ image_url: imageUrl, updated_at: new Date().toISOString() })
      .where(and(eq(requests.id, requestId), eq(requests.user_id, u.id)));
  }

  return imageUrl;
}

// ——— Request attachments ———

async function canMutateRequest(requestId: string) {
  const u = await currentUser();
  if (!u) throw new Error("Not authenticated");
  const isAdm = isAdmin(u);
  const [row] = await db
    .select({ user_id: requests.user_id })
    .from(requests)
    .where(eq(requests.id, requestId))
    .limit(1);
  if (!row) throw new Error("Request not found");
  if (!isAdm && row.user_id !== u.id) throw new Error("Forbidden");
  return { user: u, isAdmin: isAdm };
}

export async function getRequestAttachments(requestId: string) {
  return db
    .select()
    .from(request_attachments)
    .where(eq(request_attachments.request_id, requestId))
    .orderBy(request_attachments.position, request_attachments.created_at);
}

export async function createRequestAttachment(payload: {
  request_id: string;
  url: string;
  name: string;
  mime_type?: string | null;
  size?: number | null;
  kind?: "image" | "file";
}) {
  await canMutateRequest(payload.request_id);
  const countRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(request_attachments)
    .where(eq(request_attachments.request_id, payload.request_id));
  const position = countRows[0]?.count ?? 0;
  const [row] = await db
    .insert(request_attachments)
    .values({
      request_id: payload.request_id,
      url: payload.url,
      name: payload.name,
      mime_type: payload.mime_type ?? null,
      size: payload.size ?? null,
      kind: payload.kind ?? "file",
      position,
    })
    .returning();

  if (row.kind === "image") {
    await updateRequestImage(payload.request_id, row.url);
  }

  return row;
}

export async function deleteRequestAttachment(id: string) {
  const [attachment] = await db
    .select()
    .from(request_attachments)
    .where(eq(request_attachments.id, id))
    .limit(1);
  if (!attachment) return null;

  await canMutateRequest(attachment.request_id);
  await db.delete(request_attachments).where(eq(request_attachments.id, id));

  const [nextImage] = await db
    .select()
    .from(request_attachments)
    .where(and(eq(request_attachments.request_id, attachment.request_id), eq(request_attachments.kind, "image")))
    .orderBy(request_attachments.position, request_attachments.created_at)
    .limit(1);

  if (attachment.kind === "image") {
    await updateRequestImage(attachment.request_id, nextImage?.url ?? null);
  }

  return attachment;
}

// ——— Tasks ———

export async function getRequestsProgress(requestIds: string[]) {
  if (requestIds.length === 0) return {} as Record<string, { total: number; done: number }>;
  const rows = await db
    .select({ request_id: request_tasks.request_id, status: request_tasks.status })
    .from(request_tasks)
    .where(inArray(request_tasks.request_id, requestIds));
  const map: Record<string, { total: number; done: number }> = {};
  for (const row of rows) {
    if (!map[row.request_id]) map[row.request_id] = { total: 0, done: 0 };
    map[row.request_id].total++;
    if (row.status === "done") map[row.request_id].done++;
  }
  return map;
}

export async function getRequestTasks(requestId: string) {
  return db
    .select()
    .from(request_tasks)
    .where(eq(request_tasks.request_id, requestId))
    .orderBy(request_tasks.position);
}

export async function getRequestStages(requestId: string) {
  return db
    .select()
    .from(request_stages)
    .where(eq(request_stages.request_id, requestId))
    .orderBy(request_stages.position);
}

export async function getUserPreference(key: string): Promise<string | null> {
  const u = await currentUser();
  if (!u) return null;
  const [row] = await db
    .select({ value: user_preferences.value })
    .from(user_preferences)
    .where(and(eq(user_preferences.user_id, u.id), eq(user_preferences.key, key)))
    .limit(1);
  return row?.value ?? null;
}

export async function setUserPreference(key: string, value: string): Promise<void> {
  const u = await currentUser();
  if (!u) throw new Error("Not authenticated");
  await db
    .insert(user_preferences)
    .values({ user_id: u.id, key, value })
    .onConflictDoUpdate({
      target: [user_preferences.user_id, user_preferences.key],
      set: { value, updated_at: sql`(datetime('now'))` },
    });
}

export async function createRequestTask(payload: {
  request_id: string;
  title: string;
  position?: number;
  due_date?: string | null;
  status?: RequestTaskStatus;
  type?: RequestType;
  priority?: 1 | 2 | 3;
  value?: number | null;
}) {
  const [row] = await db
    .insert(request_tasks)
    .values({
      request_id: payload.request_id,
      title: payload.title,
      position: payload.position ?? 0,
      due_date: payload.due_date ?? null,
      status: payload.status ?? "todo",
      type: payload.type ?? "feature",
      priority: payload.priority ?? 2,
      value: payload.value ?? null,
    })
    .returning();
  return row;
}

export async function updateRequestTask(
  id: string,
  patch: Partial<{
    title: string;
    position: number;
    due_date: string | null;
    status: RequestTaskStatus;
    type: RequestType;
    priority: number;
    value: number | null;
  }>
) {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.title !== undefined) updates.title = patch.title;
  if (patch.position !== undefined) updates.position = patch.position;
  if (patch.due_date !== undefined) updates.due_date = patch.due_date;
  if (patch.status !== undefined) updates.status = patch.status;
  if (patch.type !== undefined) updates.type = patch.type;
  if (patch.priority !== undefined) updates.priority = patch.priority;
  if (patch.value !== undefined) updates.value = patch.value;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [row] = await db.update(request_tasks).set(updates as any).where(eq(request_tasks.id, id)).returning();
  return row;
}

export async function deleteRequestTask(id: string) {
  await db.delete(request_tasks).where(eq(request_tasks.id, id));
}

// ——— Notifications ———

export async function getUnreadNotificationCount(userId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.user_id, userId), eq(notifications.read, false)));
  return row?.count ?? 0;
}

export async function markRequestNotificationsRead(userId: string, requestId: string) {
  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.user_id, userId),
        eq(notifications.request_id, requestId),
        eq(notifications.read, false)
      )
    );
}

export async function markAllNotificationsRead(userId: string) {
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.user_id, userId), eq(notifications.read, false)));
}

// ——— Comments ———

export async function getRequestComments(requestId: string) {
  const rows = await db
    .select({ comment: request_comments, user })
    .from(request_comments)
    .leftJoin(user, eq(request_comments.user_id, user.id))
    .where(eq(request_comments.request_id, requestId))
    .orderBy(request_comments.created_at);
  return rows.map(r => ({ ...r.comment, profiles: r.user }));
}

export async function addComment(requestId: string, content: string) {
  const u = await currentUser();
  if (!u) throw new Error("Not authenticated");
  const adminUser = isAdmin(u as { email?: string; isAdmin?: boolean });
  const [row] = await db
    .insert(request_comments)
    .values({ request_id: requestId, user_id: u.id, content, is_admin: adminUser })
    .returning();
  return row;
}

export async function deleteComment(id: string) {
  await db.delete(request_comments).where(eq(request_comments.id, id));
}

// ——— Projects (home cards + case-study slugs) ———

export async function getHomeProjects() {
  return db
    .select()
    .from(projects)
    .where(eq(projects.featured, true))
    .orderBy(asc(projects.sort_order));
}

export async function getAllProjectsAdmin() {
  await requireAdmin();
  return db.select().from(projects).orderBy(asc(projects.sort_order));
}

export async function createProject(payload: {
  slug: string;
  title: string;
  description?: string;
  image?: string | null;
  link?: string | null;
  category?: ProjectCategory;
  status?: ProjectStatus;
  featured?: boolean;
}) {
  await requireAdmin();
  const last = await db
    .select({ max: sql<number>`COALESCE(MAX(${projects.sort_order}), 0)` })
    .from(projects);
  const nextOrder = (last[0]?.max ?? 0) + 10;
  const [row] = await db
    .insert(projects)
    .values({
      slug: payload.slug,
      title: payload.title,
      description: payload.description ?? "",
      image: payload.image ?? null,
      link: payload.link ?? null,
      category: payload.category ?? "web",
      status: payload.status ?? "production",
      featured: payload.featured ?? true,
      sort_order: nextOrder,
    })
    .returning();
  return row;
}

export async function updateProject(
  id: string,
  patch: Partial<{
    slug: string;
    title: string;
    description: string;
    image: string | null;
    link: string | null;
    category: ProjectCategory;
    status: ProjectStatus;
    featured: boolean;
    sort_order: number;
  }>,
) {
  await requireAdmin();
  const [row] = await db
    .update(projects)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .set({ ...(patch as any), updated_at: sql`datetime('now')` })
    .where(eq(projects.id, id))
    .returning();
  return row;
}

export async function deleteProject(id: string) {
  await requireAdmin();
  await db.delete(projects).where(eq(projects.id, id));
}

export async function reorderProjects(orderedIds: string[]) {
  await requireAdmin();
  await Promise.all(
    orderedIds.map((id, idx) =>
      db
        .update(projects)
        .set({ sort_order: (idx + 1) * 10, updated_at: sql`datetime('now')` })
        .where(eq(projects.id, id)),
    ),
  );
}

// ——— Payment helper (replaces Supabase RPC mark_payment_approved) ———

export async function markPaymentApproved(requestId: string, paymentId: string) {
  const now = new Date().toISOString();
  await db
    .update(requests)
    .set({
      status: "approved",
      approved_at: now,
      mp_payment_id: paymentId,
      paid_at: now,
      updated_at: now,
    })
    .where(eq(requests.id, requestId));
}
