import type { Request } from "@/lib/database.types";

const BASE = "/api/requests";

async function authFetch(url: string, token: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // Split large tokens to avoid 431 — send only the first 4KB
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json;
}

export async function getMyRequests(token: string): Promise<Request[]> {
  return authFetch(BASE, token);
}

export async function getAllRequests(token: string, adminSecret: string): Promise<Request[]> {
  return authFetch(`${BASE}?admin_secret=${adminSecret}`, token);
}

export async function createRequest(
  token: string,
  payload: { title: string; description: string; type: string; priority: number }
): Promise<Request> {
  return authFetch(BASE, token, { method: "POST", body: JSON.stringify(payload) });
}

export async function updateRequest(
  token: string,
  id: string,
  payload: Record<string, unknown>
): Promise<Request> {
  return authFetch(`${BASE}/${id}`, token, { method: "PATCH", body: JSON.stringify(payload) });
}
