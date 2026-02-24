"use client";

import Image from "next/image";
import { useAuth } from "@/components/dashboard/auth-provider";
import { Button } from "@/components/ui/button";
import { SiGithub, SiGoogle } from "react-icons/si";
import { Loader2 } from "lucide-react";

interface LoginOverlayProps {
  loading?: boolean;
}

export function LoginOverlay({ loading }: LoginOverlayProps) {
  const { signInWithGoogle, signInWithGitHub } = useAuth();

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xs">
        {/* Brand */}
        <div className="flex flex-col items-center gap-5 text-center">
          <Image
            src="/logo.png"
            alt="Afonsodev"
            width={56}
            height={56}
            className="rounded-2xl"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Client Portal</h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
              Sign in to submit requests, track your project, and review quotes.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Authenticating...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 w-full">
            <Button
              onClick={signInWithGoogle}
              variant="outline"
              className="w-full gap-2.5 h-11"
            >
              <SiGoogle className="size-4" />
              Continue with Google
            </Button>
            <Button
              onClick={signInWithGitHub}
              variant="outline"
              className="w-full gap-2.5 h-11"
            >
              <SiGithub className="size-4" />
              Continue with GitHub
            </Button>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground/50 text-center leading-relaxed">
          By signing in, you agree to share your email for project management purposes.
        </p>
      </div>
    </div>
  );
}
