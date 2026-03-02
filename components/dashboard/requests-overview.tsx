"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/dashboard/auth-provider";
import { getMyRequests, isAdminEmail } from "@/lib/dashboard-data";
import type { Request, RequestStatus } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { NewRequestDialog } from "@/components/dashboard/new-request-dialog";
import {
  PlusCircle, Loader2, ChevronRight, FileText,
  CheckCircle2, AlertCircle, Rocket, LayoutList, GanttChartSquare,
} from "lucide-react";
import { ClientRequestContextMenu } from "@/components/dashboard/client-request-context-menu";
import { AdminGanttView } from "@/components/dashboard/admin-gantt-view";
import { getCalApi } from "@calcom/embed-react";
import { createBrowserSupabase } from "@/lib/supabase-browser";

const STATUS_COLORS: Record<RequestStatus, string> = {
  submitted:   "bg-blue-500/15 text-blue-400 border-blue-500/20",
  reviewing:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  quoted:      "bg-purple-500/15 text-purple-400 border-purple-500/20",
  approved:    "bg-green-500/15 text-green-400 border-green-500/20",
  rejected:    "bg-red-500/15 text-red-400 border-red-500/20",
  in_progress: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  delivered:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  cancelled:   "bg-neutral-500/15 text-neutral-400 border-neutral-500/20",
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  submitted:   "Submitted",
  reviewing:   "Reviewing",
  quoted:      "Quote Ready",
  approved:    "Approved",
  rejected:    "Rejected",
  in_progress: "In Progress",
  delivered:   "Delivered",
  cancelled:   "Cancelled",
};

const TYPE_LABELS: Record<string, string> = {
  feature: "Nova funcionalidade", bug_fix: "Correção de bug", integration: "Integração",
  maintenance: "Manutenção", redesign: "Redesign / UI", other: "Outro"
};

function StatusPill({ status }: { status: RequestStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

type ViewMode = "table" | "gantt";

export function RequestsOverview() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const isAdmin = isAdminEmail(user?.email);

  const refresh = () => getMyRequests().then(setRequests).catch(console.error);

  useEffect(() => { refresh().finally(() => setLoading(false)); }, []);

  // Realtime — atualiza ao vivo quando o admin cria/altera pedidos do cliente
  useEffect(() => {
    const supabase = createBrowserSupabase();
    const channel = supabase
      .channel("requests-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requests" },
        () => { refresh(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    getCalApi().then((cal) => cal("ui", { theme: "dark" })).catch(() => {});
  }, []);

  const name = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? "there";

  const active   = requests.filter(r => !["cancelled", "rejected", "delivered"].includes(r.status));
  const inProg   = requests.filter(r => r.status === "in_progress");
  const quoted   = requests.filter(r => r.status === "quoted");
  const delivered= requests.filter(r => r.status === "delivered");
  const pending  = requests.filter(r => ["submitted", "reviewing"].includes(r.status));
  const cancelled= requests.filter(r => r.status === "cancelled");

  /* próximo prazo de entrega entre pedidos ativos */
  const nextDeadline = inProg
    .filter(r => r.delivery_deadline)
    .sort((a, b) => new Date(a.delivery_deadline!).getTime() - new Date(b.delivery_deadline!).getTime())[0];

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  const cards = [
    {
      label: "Pedidos ativos",
      value: active.length,
      sub: pending.length > 0
        ? `${pending.length} aguardando análise`
        : active.length === 0 ? "Nenhum pedido ativo" : "Tudo em andamento",
      icon: FileText,
      accent: "border-l-zinc-500/60",
      valueColor: "text-foreground",
      iconColor: "text-zinc-400",
      badge: pending.length > 0 ? { label: `+${pending.length} pendente${pending.length > 1 ? "s" : ""}`, color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" } : null,
    },
    {
      label: "Em produção",
      value: inProg.length,
      sub: nextDeadline
        ? `Prazo: ${fmtDate(nextDeadline.delivery_deadline!)}`
        : inProg.length === 0 ? "Nenhum em desenvolvimento" : "Sem prazo definido",
      icon: Rocket,
      accent: "border-l-orange-500/60",
      valueColor: "text-orange-400",
      iconColor: "text-orange-400",
      badge: nextDeadline ? { label: fmtDate(nextDeadline.delivery_deadline!), color: "bg-orange-500/10 text-orange-400 border-orange-500/20" } : null,
    },
    {
      label: "Aguardando você",
      value: quoted.length,
      sub: quoted.length === 0
        ? "Nenhuma ação pendente"
        : quoted.length === 1 ? "Orçamento pronto — revise agora" : `${quoted.length} orçamentos para revisar`,
      icon: AlertCircle,
      accent: "border-l-purple-500/60",
      valueColor: "text-purple-400",
      iconColor: "text-purple-400",
      badge: quoted.length > 0 ? { label: "Ação necessária", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" } : null,
    },
    {
      label: "Concluídos",
      value: delivered.length,
      sub: cancelled.length > 0
        ? `${cancelled.length} cancelado${cancelled.length > 1 ? "s" : ""} · ${delivered.length} entregue${delivered.length !== 1 ? "s" : ""}`
        : delivered.length === 0 ? "Nenhuma entrega ainda" : `${delivered.length} projeto${delivered.length !== 1 ? "s" : ""} finalizado${delivered.length !== 1 ? "s" : ""}`,
      icon: CheckCircle2,
      accent: "border-l-emerald-500/60",
      valueColor: "text-emerald-400",
      iconColor: "text-emerald-400",
      badge: cancelled.length > 0 ? { label: `${cancelled.length} cancelado${cancelled.length > 1 ? "s" : ""}`, color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" } : null,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-xl font-semibold tracking-tight">
            {isAdmin ? "Dashboard" : `Olá, ${name} 👋`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Visão geral de todos os pedidos e solicitações dos clientes."
              : "Acompanhe seus pedidos, orçamentos e entregas."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-2 shadow-sm" onClick={() => setNewRequestOpen(true)}>
            <PlusCircle className="size-3.5" />
            Novo pedido
          </Button>
          <NewRequestDialog open={newRequestOpen} onOpenChange={setNewRequestOpen} onSuccess={refresh} />
        </div>
      </div>

      {/* Stat cards — compactos e densos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`relative flex flex-col gap-2 rounded-xl border border-l-[3px] bg-card px-4 py-3 transition-all hover:shadow-sm ${c.accent}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
              <c.icon className={`size-3.5 shrink-0 ${c.iconColor}`} />
            </div>
            <div className="flex items-end justify-between gap-2">
              <span className={`text-2xl font-bold tabular-nums leading-none ${c.valueColor}`}>
                {c.value}
              </span>
              {c.badge && (
                <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-none ${c.badge.color}`}>
                  {c.badge.label}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground/70 leading-snug">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Requests table / gantt */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Seus pedidos</h2>
            <p className="text-xs text-muted-foreground">
              {requests.length === 0
                ? "Nenhuma solicitação ainda"
                : requests.length === 1
                  ? "1 solicitação"
                  : `${requests.length} solicitações · clique com botão direito para ações rápidas`}
            </p>
          </div>
          {!loading && requests.length > 0 && (
            <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutList className="size-3.5" />
                Tabela
              </button>
              <button
                onClick={() => setViewMode("gantt")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "gantt"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <GanttChartSquare className="size-3.5" />
                Gantt
              </button>
            </div>
          )}
        </div>

        {viewMode === "gantt" && !loading ? (
          <AdminGanttView requests={requests} />
        ) : (
        <div className="rounded-lg border border-border/60 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl bg-muted/60">
                <FileText className="size-5 text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Nenhum pedido ainda</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Envie seu primeiro pedido e acompanhe orçamentos e entregas aqui.
                </p>
              </div>
              <Button size="sm" className="gap-2" onClick={() => setNewRequestOpen(true)}>
                <PlusCircle className="size-3.5" />
                Enviar pedido
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/60 bg-muted/30">
                  <TableHead className="h-9 pl-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Título</TableHead>
                  <TableHead className="h-9 hidden sm:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</TableHead>
                  <TableHead className="h-9 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</TableHead>
                  <TableHead className="h-9 hidden md:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wide">Criado</TableHead>
                  <TableHead className="h-9 hidden lg:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prazo</TableHead>
                  <TableHead className="h-9 w-8 pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <ClientRequestContextMenu
                    key={req.id}
                    request={req}
                    onUpdated={(updated) =>
                      setRequests((prev) => prev.map((r) => r.id === updated.id ? { ...r, ...updated } : r))
                    }
                  >
                    <TableRow
                      className="cursor-pointer transition-colors hover:bg-muted/30 border-b border-border/40 last:border-0"
                      onClick={() => { window.location.href = `/dashboard/requests/${req.id}`; }}
                    >
                      <TableCell className="pl-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span className={req.status === "cancelled" ? "line-through text-muted-foreground" : ""}>
                            {req.title}
                          </span>
                          {req.status === "quoted" && (
                            <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded font-semibold animate-pulse leading-none">
                              AÇÃO
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell py-3 text-sm text-muted-foreground">
                        {TYPE_LABELS[req.type]}
                      </TableCell>
                      <TableCell className="py-3">
                        <StatusPill status={req.status} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-3 text-sm text-muted-foreground">
                        {new Date(req.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" })}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell py-3 text-sm">
                        {req.delivery_deadline ? (
                          <span className="text-orange-400 font-medium">
                            {new Date(req.delivery_deadline).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                      <TableCell className="pr-4 py-3">
                        <ChevronRight className="size-4 text-muted-foreground/40" />
                      </TableCell>
                    </TableRow>
                  </ClientRequestContextMenu>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

