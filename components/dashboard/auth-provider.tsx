"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import type { User, Session } from "@supabase/supabase-js";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void;
          prompt: (cb?: (n: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          cancel: () => void;
          renderButton: (el: HTMLElement, cfg: object) => void;
        };
      };
    };
  }
}

function loadGis(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.google?.accounts) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const supabase = createBrowserSupabase();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle OAuth hash tokens in URL (redirect flow legado — limpa hash)
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash.includes("access_token=")) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await loadGis();
    window.google!.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: async ({ credential }: { credential: string }) => {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: credential,
        });
        if (error) console.error("[Google Sign-In]", error);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      context: "signin",
      ux_mode: "popup",
    });
    window.google!.accounts.id.prompt((n) => {
      if (n.isNotDisplayed() || n.isSkippedMoment()) {
        // Fallback: OAuth redirect se o navegador bloquear o prompt nativo
        supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}/dashboard/auth/callback` },
        });
      }
    });
  }, []);

  const signInWithGitHub = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/dashboard/auth/callback` },
    });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const getAccessToken = async (): Promise<string | null> => {
    const { data: { session: s } } = await supabase.auth.getSession();
    return s?.access_token ?? null;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signInWithGitHub, signOut, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
