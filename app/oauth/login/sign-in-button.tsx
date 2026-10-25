"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";

export function SignInButton({ next }: { next: string }) {
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => { setPending(true); await signIn.social({ provider: "google", callbackURL: next }); }}
      className="w-full rounded-xl bg-[#1f6feb] px-4 py-3 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60"
    >
      {pending ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}
