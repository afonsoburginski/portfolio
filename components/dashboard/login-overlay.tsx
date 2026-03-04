"use client";

import Image from "next/image";
import { useAuth } from "@/components/dashboard/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SiGoogle } from "react-icons/si";
import { Loader2 } from "lucide-react";

interface LoginOverlayProps {
  loading?: boolean;
}

export function LoginOverlay({ loading }: LoginOverlayProps) {
  const { signInWithGoogle } = useAuth();

  return (
    <Dialog open defaultOpen>
      <DialogContent
        className="sm:max-w-[360px] gap-6 border-border/60 bg-card dark:bg-zinc-900 dark:border-zinc-700/60"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-2">
            <Image
              src="/logo.png"
              alt="Afonsodev"
              width={48}
              height={48}
              className="rounded-xl"
            />
          </div>
          <DialogTitle className="text-xl">Entrar no portal</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Acesse para enviar pedidos, acompanhar orçamentos e entregas.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Autenticando…</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              onClick={signInWithGoogle}
              variant="outline"
              className="w-full gap-2 h-10"
            >
              <SiGoogle className="size-4" />
              Continuar com Google
            </Button>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground/60 text-center">
          Ao entrar, você concorda em usar seu e-mail para gestão do projeto.
        </p>
      </DialogContent>
    </Dialog>
  );
}
