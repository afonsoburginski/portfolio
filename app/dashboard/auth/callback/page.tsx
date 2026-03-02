"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { Loader2 } from "lucide-react";

/**
 * Página aberta no popup após OAuth. Recebe o hash com tokens,
 * Supabase persiste a sessão, enviamos ao opener e fechamos.
 */
export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    const supabase = createBrowserSupabase();

    const sendAndClose = (s: { access_token: string; refresh_token: string | null }) => {
      if (window.opener) {
        window.opener.postMessage(
          { type: "supabase-auth", session: { access_token: s.access_token, refresh_token: s.refresh_token } },
          window.location.origin
        );
      }
      setStatus("done");
      window.close();
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s?.access_token && window.opener) {
        sendAndClose(s);
      }
    });

    // Hash já pode ter sido processado antes do listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token && window.opener) {
        sendAndClose(session);
      } else if (!window.location.hash && !session) {
        setStatus("error");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
      {status === "loading" && (
        <>
          <Loader2 className="size-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">Conectando…</p>
        </>
      )}
      {status === "done" && (
        <p className="text-sm text-muted-foreground">Login concluído. Esta janela pode ser fechada.</p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">Falha ao obter sessão. Feche e tente novamente.</p>
      )}
    </div>
  );
}
