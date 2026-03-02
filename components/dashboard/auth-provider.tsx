"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import type { User, Session } from "@supabase/supabase-js";

const POPUP_W = 500;
const POPUP_H = 620;

function getRedirectUrl(): string {
  if (typeof window !== "undefined") return `${window.location.origin}/dashboard/auth/callback`;
  return typeof process.env.NEXT_PUBLIC_APP_URL === "string"
    ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/auth/callback`
    : "";
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

  // Sessão enviada pelo popup de OAuth
  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (data?.type !== "supabase-auth" || !data.session?.access_token) return;
      const { access_token, refresh_token } = data.session;
      await supabase.auth.setSession({ access_token, refresh_token });
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = getRedirectUrl();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) return;
    if (data?.url) {
      const left = Math.round((window.screen.width - POPUP_W) / 2);
      const top = Math.round((window.screen.height - POPUP_H) / 2);
      window.open(data.url, "supabase-oauth", `width=${POPUP_W},height=${POPUP_H},left=${left},top=${top},scrollbars=yes`);
    }
  }, []);

  const signInWithGitHub = useCallback(async () => {
    const redirectTo = getRedirectUrl();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) return;
    if (data?.url) {
      const left = Math.round((window.screen.width - POPUP_W) / 2);
      const top = Math.round((window.screen.height - POPUP_H) / 2);
      window.open(data.url, "supabase-oauth", `width=${POPUP_W},height=${POPUP_H},left=${left},top=${top},scrollbars=yes`);
    }
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
