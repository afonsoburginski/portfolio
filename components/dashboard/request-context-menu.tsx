"use client";

import { useRouter } from "next/navigation";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  ExternalLink,
  ArrowRight,
  Flag,
  Circle,
  CheckCircle2,
  Timer,
  Truck,
  XCircle,
  Eye,
  Banknote,
  AlertTriangle,
} from "lucide-react";
import { updateRequestAsAdmin } from "@/lib/dashboard-data";
import type { Request, RequestStatus } from "@/lib/database.types";

/* ── Status config ─────────────────────────────────────── */
const STATUS_ACTIONS: {
  value: RequestStatus;
  label: string;
  icon: React.ElementType;
  className?: string;
}[] = [
  { value: "submitted",   label: "Enviada",       icon: Circle },
  { value: "reviewing",   label: "Em análise",     icon: Eye },
  { value: "quoted",      label: "Orçada",         icon: Banknote },
  { value: "approved",    label: "Aprovada",       icon: CheckCircle2 },
  { value: "in_progress", label: "Em progresso",   icon: Timer },
  { value: "delivered",   label: "Concluído",      icon: Truck },
  { value: "rejected",    label: "Rejeitada",      icon: XCircle,       className: "text-red-500" },
  { value: "cancelled",   label: "Cancelada",      icon: XCircle,       className: "text-muted-foreground" },
];

const PRIORITY_ACTIONS: {
  value: 1 | 2 | 3;
  label: string;
  className: string;
}[] = [
  { value: 1, label: "Baixa",  className: "text-slate-400" },
  { value: 2, label: "Média",  className: "text-yellow-500" },
  { value: 3, label: "Alta",   className: "text-red-500" },
];

/* ── Props ─────────────────────────────────────────────── */
interface Props {
  request: Request;
  children: React.ReactNode;
  onUpdated?: (updated: Request) => void;
}

/* ── Component ─────────────────────────────────────────── */
export function RequestContextMenu({ request, children, onUpdated }: Props) {
  const router = useRouter();

  async function changeStatus(status: RequestStatus) {
    if (status === request.status) return;
    const updated = await updateRequestAsAdmin(request.id, { status });
    onUpdated?.(updated);
  }

  async function changePriority(priority: 1 | 2 | 3) {
    if (priority === request.priority) return;
    const updated = await updateRequestAsAdmin(request.id, { priority });
    onUpdated?.(updated);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

      <ContextMenuContent className="dark w-56 bg-zinc-900 border-zinc-700/60 text-zinc-100 shadow-xl shadow-black/40">
        <ContextMenuLabel className="text-xs font-medium text-zinc-400 truncate max-w-[13rem]">
          {request.title}
        </ContextMenuLabel>
        <ContextMenuSeparator />

        {/* Abrir */}
        <ContextMenuItem
          className="gap-2"
          onSelect={() => router.push(`/dashboard/admin/requests/${request.id}`)}
        >
          <ExternalLink className="size-3.5 text-muted-foreground" />
          Abrir detalhes
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Mudar status */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2">
            <ArrowRight className="size-3.5 text-muted-foreground" />
            Mudar status
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="dark w-44 bg-zinc-900 border-zinc-700/60 text-zinc-100">
            {STATUS_ACTIONS.map(({ value, label, icon: Icon, className }) => (
              <ContextMenuItem
                key={value}
                className={`gap-2 ${className ?? ""}`}
                disabled={value === request.status}
                onSelect={() => changeStatus(value)}
              >
                <Icon className="size-3.5" />
                {label}
                {value === request.status && (
                  <span className="ml-auto text-[10px] text-muted-foreground">atual</span>
                )}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Mudar prioridade */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2">
            <Flag className="size-3.5 text-muted-foreground" />
            Prioridade
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="dark w-36 bg-zinc-900 border-zinc-700/60 text-zinc-100">
            {PRIORITY_ACTIONS.map(({ value, label, className }) => (
              <ContextMenuItem
                key={value}
                className={`gap-2 ${className}`}
                disabled={value === request.priority}
                onSelect={() => changePriority(value)}
              >
                <AlertTriangle className="size-3.5" />
                {label}
                {value === request.priority && (
                  <span className="ml-auto text-[10px] text-muted-foreground">atual</span>
                )}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {/* Indicador visual */}
        <div className="px-2 py-1 text-[10px] text-zinc-500 select-none">
          Clique direito para editar · Clique para abrir
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
}
