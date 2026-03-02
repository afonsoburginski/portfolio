"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExternalLink, XCircle, CreditCard, CalendarPlus } from "lucide-react";
import { cancelRequest } from "@/lib/dashboard-data";
import type { Request, RequestStatus } from "@/lib/database.types";
import { getCalApi } from "@calcom/embed-react";

const CANCELLABLE: RequestStatus[] = ["submitted", "reviewing", "quoted"];

interface Props {
  request: Request;
  children: React.ReactNode;
  onUpdated?: (updated: Request) => void;
}

export function ClientRequestContextMenu({ request, children, onUpdated }: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const canCancel = CANCELLABLE.includes(request.status);

  async function openMeeting() {
    const cal = await getCalApi();
    cal("modal", {
      calLink: "afonso-burginski-fyh9nv/30min",
    });
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      const updated = await cancelRequest(request.id);
      onUpdated?.(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setCancelling(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

        <ContextMenuContent className="dark w-52 bg-zinc-900 border-zinc-700/60 text-zinc-100 shadow-xl shadow-black/40">
          <ContextMenuLabel className="text-xs font-medium text-zinc-400 truncate max-w-[13rem]">
            {request.title}
          </ContextMenuLabel>
          <ContextMenuSeparator className="bg-zinc-700/60" />

          <ContextMenuItem
            className="gap-2 text-zinc-200"
            onSelect={() => router.push(`/dashboard/requests/${request.id}`)}
          >
            <ExternalLink className="size-3.5 text-zinc-400" />
            Abrir pedido
          </ContextMenuItem>

          {request.status === "quoted" && (
            <ContextMenuItem
              className="gap-2 text-purple-400"
              onSelect={() => router.push(`/dashboard/requests/${request.id}`)}
            >
              <CreditCard className="size-3.5" />
              Ver orçamento
            </ContextMenuItem>
          )}

          <ContextMenuSeparator className="bg-zinc-700/60" />
          <ContextMenuItem
            className="gap-2 text-sky-400 focus:text-sky-300 focus:bg-sky-950/40"
            onSelect={openMeeting}
          >
            <CalendarPlus className="size-3.5" />
            Marcar reunião
          </ContextMenuItem>

          {canCancel && (
            <>
              <ContextMenuSeparator className="bg-zinc-700/60" />
              <ContextMenuItem
                className="gap-2 text-red-400 focus:text-red-300 focus:bg-red-950/40"
                onSelect={() => setConfirmOpen(true)}
              >
                <XCircle className="size-3.5" />
                Cancelar pedido
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {/* Confirmação de cancelamento */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="dark bg-zinc-900 border-zinc-700/60">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Cancelar pedido?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja cancelar{" "}
              <span className="font-medium text-zinc-200">"{request.title}"</span>?
              Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100">
              Manter pedido
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {cancelling ? "Cancelando..." : "Sim, cancelar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
