"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/dashboard/auth-provider";

const POLL_INTERVAL_MS = 10_000;

export function useNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCount = useCallback(async () => {
    if (!user) { setUnreadCount(0); return; }
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const { count } = await res.json();
      setUnreadCount(count ?? 0);
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    fetchCount();

    if (user) {
      intervalRef.current = setInterval(fetchCount, POLL_INTERVAL_MS);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchCount, user]);

  async function markRequestRead(requestId: string) {
    if (!user) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });
    fetchCount();
  }

  async function markAllRead() {
    if (!user) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setUnreadCount(0);
  }

  return { unreadCount, markRequestRead, markAllRead };
}
