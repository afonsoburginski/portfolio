"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { useAuth } from "@/components/dashboard/auth-provider";

export function useNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!user) { setUnreadCount(0); return; }
    const { count } = await createBrowserSupabase()
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setUnreadCount(count ?? 0);
  }, [user]);

  useEffect(() => { fetchCount(); }, [fetchCount]);

  // Realtime — atualiza o contador quando chega nova notificação
  useEffect(() => {
    if (!user) return;
    const supabase = createBrowserSupabase();
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchCount()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchCount]);

  /** Marca todas as notificações de um pedido como lidas */
  async function markRequestRead(requestId: string) {
    if (!user) return;
    await createBrowserSupabase()
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("request_id", requestId)
      .eq("read", false);
    fetchCount();
  }

  /** Marca todas as notificações do usuário como lidas */
  async function markAllRead() {
    if (!user) return;
    await createBrowserSupabase()
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setUnreadCount(0);
  }

  return { unreadCount, markRequestRead, markAllRead };
}
