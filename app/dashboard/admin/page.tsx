"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/dashboard/auth-provider";
import { LoginOverlay } from "@/components/dashboard/login-overlay";
import { getAllRequests, isAdminEmail } from "@/lib/dashboard-data";
import type { Request, RequestStatus } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProgressCircle } from "@/components/dashboard/circle";
import {
  Loader2, ShieldCheck, FileText, DollarSign,
  Rocket, Clock, Plus, List, Table2, GanttChart,
  ChevronDown, ChevronRight, Circle, CheckCircle2, Timer, Filter,
} from "lucide-react";
import { getRequestTasks, updateRequestTask, getRequestsProgress } from "@/lib/dashboard-data";
import type { RequestTask } from "@/lib/database.types";
import { AdminRequestsTable } from "@/components/dashboard/admin-requests-table";
import { AdminGanttView } from "@/components/dashboard/admin-gantt-view";
import { PriorityIcon } from "@/components/dashboard/priority-icon";
import { RequestContextMenu } from "@/components/dashboard/request-context-menu";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RevenueMonthCard } from "@/components/dashboard/revenue-month-card";

/* ─── constants ─────────────────────────────────────────────────────────── */

const STATUS_LABELS: Record<RequestStatus, string> = {
  submitted:   "Enviada",
  reviewing:   "Em análise",
  quoted:      "Orçada",
  approved:    "Aprovada",
  rejected:    "Rejeitada",
  in_progress: "Em progresso",
  delivered:   "Concluído",
  cancelled:   "Cancelada",
};

const STATUS_DOT: Record<RequestStatus, string> = {
  submitted:   "bg-blue-500",
  reviewing:   "bg-amber-500",
  quoted:      "bg-purple-500",
  approved:    "bg-green-500",
  rejected:    "bg-red-500",
  in_progress: "bg-orange-500",
  delivered:   "bg-emerald-500",
  cancelled:   "bg-neutral-500",
};

const STATUS_BADGE: Record<RequestStatus, string> = {
  submitted:   "bg-blue-500/15 text-blue-400 border-blue-500/25",
  reviewing:   "bg-amber-500/15 text-amber-400 border-amber-500/25",
  quoted:      "bg-purple-500/15 text-purple-400 border-purple-500/25",
  approved:    "bg-green-500/15 text-green-400 border-green-500/25",
  rejected:    "bg-red-500/15 text-red-400 border-red-500/25",
  in_progress: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  delivered:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  cancelled:   "bg-neutral-500/15 text-neutral-400 border-neutral-500/25",
};

const STATUS_TEXT: Record<RequestStatus, string> = {
  submitted:   "text-blue-400",
  reviewing:   "text-amber-400",
  quoted:      "text-purple-400",
  approved:    "text-green-400",
  rejected:    "text-red-400",
  in_progress: "text-orange-400",
  delivered:   "text-emerald-400",
  cancelled:   "text-neutral-400",
};

const TYPE_LABELS: Record<string, string> = {
  feature: "Nova funcionalidade", bug_fix: "Correção de bug", integration: "Integração",
  maintenance: "Manutenção", redesign: "Redesign / UI", full_system: "Sistema completo / SaaS", other: "Outro"
};

/* status order for groups */
const GROUP_ORDER: RequestStatus[] = [
  "submitted", "reviewing", "quoted", "approved",
  "in_progress", "delivered", "rejected", "cancelled",
];

type ViewMode = "list" | "table" | "gantt";
const ALL_STATUSES: Array<RequestStatus | "all"> = [
  "all", "submitted", "reviewing", "quoted", "approved", "in_progress", "delivered", "rejected",
];

/* ─── grouped list view ─────────────────────────────────────────────────── */

const COLS = "grid-cols-[28px_2fr_100px_100px_130px_90px_110px_80px]";

/** Formata datas tanto date-only ("YYYY-MM-DD") quanto ISO datetime. */
const fmt = (d: string | null) => {
  if (!d) return "—";
  const date = d.length > 10 ? new Date(d) : new Date(d + "T12:00:00");
  return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

const daysLeft = (d: string | null) => {
  if (!d) return null;
  return Math.ceil((new Date(d + "T12:00:00").getTime() - Date.now()) / 86400000);
};

/** Atraso em dias na data de conclusão (não aumenta depois de concluído). */
const delayAtCompletion = (dueDate: string | null, completedAt: string | null) => {
  if (!dueDate || !completedAt) return null;
  const due = new Date(dueDate + "T12:00:00").getTime();
  const done = new Date(completedAt).getTime();
  const days = Math.ceil((done - due) / 86400000);
  return days > 0 ? days : 0;
};

function GroupedList({ requests: initialRequests }: { requests: Request[] }) {
  const router = useRouter();
  const [localRequests, setLocalRequests] = useState<Request[]>(initialRequests);
  const [collapsed,    setCollapsed]   = useState<Set<RequestStatus>>(new Set());
  const [expandedIds,  setExpandedIds] = useState<Set<string>>(new Set());
  const [tasksByReq,   setTasksByReq]  = useState<Record<string, RequestTask[]>>({});
  const [loadingIds,   setLoadingIds]  = useState<Set<string>>(new Set());
  /** Progresso leve: carregado 1× ao montar via query bulk. */
  const [progressMap,  setProgressMap] = useState<Record<string, { total: number; done: number }>>({});

  /* Sincroniza quando props mudam */
  useEffect(() => { setLocalRequests(initialRequests); }, [initialRequests]);

  const handleUpdated = (updated: Request) => {
    setLocalRequests((prev) => prev.map((r) => r.id === updated.id ? { ...r, ...updated } : r));
  };

  /* Substitui referência de requests para usar estado local */
  const requests = localRequests;

  /* Carrega progresso de todas as requests em uma única query ao montar/atualizar */
  useEffect(() => {
    const ids = requests.map((r) => r.id);
    if (ids.length === 0) return;
    getRequestsProgress(ids).then(setProgressMap).catch(() => {});
  }, [requests]);

  const grouped = GROUP_ORDER.reduce<Record<RequestStatus, Request[]>>(
    (acc, s) => { acc[s] = requests.filter((r) => r.status === s); return acc; },
    {} as Record<RequestStatus, Request[]>
  );

  const toggleExpand = async (reqId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(reqId)) next.delete(reqId);
      else next.add(reqId);
      return next;
    });
    if (!(reqId in tasksByReq) && !loadingIds.has(reqId)) {
      setLoadingIds((prev) => new Set(prev).add(reqId));
      try {
        const tasks = await getRequestTasks(reqId);
        setTasksByReq((prev) => ({ ...prev, [reqId]: tasks }));
        /* Atualiza progressMap com dados exatos das tasks recém carregadas */
        const done = tasks.filter((t) => t.status === "done").length;
        setProgressMap((prev) => ({ ...prev, [reqId]: { total: tasks.length, done } }));
      } finally {
        setLoadingIds((prev) => { const n = new Set(prev); n.delete(reqId); return n; });
      }
    }
  };

  const toggleTask = async (reqId: string, task: RequestTask, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === "done" ? "todo" : "done";
    const delta = newStatus === "done" ? 1 : -1;
    /* Otimista: atualiza tasks + progressMap simultaneamente */
    setTasksByReq((prev) => ({
      ...prev,
      [reqId]: prev[reqId].map((t) => t.id === task.id ? { ...t, status: newStatus } : t),
    }));
    setProgressMap((prev) => {
      const curr = prev[reqId] ?? { total: 0, done: 0 };
      return { ...prev, [reqId]: { ...curr, done: curr.done + delta } };
    });
    try {
      await updateRequestTask(task.id, { status: newStatus });
    } catch {
      /* Reverte em caso de erro */
      setTasksByReq((prev) => ({
        ...prev,
        [reqId]: prev[reqId].map((t) => t.id === task.id ? { ...t, status: task.status } : t),
      }));
      setProgressMap((prev) => {
        const curr = prev[reqId] ?? { total: 0, done: 0 };
        return { ...prev, [reqId]: { ...curr, done: curr.done - delta } };
      });
    }
  };

  return (
    <div className="space-y-6">
      {GROUP_ORDER.map((statusKey) => {
        const rows = grouped[statusKey];
        if (rows.length === 0) return null;
        const isCollapsed = collapsed.has(statusKey);

        return (
          <div key={statusKey} className="overflow-hidden rounded-xl border border-border/60">
            {/* ── group header ── */}
            <button
              type="button"
              onClick={() => setCollapsed((prev) => {
                const next = new Set(prev);
                if (next.has(statusKey)) next.delete(statusKey);
                else next.add(statusKey);
                return next;
              })}
              className="flex w-full items-center gap-2.5 border-b border-border/60 bg-muted/30 px-4 py-2.5 hover:bg-muted/50 transition-colors"
            >
              <ChevronDown className={`size-3.5 text-muted-foreground transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
              <span className={`size-2.5 rounded-full shrink-0 ${STATUS_DOT[statusKey]}`} />
              <span className={`text-xs font-semibold uppercase tracking-wide ${STATUS_TEXT[statusKey]}`}>
                {STATUS_LABELS[statusKey]}
              </span>
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {rows.length}
              </span>
            </button>

            {!isCollapsed && (
              <>
                {/* ── column headers ── */}
                <div className={`grid ${COLS} gap-0 border-b border-border/60 bg-muted/10 px-4 py-1.5`}>
                  <span />
                  {["Nome", "Criada", "Entrega", "Status", "Tipo", "Cliente", "Budget"].map((h) => (
                    <span key={h} className="text-[11px] font-medium text-muted-foreground/70">{h}</span>
                  ))}
                </div>

                {/* ── rows ── */}
                {rows.map((req) => {
                  const profile    = req.profiles as { full_name?: string; email?: string } | undefined;
                  const clientName = profile?.full_name ?? profile?.email ?? "—";
                  const isDelivered = req.status === "delivered" && req.delivered_at;
                  const dl = isDelivered ? null : daysLeft(req.delivery_deadline);
                  const deliveredDelay = isDelivered && req.delivery_deadline && req.delivered_at
                    ? delayAtCompletion(req.delivery_deadline, req.delivered_at) : null;
                  const overdue = !isDelivered && dl !== null && dl < 0;
                  const soon = !isDelivered && dl !== null && dl >= 0 && dl <= 3;
                  const isExpanded = expandedIds.has(req.id);
                  const isLoading  = loadingIds.has(req.id);
                  const tasks      = tasksByReq[req.id] ?? [];
                  const hasFetched = req.id in tasksByReq;
                  const prog       = progressMap[req.id];
                  const pct        = prog && prog.total > 0 ? Math.round((prog.done / prog.total) * 100) : 0;
                  const doneTasks  = prog?.done ?? 0;

                  return (
                    <div key={req.id} className="border-b border-border/40 last:border-0">
                      {/* ── request row ── */}
                      <RequestContextMenu request={req} onUpdated={handleUpdated}>
                      <div
                        className={`grid ${COLS} items-center gap-0 px-4 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer`}
                        onClick={() => router.push(`/dashboard/admin/requests/${req.id}`)}
                      >
                        {/* chevron expand */}
                        <button
                          type="button"
                          onClick={(e) => toggleExpand(req.id, e)}
                          className="flex items-center justify-center rounded hover:bg-muted/60 p-0.5 transition-colors"
                        >
                          {isLoading
                            ? <Loader2 className="size-3 animate-spin text-muted-foreground" />
                            : isExpanded
                              ? <ChevronDown className="size-3 text-muted-foreground" />
                              : <ChevronRight className="size-3 text-muted-foreground" />
                          }
                        </button>

                        {/* Nome + progresso (usa progressMap carregado no mount) */}
                        <span className="flex min-w-0 items-center gap-2.5 pr-4">
                          <ProgressCircle pct={pct} size={16} />
                          <span className="truncate text-sm font-medium">{req.title}</span>
                          <Button type="button" variant="ghost" size="icon" className="shrink-0 size-8 text-neutral-100 dark:text-neutral-200">
                            <PriorityIcon priority={req.priority ?? 2} size={14} />
                          </Button>
                        </span>

                        <span className="text-xs text-muted-foreground">{fmt(req.created_at)}</span>

                        <span className={`text-xs font-medium ${isDelivered ? "text-muted-foreground" : overdue ? "text-red-400" : soon ? "text-amber-400" : "text-muted-foreground"}`}>
                          {fmt(req.delivery_deadline)}
                          {isDelivered && req.delivery_deadline
                            ? (deliveredDelay !== null && deliveredDelay > 0 ? ` (Entregue +${deliveredDelay}d)` : " (Entregue)")
                            : dl !== null && req.delivery_deadline && (overdue ? ` (${Math.abs(dl)}d)` : dl === 0 ? " (hoje)" : "")}
                        </span>

                        <span className={`inline-flex w-fit items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[req.status]}`}>
                          <span className={`size-1.5 rounded-full ${STATUS_DOT[req.status]}`} />
                          {STATUS_LABELS[req.status]}
                        </span>

                        <span className="truncate text-xs text-neutral-100 dark:text-neutral-200">{TYPE_LABELS[req.type]}</span>

                        <span className="flex items-center gap-1.5 truncate">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-primary uppercase">
                            {clientName.charAt(0)}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">{clientName.split(" ")[0]}</span>
                        </span>

                        <span className="text-xs font-medium text-foreground">{req.budget ?? "—"}</span>
                      </div>
                      </RequestContextMenu>

                      {/* ── subtasks ── */}
                      {isExpanded && (
                        <div className="border-t border-border/30 bg-muted/5">
                          {isLoading && (
                            <div className="flex items-center gap-2 px-12 py-2 text-xs text-muted-foreground/50">
                              <Loader2 className="size-3 animate-spin" /> Carregando etapas...
                            </div>
                          )}

                          {!isLoading && hasFetched && tasks.length === 0 && (
                            <div className="px-12 py-2.5 text-xs text-muted-foreground/40">
                              Sem etapas cadastradas. Acesse o planejamento para criá-las.
                            </div>
                          )}

                          {!isLoading && tasks.map((task) => {
                            const isDone   = task.status === "done";
                            const isInProg = task.status === "in_progress";
                            const tdl = isDone ? null : daysLeft(task.due_date);
                            const taskDelayDone = isDone && task.due_date && task.updated_at
                              ? delayAtCompletion(task.due_date, task.updated_at) : null;
                            const tOverdue = !isDone && tdl !== null && tdl < 0;
                            const tSoon = !isDone && tdl !== null && tdl >= 0 && tdl <= 3;

                            return (
                              /* Mesmo grid do row pai → alinha colunas perfeitamente */
                              <div
                                key={task.id}
                                className={`grid ${COLS} items-center gap-0 border-t border-border/20 px-4 py-1 hover:bg-muted/20 transition-colors`}
                              >
                                {/* col 0: botão toggle */}
                                <button
                                  type="button"
                                  onClick={(e) => toggleTask(req.id, task, e)}
                                  className="flex items-center justify-center transition-opacity hover:opacity-70"
                                  title={isDone ? "Marcar como pendente" : "Marcar como concluído"}
                                >
                                  {isDone
                                    ? <CheckCircle2 className="size-3.5 text-emerald-500" />
                                    : isInProg
                                      ? <Timer className="size-3.5 text-orange-400" />
                                      : <Circle className="size-3.5 text-muted-foreground/30" />
                                  }
                                </button>

                                {/* col 1: título */}
                                <span className={`truncate pl-4 pr-4 text-xs ${isDone ? "line-through text-muted-foreground/40" : "text-foreground/70"}`}>
                                  {task.title}
                                </span>

                                {/* col 2: Criada — vazio */}
                                <span />

                                {/* col 3: Entrega — alinhado com cabeçalho */}
                                <span className={`text-[11px] font-medium ${
                                  isDone     ? "text-muted-foreground/30"
                                  : tOverdue ? "text-red-400"
                                  : tSoon    ? "text-amber-400"
                                  : "text-muted-foreground/50"
                                }`}>
                                  {task.due_date ? fmt(task.due_date) : ""}
                                  {isDone && task.due_date
                                    ? (taskDelayDone !== null && taskDelayDone > 0 ? ` (concluído +${taskDelayDone}d)` : " (concluído)")
                                    : !isDone && tdl !== null && task.due_date && (
                                        tOverdue ? ` (${Math.abs(tdl)}d)` : tdl === 0 ? " (hoje)" : ""
                                      )}
                                </span>

                                {/* col 4-7: vazios */}
                                <span /><span /><span /><span />
                              </div>
                            );
                          })}

                          {/* resumo de progresso */}
                          {!isLoading && tasks.length > 0 && (
                            <div className="flex items-center gap-2 border-t border-border/20 px-4 py-1.5">
                              <div className="ml-7 h-1 flex-1 overflow-hidden rounded-full bg-muted/40">
                                <div
                                  className="h-full rounded-full bg-emerald-500 transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground/50">
                                {doneTasks}/{tasks.length} concluídas
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* totals footer */}
                <div className={`grid ${COLS} border-t border-border/40 bg-muted/5 px-4 py-1.5`}>
                  {Array.from({ length: 7 }).map((_, i) => <span key={i} />)}
                  <span className="text-xs font-semibold text-foreground">
                    {rows.filter((r) => r.budget).length > 0
                      ? rows.filter((r) => r.budget).map((r) => r.budget!).join(", ").substring(0, 12) + (rows.length > 1 ? "…" : "")
                      : "—"}
                  </span>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── page ──────────────────────────────────────────────────────────────── */

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<RequestStatus | "all">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const isAdmin = isAdminEmail(user?.email);

  useEffect(() => {
    if (!user || !isAdmin) return;
    getAllRequests()
      .then(setRequests)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, isAdmin]);

  if (authLoading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  if (!user) return <LoginOverlay />;
  if (!isAdmin)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <ShieldCheck className="size-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          Acesso restrito a administradores.
        </p>
      </div>
    );

  const filtered =
    filter === "all"
      ? requests
      : requests.filter((r) => r.status === filter);

  /* Comparação mês a mês: limites do mês atual e do anterior */
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const inThisMonth = (d: string) => new Date(d) >= thisMonthStart;
  const inLastMonth = (d: string) => {
    const t = new Date(d);
    return t >= lastMonthStart && t < thisMonthStart;
  };

  const total = requests.length;
  const totalThisMonth = requests.filter((r) => inThisMonth(r.created_at)).length;
  const totalLastMonth = requests.filter((r) => inLastMonth(r.created_at)).length;
  const submittedCount = requests.filter((r) => r.status === "submitted").length;
  const submittedThisMonth = requests.filter((r) => r.status === "submitted" && inThisMonth(r.created_at)).length;
  const submittedLastMonth = requests.filter((r) => r.status === "submitted" && inLastMonth(r.created_at)).length;
  const quotedCount = requests.filter((r) => r.status === "quoted").length;
  const quotedThisMonth = requests.filter((r) => r.status === "quoted" && inThisMonth(r.created_at)).length;
  const quotedLastMonth = requests.filter((r) => r.status === "quoted" && inLastMonth(r.created_at)).length;
  const inProgressCount = requests.filter((r) => r.status === "in_progress").length;
  const deliveredThisMonth = requests.filter((r) => r.status === "delivered" && inThisMonth(r.delivered_at ?? r.updated_at)).length;
  const deliveredLastMonth = requests.filter((r) => r.status === "delivered" && inLastMonth(r.delivered_at ?? r.updated_at)).length;

  const deltaPct = (curr: number, prev: number) =>
    prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);
  const deltaLabel = (curr: number, prev: number) => {
    const pct = deltaPct(curr, prev);
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${curr - prev} (${sign}${pct}%)`;
  };

  const statCards = [
    {
      label: "Total de solicitações",
      value: total,
      description: `${totalThisMonth} criadas este mês`,
      mom: deltaLabel(totalThisMonth, totalLastMonth),
      momUp: totalThisMonth >= totalLastMonth,
      icon: FileText,
      iconBg: "bg-neutral-100 dark:bg-neutral-800",
      iconColor: "text-neutral-600 dark:text-neutral-400",
      barColor: "bg-neutral-400/30",
    },
    {
      label: "Novas (aguardando análise)",
      value: submittedCount,
      description: `${submittedThisMonth} enviadas este mês`,
      mom: deltaLabel(submittedThisMonth, submittedLastMonth),
      momUp: submittedThisMonth >= submittedLastMonth,
      icon: Clock,
      iconBg: "bg-blue-100 dark:bg-blue-950/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      barColor: "bg-blue-400/40",
    },
    {
      label: "Orçadas (aguardando cliente)",
      value: quotedCount,
      description: `${quotedThisMonth} orçadas este mês`,
      mom: deltaLabel(quotedThisMonth, quotedLastMonth),
      momUp: quotedThisMonth >= quotedLastMonth,
      icon: DollarSign,
      iconBg: "bg-purple-100 dark:bg-purple-950/50",
      iconColor: "text-purple-600 dark:text-purple-400",
      barColor: "bg-purple-400/40",
    },
    {
      label: "Em progresso",
      value: inProgressCount,
      description: `${inProgressCount} ativas agora · ${deliveredThisMonth} concluídas este mês`,
      mom: `Concluídas: ${deltaLabel(deliveredThisMonth, deliveredLastMonth)} vs mês anterior`,
      momUp: deliveredThisMonth >= deliveredLastMonth,
      icon: Rocket,
      iconBg: "bg-orange-100 dark:bg-orange-950/50",
      iconColor: "text-orange-600 dark:text-orange-400",
      barColor: "bg-orange-400/40",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg border bg-muted">
          <ShieldCheck className="size-4 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Admin</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie solicitações, especifique e envie orçamentos.
          </p>
        </div>
      </div>

      {/* stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card
            key={s.label}
            className="overflow-hidden border-border/80 bg-card hover:border-border hover:shadow-md/50 transition-all duration-200"
          >
            <CardContent className="p-0">
              <div className="relative flex flex-col gap-4 p-5">
                <div className={`absolute left-0 top-5 bottom-5 w-1 rounded-r-full ${s.barColor}`} aria-hidden />
                <div className="flex items-start justify-between gap-3 pl-1">
                  <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${s.iconBg} ${s.iconColor}`}>
                    <s.icon className="size-5" strokeWidth={2} />
                  </div>
                  <span className={`text-3xl font-bold tabular-nums tracking-tight ${s.iconColor}`}>
                    {s.value}
                  </span>
                </div>
                <div className="space-y-1.5 pl-1">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    {s.label}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {s.description}
                  </p>
                  <p className={`text-[11px] font-medium ${s.momUp ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                    {s.mom}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue — linha 75% + radar por tipo 25% */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="border-border/80 bg-card lg:col-span-3">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-sm font-semibold">Receita — últimos 12 meses</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <RevenueChart requests={requests} months={12} />
          </CardContent>
        </Card>
        <div className="min-h-[200px] lg:min-h-0">
          <RevenueMonthCard requests={requests} />
        </div>
      </div>

      {/* toolbar — sticky abaixo do header do layout (h-14 = 56px) */}
      <div className="sticky top-14 z-20 -mx-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-background/95 px-6 py-3 backdrop-blur-sm">
        {/* filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-8">
              <Filter className="size-3.5" />
              {filter === "all" ? "Todas" : STATUS_LABELS[filter]}
              <span className="ml-0.5 text-muted-foreground/60">
                {filter === "all" ? requests.length : requests.filter((r) => r.status === filter).length}
              </span>
              <ChevronDown className="size-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuItem
              onSelect={() => setFilter("all")}
              className="flex items-center justify-between"
            >
              <span className={filter === "all" ? "font-semibold" : ""}>Todas</span>
              <span className="text-xs text-muted-foreground">{requests.length}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {(ALL_STATUSES.filter((s) => s !== "all") as RequestStatus[]).map((s) => {
              const count = requests.filter((r) => r.status === s).length;
              if (count === 0) return null;
              return (
                <DropdownMenuItem
                  key={s}
                  onSelect={() => setFilter(s)}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex items-center gap-2">
                    <span className={`size-2 rounded-full shrink-0 ${STATUS_DOT[s]}`} />
                    <span className={filter === s ? "font-semibold" : ""}>{STATUS_LABELS[s]}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{count}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* view toggle */}
        <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
          {(
            [
              { id: "list"  as const, label: "Lista",  Icon: List },
              { id: "table" as const, label: "Tabela", Icon: Table2 },
              { id: "gantt" as const, label: "Gantt",  Icon: GanttChart },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                viewMode === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Plus className="size-8 opacity-20" />
          <p className="text-sm">Nenhuma solicitação aqui.</p>
        </div>
      ) : viewMode === "table" ? (
        <AdminRequestsTable requests={filtered} />
      ) : viewMode === "gantt" ? (
        <div className="w-full min-w-0 max-w-full overflow-hidden">
          <AdminGanttView requests={filtered} />
        </div>
      ) : (
        <GroupedList requests={filtered} />
      )}
    </div>
  );
}

