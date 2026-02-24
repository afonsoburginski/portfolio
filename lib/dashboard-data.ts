"use client";

import { createBrowserSupabase } from "@/lib/supabase-browser";
import type { Request, RequestStatus, RequestTask, RequestTaskStatus, RequestType } from "@/lib/database.types";

const db = () => createBrowserSupabase();

export const ADMIN_EMAIL = "afonsoburginski@gmail.com";
export const isAdminEmail = (email?: string | null) => email === ADMIN_EMAIL;

export async function getMyRequests(): Promise<Request[]> {
  const { data, error } = await db()
    .from("requests")
    .select("*, profiles(id, full_name, email, avatar_url, company)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Request[];
}

export async function getAllRequests(): Promise<Request[]> {
  const { data, error } = await db()
    .from("requests")
    .select("*, profiles(id, full_name, email, avatar_url, company)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Request[];
}

export async function createRequest(payload: {
  title: string;
  description: string;
  type: string;
  priority: number;
}): Promise<Request> {
  const { data: { user } } = await db().auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await db()
    .from("requests")
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Request;
}

export async function updateRequestAsAdmin(
  id: string,
  patch: Partial<{
    status: RequestStatus;
    title: string;
    description: string;
    priority: number;
    budget: string;
    payment_deadline: string;
    delivery_deadline: string;
    admin_notes: string;
  }>
): Promise<Request> {
  const updates: Record<string, unknown> = { ...patch };
  if (patch.status === "quoted") updates.quoted_at = new Date().toISOString();
  if (patch.status === "delivered") updates.delivered_at = new Date().toISOString();
  const { data, error } = await db()
    .from("requests")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Request;
}

export async function respondToQuote(
  id: string,
  status: "approved" | "rejected",
  clientNotes?: string
): Promise<Request> {
  const patch: Record<string, unknown> = { status };
  if (clientNotes) patch.client_notes = clientNotes;
  if (status === "approved") patch.approved_at = new Date().toISOString();
  const { data, error } = await db()
    .from("requests")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Request;
}

// ——— Request (planning page) + tasks ———

export async function getRequestById(id: string): Promise<Request | null> {
  const { data, error } = await db()
    .from("requests")
    .select("*, profiles(id, full_name, email, avatar_url, company)")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return data as unknown as Request;
}

/** Busca total e done de tasks para vários requests de uma vez (1 query só). */
export async function getRequestsProgress(
  requestIds: string[]
): Promise<Record<string, { total: number; done: number }>> {
  if (requestIds.length === 0) return {};
  const { data, error } = await db()
    .from("request_tasks")
    .select("request_id, status")
    .in("request_id", requestIds);
  if (error) return {};
  const map: Record<string, { total: number; done: number }> = {};
  for (const row of data ?? []) {
    if (!map[row.request_id]) map[row.request_id] = { total: 0, done: 0 };
    map[row.request_id].total++;
    if (row.status === "done") map[row.request_id].done++;
  }
  return map;
}

export async function getRequestTasks(requestId: string): Promise<RequestTask[]> {
  const { data, error } = await db()
    .from("request_tasks")
    .select("*")
    .eq("request_id", requestId)
    .order("position", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as RequestTask[];
}

export async function createRequestTask(payload: {
  request_id: string;
  title: string;
  position?: number;
  due_date?: string | null;
  status?: RequestTaskStatus;
  type?: RequestType;
  priority?: 1 | 2 | 3;
}): Promise<RequestTask> {
  const { data, error } = await db()
    .from("request_tasks")
    .insert({
      request_id: payload.request_id,
      title: payload.title,
      position: payload.position ?? 0,
      due_date: payload.due_date ?? null,
      status: payload.status ?? "todo",
      type: payload.type ?? "feature",
      priority: payload.priority ?? 2,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as RequestTask;
}

export async function updateRequestTask(
  id: string,
  patch: Partial<{
    title: string;
    position: number;
    due_date: string | null;
    status: RequestTaskStatus;
    type: RequestType;
    priority: 1 | 2 | 3;
  }>
): Promise<RequestTask> {
  const { data, error } = await db()
    .from("request_tasks")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as RequestTask;
}

export async function deleteRequestTask(id: string): Promise<void> {
  const { error } = await db().from("request_tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
