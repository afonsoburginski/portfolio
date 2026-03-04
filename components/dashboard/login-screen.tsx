"use client";

import { useAuth } from "@/components/dashboard/auth-provider";
import { Button } from "@/components/ui/button";
import { SiGoogle } from "react-icons/si";
import { Smartphone } from "lucide-react";

export function LoginScreen() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-900 text-white">
          <Smartphone className="size-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Client Portal</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Sign in to submit feature requests, track your project and review quotes from Afonso.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button
          onClick={signInWithGoogle}
          variant="outline"
          className="w-full gap-2 h-11"
        >
          <SiGoogle className="size-4" />
          Continue with Google
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Your data is secure. We only use your email to manage your requests.
      </p>
    </div>
  );
}
