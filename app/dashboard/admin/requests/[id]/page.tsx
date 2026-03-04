"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/dashboard/auth-provider";
import { LoginOverlay } from "@/components/dashboard/login-overlay";
import {
  getRequestById,
  getRequestTasks,
  updateRequestAsAdmin,
  createRequestTask,
  updateRequestTask,
  deleteRequestTask,
  getAllProfiles,
  changeRequestClient,
} from "@/lib/dashboard-data";
import { isAdminEmail } from "@/lib/admin-helpers";
import type { Profile, Request, RequestStatus, RequestTask, RequestType } from "@/lib/database.types";
import { RequestChat } from "@/components/dashboard/request-chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Check,
  CalendarDays,
  DollarSign,
  Clock,
  AlignLeft,
  User2,
  Tag,
  ShieldCheck,
  Send,
  Pencil,
  X,
  ChevronRight,
  ListChecks,
  CircleDot,
  Banknote,
  CheckCircle2,
  ChevronDown,
  Flag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProgressCircle } from "@/components/dashboard/circle";
import { PriorityIcon } from "@/components/dashboard/priority-icon";

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

const STATUS_COLOR: Record<RequestStatus, string> = {
  submitted:   "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  reviewing:   "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  quoted:      "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  approved:    "bg-green-500/15 text-green-400 border border-green-500/30",
  rejected:    "bg-red-500/15 text-red-400 border border-red-500/30",
  in_progress: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  delivered:   "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  cancelled:   "bg-neutral-500/15 text-neutral-400 border border-neutral-500/30",
};

const STATUS_DOT: Record<RequestStatus, string> = {
  submitted:   "bg-blue-400",
  reviewing:   "bg-amber-400",
  quoted:      "bg-purple-400",
  approved:    "bg-green-400",
  rejected:    "bg-red-400",
  in_progress: "bg-orange-400",
  delivered:   "bg-emerald-400",
  cancelled:   "bg-neutral-400",
};

const PRIORITY_BG: Record<number, string> = {
  1: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  2: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  3: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const TYPE_LABELS: Record<string, string> = {
  feature:     "Nova funcionalidade",
  bug_fix:     "Correção de bug",
  integration: "Integração",
  maintenance: "Manutenção",
  redesign:    "Redesign / UI",
  full_system: "Sistema completo / SaaS",
  other:       "Outro",
};

const PRIORITY_LABELS: Record<number, string> = { 1: "Baixa", 2: "Média", 3: "Alta" };
const PRIORITY_COLOR:  Record<number, string>  = {
  1: "text-slate-400",
  2: "text-yellow-500",
  3: "text-red-500",
};


/* ─── field cell — usado nas linhas de 2 colunas ────────────────────────── */
function FieldCell({
  icon: Icon,
  customIcon,
  label,
  children,
}: {
  icon?: React.ElementType;
  customIcon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-0 px-4 py-3 hover:bg-muted/30 transition-colors cursor-default">
      <span className="flex w-28 shrink-0 items-center gap-2 text-sm text-muted-foreground select-none">
        {customIcon ?? (Icon ? <Icon className="size-4 shrink-0" /> : null)}
        {label}
      </span>
      <div className="flex min-w-0 flex-1 items-center">{children}</div>
    </div>
  );
}

/* ─── custom field row ──────────────────────────────────────────────────── */
function CFRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[220px_1fr] items-center border-b border-border/60 last:border-0 hover:bg-muted/30 cursor-default">
      <span className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground select-none border-r border-border/60">
        <Icon className="size-4 shrink-0" />
        {label}
      </span>
      <div className="px-4 py-3 text-sm">{children}</div>
    </div>
  );
}

/* ─── inline text edit ──────────────────────────────────────────────────── */
function InlineText({
  value,
  onChange,
  placeholder = "—",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  function commit() { onChange(draft); setEditing(false); }

  if (editing)
    return (
      <input
        ref={ref}
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter")  commit();
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        className={`w-full border-0 bg-transparent p-0 text-sm outline-none focus:ring-0 ${className}`}
      />
    );

  return (
    <button
      type="button"
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`text-left text-sm ${value ? "text-foreground" : "text-muted-foreground/50"} hover:text-primary transition-colors ${className}`}
    >
      {value || placeholder}
    </button>
  );
}

/* ─── inline date edit ──────────────────────────────────────────────────── */
function InlineDate({
  value,
  onChange,
  placeholder = "Definir data",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const fmt = (d: string) =>
    d
      ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : null;

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => ref.current?.showPicker?.()}
        className={`text-sm ${value ? "text-foreground hover:text-primary" : "text-muted-foreground/50 hover:text-primary"} transition-colors`}
      >
        {fmt(value) ?? placeholder}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        >
          <X className="size-3" />
        </button>
      )}
      <input
        ref={ref}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-0 w-0 opacity-0 [color-scheme:dark]"
        tabIndex={-1}
      />
    </div>
  );
}

/* ─── page ──────────────────────────────────────────────────────────────── */
export default function AdminRequestPlanningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }                         = use(params);
  const { user, loading: authLoading } = useAuth();
  const [request, setRequest]          = useState<Request | null>(null);
  const [tasks,   setTasks]            = useState<RequestTask[]>([]);
  const [profiles, setProfiles]        = useState<Profile[]>([]);
  const [loading, setLoading]          = useState(true);
  const [saving,  setSaving]           = useState(false);
  const [saveError, setSaveError]      = useState<string | null>(null);
  const [changingClient, setChangingClient] = useState(false);
  const [sidebarOpen, setSidebarOpen]  = useState(true);

  /* Em mobile inicia colapsada para priorizar o conteúdo; usuário expande se quiser */
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) setSidebarOpen(false);
  }, []);

  const [form, setForm] = useState({
    title:             "",
    description:       "",
    priority:          2 as 1 | 2 | 3,
    type:              "feature" as RequestType,
    budget:            "",
    payment_deadline:  "",
    delivery_deadline: "",
    admin_notes:       "",
  });
  const [status, setStatus] = useState<RequestStatus>("submitted");

  /* Refs para sempre ler o valor atual sem stale closure */
  const formRef   = useRef(form);
  const statusRef = useRef<RequestStatus>("submitted");
  useEffect(() => { formRef.current = form; }, [form]);
  useEffect(() => { statusRef.current = status; }, [status]);

  const [newTitle,   setNewTitle]   = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [adding,     setAdding]     = useState(false);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [editDraft,  setEditDraft]  = useState("");
  const [editDue,    setEditDue]    = useState("");
  const [editType,   setEditType]   = useState<RequestType>("feature");
  const [editPriority, setEditPriority] = useState<1 | 2 | 3>(2);

  const isAdmin = isAdminEmail(user?.email);

  useEffect(() => {
    if (!user || !isAdmin) return;
    Promise.all([getRequestById(id), getRequestTasks(id), getAllProfiles()])
      .then(([req, list, profileList]) => {
        if (req) {
          setRequest(req);
          setForm({
            title:             req.title,
            description:       req.description,
            priority:          (req.priority as 1 | 2 | 3),
            type:              req.type as RequestType,
            budget:            req.budget ?? "",
            payment_deadline:  req.payment_deadline ?? "",
            delivery_deadline: req.delivery_deadline ?? "",
            admin_notes:       req.admin_notes ?? "",
          });
          setStatus(req.status);
        }
        setTasks(list ?? []);
        setProfiles(profileList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, isAdmin, id]);

  async function handleChangeClient(profileId: string) {
    if (!request || profileId === request.user_id) return;
    setChangingClient(true);
    try {
      const updated = await changeRequestClient(request.id, profileId);
      setRequest(updated);
    } catch (e) { console.error(e); }
    finally { setChangingClient(false); }
  }

  const save = useCallback(async (overrideStatus?: RequestStatus) => {
    if (!request) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        ...formRef.current,
        status: overrideStatus ?? statusRef.current,
      };
      const updated = await updateRequestAsAdmin(request.id, payload);
      setRequest(updated);
      if (overrideStatus) setStatus(overrideStatus);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao salvar.";
      setSaveError(msg);
      console.error(e);
    }
    finally { setSaving(false); }
  }, [request]);

  async function sendQuote() {
    await save("quoted");
  }

  async function markAsPaid() {
    if (!request) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateRequestAsAdmin(request.id, {
        paid_manually: true,
        paid_at: new Date().toISOString(),
        status: "approved",
      });
      setRequest(updated);
      setStatus("approved");
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Erro ao marcar como pago.");
    } finally {
      setSaving(false);
    }
  }

  async function addTask() {
    if (!request || !newTitle.trim()) return;
    setAdding(true);
    try {
      const t = await createRequestTask({
        request_id: request.id,
        title:      newTitle.trim(),
        position:   tasks.length,
        due_date:   newDueDate || null,
        type:       "feature",
        priority:   2,
      });
      setTasks((p) => [...p, t]);
      setNewTitle("");
      setNewDueDate("");
    } catch (e) { console.error(e); }
    finally { setAdding(false); }
  }

  async function patchTask(taskId: string, patch: Partial<RequestTask>) {
    const updated = await updateRequestTask(taskId, patch);
    setTasks((p) => p.map((t) => (t.id === taskId ? updated : t)));
    setEditingId(null);
  }

  async function removeTask(taskId: string) {
    await deleteRequestTask(taskId);
    setTasks((p) => p.filter((t) => t.id !== taskId));
  }

  /* guards */
  if (authLoading)
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>;
  if (!user) return <LoginOverlay />;
  if (!isAdmin)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <ShieldCheck className="size-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Acesso restrito a administradores.</p>
      </div>
    );
  if (loading || !request)
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>;

  const profile    = request.profiles as { name?: string; email?: string } | undefined;
  const clientName = profile?.name ?? profile?.email ?? "—";
  const doneTasks  = tasks.filter((t) => t.status === "done").length;

  const fmtDate = (d: string | null) =>
    d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : null;

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

  return (
    <div className="flex min-h-0 flex-1 -m-6 -mt-4 flex-col md:flex-row">

      {/* ═══ MAIN ══════════════════════════════════════════════════════════ */}
      <main className="min-w-0 flex-1 overflow-auto bg-background">
        <div className="mx-auto max-w-5xl w-full px-6 py-8">

          {/* back / breadcrumb */}
          <div className="mb-5 flex items-center gap-2">
            <Button variant="ghost" size="sm" className="-ml-2 h-7 gap-1.5 text-muted-foreground" asChild>
              <Link href="/dashboard/admin">
                <ArrowLeft className="size-3.5" /> Admin
              </Link>
            </Button>
            <span className="text-muted-foreground/40">/</span>
            <span className="truncate text-sm text-muted-foreground">{request.title}</span>
          </div>

          {/* ── HEADER: título ── */}
          <div className="mb-7">
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <CircleDot className="size-3.5" />
              <span>Solicitação</span>
              <span className="text-muted-foreground/40">·</span>
              <ListChecks className="size-3.5" />
              <span>{doneTasks}/{tasks.length} etapas concluídas</span>
            </div>
            <textarea
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              onBlur={() => save()}
              rows={1}
              placeholder="Título da solicitação"
              className="w-full resize-none bg-transparent text-[1.75rem] font-bold leading-tight text-foreground outline-none placeholder:text-muted-foreground/40 focus:ring-0"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
          </div>

          {/* ── FIELD ROWS — 2 colunas igual ClickUp ── */}
          <div className="mb-7 rounded-xl border border-border/60 bg-card">
            {/* linha 1: Status | Cliente */}
            <div className="grid grid-cols-2 divide-x divide-border/60 border-b border-border/60">
              <FieldCell
                customIcon={
                  <ProgressCircle
                    pct={tasks.length === 0 ? 0 : Math.round((doneTasks / tasks.length) * 100)}
                    size={16}
                  />
                }
                label="Status"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={`group flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold outline-none transition-opacity hover:opacity-80 ${STATUS_COLOR[status]}`}
                    >
                      <span className={`size-1.5 rounded-full ${STATUS_DOT[status]}`} />
                      {STATUS_LABELS[status]}
                      <ChevronDown className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 p-1.5">
                    {(Object.keys(STATUS_LABELS) as RequestStatus[]).map((s) => (
                      <DropdownMenuItem
                        key={s}
                        className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm cursor-pointer ${s === status ? "bg-white/5" : ""}`}
                        onSelect={() => { setStatus(s); save(s); }}
                      >
                        <span className={`size-2 rounded-full shrink-0 ${STATUS_DOT[s]}`} />
                        <span className={`flex-1 text-xs font-medium ${s === status ? "text-zinc-100" : "text-zinc-400"}`}>
                          {STATUS_LABELS[s]}
                        </span>
                        {s === status && <Check className="size-3.5 text-zinc-400 shrink-0" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </FieldCell>
              <FieldCell icon={User2} label="Cliente">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      disabled={changingClient}
                      className="group flex items-center gap-2 rounded-md px-1.5 py-1 text-sm outline-none transition-colors hover:bg-white/5 disabled:opacity-50"
                    >
                      {changingClient ? (
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      ) : (
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary uppercase">
                          {clientName.charAt(0)}
                        </span>
                      )}
                      <span className="truncate font-medium">{clientName}</span>
                      <ChevronDown className="size-3 text-muted-foreground/50 shrink-0 group-hover:text-muted-foreground transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-60 p-1.5">
                    {profiles.map((p) => {
                      const name = p.name ?? p.email ?? "—";
                      const isCurrent = request.user_id === p.id;
                      return (
                        <DropdownMenuItem
                          key={p.id}
                          onSelect={() => handleChangeClient(p.id)}
                          className={`flex items-center gap-2.5 rounded-md px-2 py-2 cursor-pointer ${isCurrent ? "bg-white/5" : ""}`}
                        >
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary uppercase">
                            {name.charAt(0)}
                          </span>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={`text-sm truncate ${isCurrent ? "text-zinc-100 font-medium" : "text-zinc-300"}`}>{name}</span>
                            {p.email && <span className="text-[11px] text-zinc-500 truncate">{p.email}</span>}
                          </div>
                          {isCurrent && <Check className="size-3.5 text-primary shrink-0" />}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </FieldCell>
            </div>

            {/* linha 2: Datas | Prioridade */}
            <div className="grid grid-cols-2 divide-x divide-border/60 border-b border-border/60">
              <FieldCell icon={CalendarDays} label="Datas">
                <div className="flex items-center gap-1.5 text-sm flex-wrap">
                  <InlineDate
                    value={form.payment_deadline}
                    onChange={(v) => setForm((f) => ({ ...f, payment_deadline: v }))}
                    placeholder="Início"
                  />
                  <span className="text-muted-foreground/40">→</span>
                  <InlineDate
                    value={form.delivery_deadline}
                    onChange={(v) => setForm((f) => ({ ...f, delivery_deadline: v }))}
                    placeholder="Entrega"
                  />
                  {form.delivery_deadline && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {request?.status === "delivered" && request?.delivered_at
                        ? (() => {
                            const at = delayAtCompletion(form.delivery_deadline, request.delivered_at);
                            return at !== null && at > 0 ? `(Entregue +${at}d atraso)` : "(Entregue)";
                          })()
                        : `(${daysLeft(form.delivery_deadline)}d)`}
                    </span>
                  )}
                </div>
              </FieldCell>
              <FieldCell icon={Flag} label="Prioridade">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={`group flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold outline-none transition-opacity hover:opacity-80 ${PRIORITY_BG[form.priority]}`}
                    >
                      <PriorityIcon priority={form.priority} size={12} className="shrink-0" />
                      {PRIORITY_LABELS[form.priority]}
                      <ChevronDown className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40 p-1.5">
                    {([1, 2, 3] as const).map((p) => (
                      <DropdownMenuItem
                        key={p}
                        className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 cursor-pointer ${p === form.priority ? "bg-white/5" : ""}`}
                        onSelect={() => {
                          formRef.current = { ...formRef.current, priority: p };
                          setForm((f) => ({ ...f, priority: p }));
                          save();
                        }}
                      >
                        <PriorityIcon priority={p} size={13} className={`shrink-0 ${PRIORITY_COLOR[p]}`} />
                        <span className={`flex-1 text-xs font-medium ${p === form.priority ? "text-zinc-100" : "text-zinc-400"}`}>
                          {PRIORITY_LABELS[p]}
                        </span>
                        {p === form.priority && <Check className="size-3.5 text-zinc-400 shrink-0" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </FieldCell>
            </div>

            {/* linha 3: Tipo */}
            <div className="grid grid-cols-2 divide-x divide-border/60">
              <FieldCell icon={Tag} label="Tipo">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="group flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none transition-colors hover:bg-white/5"
                    >
                      <span className="font-medium text-zinc-200">{TYPE_LABELS[form.type] ?? form.type}</span>
                      <ChevronDown className="size-3 text-muted-foreground/50 shrink-0 group-hover:text-muted-foreground transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52 p-1.5">
                    {(Object.entries(TYPE_LABELS) as [RequestType, string][]).map(([key, label]) => (
                      <DropdownMenuItem
                        key={key}
                        className={`flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer ${key === form.type ? "bg-white/5" : ""}`}
                        onSelect={() => {
                          formRef.current = { ...formRef.current, type: key };
                          setForm((f) => ({ ...f, type: key }));
                          save();
                        }}
                      >
                        <span className={`flex-1 text-xs font-medium ${key === form.type ? "text-zinc-100" : "text-zinc-400"}`}>
                          {label}
                        </span>
                        {key === form.type && <Check className="size-3.5 text-zinc-400 shrink-0" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </FieldCell>
              <div />
            </div>
          </div>

          {/* ── CUSTOM FIELDS ── */}
          <div className="mb-7">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Custom Fields</h3>
            <div className="overflow-hidden rounded-xl border border-border">

              <CFRow icon={DollarSign} label="Orçamento">
                <InlineText
                  value={form.budget}
                  onChange={(v) => { setForm((f) => ({ ...f, budget: v })); }}
                  placeholder="ex: R$ 5.000"
                />
              </CFRow>

              <CFRow icon={CalendarDays} label="Prazo de pagamento">
                <InlineDate
                  value={form.payment_deadline}
                  onChange={(v) => setForm((f) => ({ ...f, payment_deadline: v }))}
                  placeholder="Definir prazo"
                />
              </CFRow>

              <CFRow icon={Clock} label="Prazo de entrega">
                <div className="flex items-center gap-3">
                  <InlineDate
                    value={form.delivery_deadline}
                    onChange={(v) => setForm((f) => ({ ...f, delivery_deadline: v }))}
                    placeholder="Definir prazo"
                  />
                  {form.delivery_deadline && (() => {
                    const isDelivered = request?.status === "delivered" && request?.delivered_at;
                    if (isDelivered) {
                      const atraso = delayAtCompletion(form.delivery_deadline, request!.delivered_at!);
                      return (
                        <span className="text-xs font-medium text-muted-foreground">
                          {atraso !== null && atraso > 0 ? `Entregue (${atraso}d de atraso)` : "Entregue"}
                        </span>
                      );
                    }
                    const d = daysLeft(form.delivery_deadline);
                    if (d === null) return null;
                    const cls = d < 0 ? "text-red-500" : d <= 3 ? "text-amber-500" : "text-muted-foreground";
                    return (
                      <span className={`text-xs font-medium ${cls}`}>
                        {d < 0 ? `${Math.abs(d)}d de atraso` : d === 0 ? "Hoje" : `${d}d restantes`}
                      </span>
                    );
                  })()}
                </div>
              </CFRow>

              <CFRow icon={AlignLeft} label="Notas para o cliente">
                <textarea
                  value={form.admin_notes}
                  onChange={(e) => setForm((f) => ({ ...f, admin_notes: e.target.value }))}
                  onBlur={() => save()}
                  placeholder="Observações enviadas junto com o orçamento..."
                  rows={3}
                  className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-0"
                />
              </CFRow>

            </div>
          </div>

          {/* ── SPEC ── */}
          <div className="mb-7">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Spec / Esboço do projeto</h3>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              onBlur={() => save()}
              placeholder="Descreva o escopo, entregas, critérios de aceite..."
              rows={9}
              className="resize-y text-sm font-mono"
            />
          </div>

          {/* Chat com cliente */}
          <div className="mb-7">
            <RequestChat requestId={request.id} isAdmin={true} />
          </div>

          {/* actions */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-5">
            <Button
              size="sm"
              onClick={sendQuote}
              disabled={saving}
              className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {saving ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
              Enviar orçamento
            </Button>

            <Button size="sm" variant="outline" onClick={() => save()} disabled={saving}>
              {saving ? <Loader2 className="size-3 animate-spin" /> : "Salvar alterações"}
            </Button>

            {saveError && (
              <span className="text-xs text-red-500">{saveError}</span>
            )}

            {/* empurra o resto para a direita */}
            <div className="flex-1" />

            {/* Badge de pago */}
            {(request?.paid_at || request?.paid_manually) && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-md px-2.5 py-1">
                <CheckCircle2 className="size-3.5" />
                {request.paid_manually ? "Pago manualmente" : "Pago via MercadoPago"}
              </span>
            )}

            {/* Marcar como pago — visível quando orçamento pendente e não pago */}
            {status === "quoted" && !request?.paid_at && !request?.paid_manually && (
              <Button
                size="sm"
                variant="outline"
                onClick={markAsPaid}
                disabled={saving}
                className="gap-1.5 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
              >
                {saving ? <Loader2 className="size-3 animate-spin" /> : <Banknote className="size-3.5" />}
                Marcar como pago
              </Button>
            )}
          </div>

        </div>
      </main>

      {/* ═══ RIGHT SIDEBAR: etapas (colapsável em mobile) ═════════════════════ */}
      <aside
        className={`flex shrink-0 flex-col border-t md:border-t-0 md:border-l border-border bg-background transition-all duration-200 ${
          sidebarOpen ? "w-full md:w-80" : "w-full md:w-10"
        }`}
      >
        {/* toggle — em mobile mostra sempre "Etapas (x/y)" e chevron para expandir/colapsar */}
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          className="flex h-12 w-full shrink-0 items-center border-b border-border px-3 hover:bg-muted/40 transition-colors"
          title={sidebarOpen ? "Fechar etapas" : "Abrir etapas"}
        >
          <ChevronRight
            className={`hidden md:block size-4 text-muted-foreground transition-transform duration-200 ${sidebarOpen ? "rotate-180" : ""}`}
          />
          <ChevronDown
            className={`md:hidden size-4 text-muted-foreground transition-transform duration-200 shrink-0 ${sidebarOpen ? "rotate-180" : ""}`}
          />
          <div className="ml-2 flex flex-1 items-center justify-between overflow-hidden">
            <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Etapas
            </span>
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {doneTasks}/{tasks.length}
            </span>
          </div>
        </button>

        {sidebarOpen && (
          <>
            {/* list */}
            <ul className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {tasks.length === 0 && (
                <li className="py-10 text-center text-xs text-muted-foreground">
                  Nenhuma etapa ainda.
                </li>
              )}

              {tasks.map((task) => {
                const due = fmtDate(task.due_date);
                const isDone = task.status === "done";
                const dl = isDone ? null : daysLeft(task.due_date);
                const overdue = !isDone && dl !== null && dl < 0;
                const soon = !isDone && dl !== null && dl >= 0 && dl <= 3;

                return (
                  <li key={task.id} className="group rounded-md p-1.5 hover:bg-muted/40">
                    {editingId === task.id ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1">
                          <input
                            autoFocus
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter")  patchTask(task.id, { title: editDraft, due_date: editDue || null, type: editType, priority: editPriority });
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="flex-1 rounded border border-border bg-muted/30 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button type="button" onClick={() => patchTask(task.id, { title: editDraft, due_date: editDue || null, type: editType, priority: editPriority })} className="text-muted-foreground hover:text-primary p-0.5">
                            <Check className="size-3.5" />
                          </button>
                          <button type="button" onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground p-0.5">
                            <X className="size-3.5" />
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Select value={editType} onValueChange={(v) => setEditType(v as RequestType)}>
                            <SelectTrigger className="h-7 w-auto gap-1 border border-border bg-muted/30 px-2 text-xs">
                              {TYPE_LABELS[editType]}
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(TYPE_LABELS) as RequestType[]).map((t) => (
                                <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={String(editPriority)} onValueChange={(v) => setEditPriority(Number(v) as 1 | 2 | 3)}>
                            <SelectTrigger className="h-7 w-auto gap-1 border border-border bg-muted/30 px-2 text-xs">
                              <span className={`flex items-center gap-1 ${PRIORITY_COLOR[editPriority]}`}>
                                <PriorityIcon priority={editPriority} size={12} className="shrink-0" />
                                {PRIORITY_LABELS[editPriority]}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              {([1, 2, 3] as const).map((p) => (
                                <SelectItem key={p} value={String(p)}>
                                  <span className={`flex items-center gap-1 ${PRIORITY_COLOR[p]}`}>
                                    <PriorityIcon priority={p} size={12} className="shrink-0" />
                                    {PRIORITY_LABELS[p]}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <input
                          type="date"
                          value={editDue}
                          onChange={(e) => setEditDue(e.target.value)}
                          className="w-full rounded border border-border bg-muted/30 px-2 py-1 text-xs outline-none [color-scheme:dark] focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        {/* checkbox */}
                        <button
                          type="button"
                          onClick={() => patchTask(task.id, { status: task.status === "done" ? "todo" : "done" })}
                          className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            task.status === "done"
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/40 hover:border-primary"
                          }`}
                        >
                          {task.status === "done" && <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />}
                        </button>

                        {/* content */}
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs leading-5 ${task.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                            {task.title}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-neutral-100 dark:text-neutral-200">
                              {TYPE_LABELS[task.type ?? "feature"] ?? task.type}
                            </span>
                            <span className={`flex items-center gap-1 text-[10px] ${PRIORITY_COLOR[task.priority ?? 2]}`}>
                              <Button type="button" variant="ghost" size="icon" className="size-6 shrink-0 text-neutral-100 dark:text-neutral-200">
                                <PriorityIcon priority={task.priority ?? 2} size={10} />
                              </Button>
                              {PRIORITY_LABELS[task.priority ?? 2]}
                            </span>
                            {due && (
                              <p className={`flex items-center gap-1 text-[10px] ${
                                isDone ? "text-muted-foreground" : soon ? "text-amber-500" : "text-muted-foreground"
                              } ${overdue ? "text-red-500" : ""}`}>
                                <CalendarDays className="size-2.5" />
                                {due}
                                {isDone ? (
                                  <span>(concluído)</span>
                                ) : dl !== null && (
                                  <span className={overdue ? "text-red-500 font-medium" : undefined}>
                                    {overdue ? `(${Math.abs(dl)}d atraso)` : dl === 0 ? "(hoje)" : `(${dl}d)`}
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* hover actions */}
                        <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => { setEditDraft(task.title); setEditDue(task.due_date ?? ""); setEditType(task.type); setEditPriority(task.priority as 1 | 2 | 3); setEditingId(task.id); }}
                            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeTask(task.id)}
                            className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* add task */}
            <div className="space-y-2 border-t border-border p-3">
              <input
                placeholder="Nova etapa..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && addTask()}
                className="w-full rounded-md border border-border bg-muted/30 px-3 py-1.5 text-xs outline-none placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-primary"
              />
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="flex-1 rounded-md border border-border bg-muted/30 px-2 py-1 text-xs outline-none [color-scheme:dark] focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={addTask}
                  disabled={adding || !newTitle.trim()}
                  className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
                >
                  {adding ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
                  Adicionar
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
