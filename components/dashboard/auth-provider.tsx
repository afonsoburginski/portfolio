"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession, signIn, signOut } from "@/lib/auth-client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  isAdmin?: boolean;
  company?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!isPending) setHasFetched(true);
  }, [isPending]);

  const signInWithGoogle = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user: (session?.user ?? null) as AuthUser | null,
        loading: isPending || !hasFetched,
        signInWithGoogle,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
