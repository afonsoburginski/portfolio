"use server";

import { db } from "./db";
import { requests, request_comments, request_tasks, notifications, user } from "./schema";
import { eq, desc, inArray, and, sql } from "drizzle-orm";
import { put } from "@vercel/blob";
import { auth } from "./auth";
import { headers } from "next/headers";
import type { RequestStatus, RequestType, RequestTaskStatus } from "./schema";
import { isAdmin } from "./admin-helpers";

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

export async function uploadRequestImage(requestId: string, formData: FormData) {
  const u = await currentUser();
  if (!u) throw new Error("Not authenticated");
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const { url } = await put(`request-images/${requestId}/image.${ext}`, file, {
    access: "public",
    addRandomSuffix: false,
  });
  await db
    .update(requests)
    .set({ image_url: url, updated_at: new Date().toISOString() })
    .where(and(eq(requests.id, requestId), eq(requests.user_id, u.id)));
  return url;
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

export async function createRequestTask(payload: {
  request_id: string;
  title: string;
  position?: number;
  due_date?: string | null;
  status?: RequestTaskStatus;
  type?: RequestType;
  priority?: 1 | 2 | 3;
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
  }>
) {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.title !== undefined) updates.title = patch.title;
  if (patch.position !== undefined) updates.position = patch.position;
  if (patch.due_date !== undefined) updates.due_date = patch.due_date;
  if (patch.status !== undefined) updates.status = patch.status;
  if (patch.type !== undefined) updates.type = patch.type;
  if (patch.priority !== undefined) updates.priority = patch.priority;

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
