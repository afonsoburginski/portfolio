"use client";

import { useState, useMemo, useCallback, useContext, useEffect, useRef } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInMonths,
  differenceInDays,
  endOfMonth,
  getDaysInMonth,
  startOfMonth,
} from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Request, RequestStatus, RequestTask } from "@/lib/database.types";
import type { GanttFeature, GanttStatus } from "@/components/kibo-ui/gantt";
import { getRequestTasks } from "@/lib/dashboard-data";
import {
  GanttContext,
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttHeader,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttFeatureRow,
  GanttTimeline,
  GanttToday,
} from "@/components/kibo-ui/gantt";
import { PriorityIcon } from "@/components/dashboard/priority-icon";
import { Button } from "@/components/ui/button";

/* ─── constants ──────────────────────────────────────────────────────────── */

const TASK_STATUS_COLOR: Record<string, string> = {
  todo:        "#94a3b8",
  in_progress: "#f97316",
  done:        "#22c55e",
};

const STATUS_TO_GANTT: Record<RequestStatus, GanttStatus> = {
  submitted:   { id: "submitted",   name: "Enviada",      color: "#60a5fa" },
  reviewing:   { id: "reviewing",   name: "Em análise",   color: "#eab308" },
  quoted:      { id: "quoted",      name: "Orçada",       color: "#a855f7" },
  approved:    { id: "approved",    name: "Aprovada",     color: "#22c55e" },
  rejected:    { id: "rejected",    name: "Rejeitada",    color: "#ef4444" },
  in_progress: { id: "in_progress", name: "Em progresso", color: "#f97316" },
  delivered:   { id: "delivered",   name: "Concluído",    color: "#10b981" },
  cancelled:   { id: "cancelled",   name: "Cancelada",    color: "#737373" },
};

const GROUP_ORDER: RequestStatus[] = [
  "submitted", "reviewing", "quoted", "approved",
  "in_progress", "delivered", "rejected", "cancelled",
];

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

const TYPE_LABELS: Record<string, string> = {
  feature:     "Nova funcionalidade",
  bug_fix:     "Correção de bug",
  integration: "Integração",
  maintenance: "Manutenção",
  redesign:    "Redesign / UI",
  other:       "Outro",
};

const PRIORITY_LABELS: Record<number, string> = { 1: "Baixa", 2: "Média", 3: "Alta" };
const PRIORITY_COLOR: Record<number, string> = {
  1: "text-slate-400",
  2: "text-amber-500",
  3: "text-red-500",
};

const BASE_ZOOM    = 130;      // zoom padrão (visão geral)
const SIDEBAR_W    = 300;      // sidebar do Gantt (px)
const BASE_COL_W   = 150;      // largura base de 1 mês no range "monthly"

/** Formata data para marcador: "3 mar" */
function formatStartDay(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

/**
 * Marcador vertical de data — linha sempre visível; texto (data) ao passar o mouse no marcador ou na barra da subtask.
 */
function GanttStartDateMarker({
  date,
  label,
  showLabelWhenRowHovered = false,
}: {
  date: Date;
  label: string;
  showLabelWhenRowHovered?: boolean;
}) {
  const gantt = useContext(GanttContext);
  const timelineStartDate = useMemo(
    () => new Date(gantt.timelineData[0]?.year ?? date.getFullYear(), 0, 1),
    [gantt.timelineData, date]
  );
  const offset = useMemo(
    () => differenceInMonths(date, timelineStartDate),
    [date, timelineStartDate]
  );
  const colWidthPx = (gantt.columnWidth * gantt.zoom) / 100;
  const startOfRange = startOfMonth(date);
  const endOfRange = endOfMonth(date);
  const totalDays = differenceInDays(endOfRange, startOfRange) + 1;
  const innerOffset = (date.getDate() / totalDays) * colWidthPx;
  const fullDateLabel = date.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
  const showPill = showLabelWhenRowHovered;

  return (
    <div
      className="group absolute top-0 left-0 z-20 flex h-full select-none flex-col items-center justify-center overflow-visible"
      style={{
        width: 24,
        marginLeft: -12,
        transform: `translateX(calc(var(--gantt-column-width) * ${offset} + ${innerOffset}px))`,
      }}
    >
      <div
        className={`pointer-events-auto sticky top-0 flex flex-col flex-nowrap items-center justify-center whitespace-nowrap rounded-b-md bg-card px-2 py-1 text-foreground text-xs shadow-sm transition-opacity ${
          showPill ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {label}
        <span className="max-h-0 overflow-hidden opacity-80 transition-all group-hover:max-h-[2rem]">
          {fullDateLabel}
        </span>
      </div>
      <div className="h-full w-px bg-card" />
    </div>
  );
}

/**
 * Linha de dias no topo (entre os meses) quando há foco — mesma largura da timeline.
 */
function FocusedDaysHeader({ start, end }: { start: Date; end: Date }) {
  const gantt = useContext(GanttContext);
  const colWidthPx = (gantt.columnWidth * gantt.zoom) / 100;
  const timelineStart = useMemo(
    () => new Date(gantt.timelineData[0]?.year ?? start.getFullYear(), 0, 1),
    [gantt.timelineData, start]
  );

  const months = useMemo(() => {
    const list: { year: number; month: number }[] = [];
    let d = new Date(start.getFullYear(), start.getMonth(), 1);
    const endFirst = new Date(end.getFullYear(), end.getMonth(), 1);
    while (d <= endFirst) {
      list.push({ year: d.getFullYear(), month: d.getMonth() });
      d = addMonths(d, 1);
    }
    return list;
  }, [start, end]);

  const offsetPx = useMemo(() => {
    const firstMonth = months[0];
    if (!firstMonth) return 0;
    return differenceInMonths(new Date(firstMonth.year, firstMonth.month, 1), timelineStart) * colWidthPx;
  }, [months, timelineStart, colWidthPx]);

  if (months.length === 0) return null;

  /* Modo foco/zoom: exibir todos os dias corridos de cada mês (1…28/29/30/31); mês e dias em linhas separadas */
  return (
    <div
      className="absolute left-0 top-[32px] z-20 flex border-b-2 border-primary/30 bg-muted/95 shadow-sm"
      style={{
        height: 40,
        minHeight: 40,
        transform: `translateX(${offsetPx}px)`,
        width: months.length * colWidthPx,
      }}
    >
      {months.map(({ year, month }) => {
        const daysInMonth = getDaysInMonth(new Date(year, month, 1));
        const dayWidthPx = colWidthPx / daysInMonth;
        const monthLabel = new Date(year, month, 1).toLocaleDateString("pt-BR", { month: "short" });
        return (
          <div
            key={`${year}-${month}`}
            className="flex shrink-0 flex-col border-r border-border/50"
            style={{ width: colWidthPx }}
          >
            <div className="flex h-4 shrink-0 items-center justify-center border-b border-border/40 text-[9px] font-semibold uppercase text-muted-foreground">
              {monthLabel}
            </div>
            <div
              className="flex shrink-0 flex-nowrap gap-0 overflow-hidden"
              style={{ width: colWidthPx, height: 20 }}
            >
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                <span
                  key={d}
                  className="flex shrink-0 items-center justify-center text-[8px] font-medium tabular-nums text-foreground/70"
                  style={{ width: dayWidthPx, minWidth: dayWidthPx }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Padrão cinza listrado para dias não úteis (sábado, domingo, feriados). Bem visível. */
const NON_WORKING_DAY_PATTERN: React.CSSProperties = {
  backgroundColor: "hsl(var(--muted) / 0.35)",
  backgroundImage: `repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 5px,
    hsl(var(--muted) / 0.55) 5px,
    hsl(var(--muted) / 0.55) 6px
  )`,
};

/** Lista de feriados (BR): DD-MM. Incluir mais conforme necessário. */
const HOLIDAYS_BR = new Set([
  "01-01", "21-04", "01-05", "07-09", "12-10", "02-11", "15-11", "25-12",
]);

function isNonWorkingDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return true; // domingo, sábado
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return HOLIDAYS_BR.has(`${dd}-${mm}`);
}

/** Fundo de fim de semana e feriados para toda a timeline (sempre visível). */
function FullTimelineWeekendBackground() {
  const gantt = useContext(GanttContext);
  const colWidthPx = (gantt.columnWidth * gantt.zoom) / 100;

  const months = useMemo(() => {
    const list: { year: number; month: number }[] = [];
    for (const yearData of gantt.timelineData) {
      const monthsInYear = yearData.quarters?.flatMap((q) => q.months) ?? [];
      for (let m = 0; m < monthsInYear.length; m++) {
        list.push({ year: yearData.year, month: m });
      }
    }
    return list;
  }, [gantt.timelineData]);

  if (months.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute left-0 top-[var(--gantt-header-height)] z-0 flex h-[calc(100%-var(--gantt-header-height))]"
      style={{ width: months.length * colWidthPx }}
    >
      {months.map(({ year, month }) => {
        const daysInMonth = getDaysInMonth(new Date(year, month, 1));
        const dayWidthPx = colWidthPx / daysInMonth;
        return (
          <div
            key={`${year}-${month}`}
            className="flex shrink-0"
            style={{ width: colWidthPx }}
          >
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const nonWorking = isNonWorkingDay(date);
              return (
                <div
                  key={day}
                  className="h-full shrink-0"
                  style={{
                    width: dayWidthPx,
                    ...(nonWorking ? NON_WORKING_DAY_PATTERN : {}),
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ─── converters ──────────────────────────────────────────────────────────── */

function requestToFeature(r: Request): GanttFeature {
  const startAt = new Date(r.created_at);
  const endAt   = r.delivery_deadline
    ? new Date(r.delivery_deadline + "T12:00:00")
    : addMonths(startAt, 1);
  return { id: r.id, name: r.title, startAt, endAt, status: STATUS_TO_GANTT[r.status] };
}

/** Feature de task (subtask) — sem flags de tipo/prioridade (ficam na tarefa principal). */
function tasksToFeatures(tasks: RequestTask[], req: Request): GanttFeature[] {
  const reqStart = new Date(req.created_at);
  const features: GanttFeature[] = [];
  for (let i = 0; i < tasks.length; i++) {
    const task    = tasks[i];
    const startAt = i === 0 ? reqStart : features[i - 1].endAt;
    const rawEnd  = task.due_date
      ? new Date(task.due_date + "T12:00:00")
      : req.delivery_deadline
        ? new Date(req.delivery_deadline + "T12:00:00")
        : addWeeks(startAt, 2);
    const endAt = rawEnd > startAt ? rawEnd : addDays(startAt, 1);
    features.push({
      id: task.id,
      name: task.title,
      startAt,
      endAt,
      status: { id: task.status, name: task.status, color: TASK_STATUS_COLOR[task.status] ?? "#94a3b8" },
    });
  }
  return features;
}

/**
 * Calcula o zoom ideal para mostrar a duração do projeto expandido
 * preenchendo a largura visível do Gantt.
 */
function calcZoom(startAt: Date, endAt: Date, containerWidth: number): number {
  const durationDays   = Math.ceil((endAt.getTime() - startAt.getTime()) / 86400000);
  const durationMonths = Math.max(1, Math.ceil(durationDays / 30));
  const available      = Math.max(containerWidth - SIDEBAR_W, 400);
  const ideal          = Math.round((available / durationMonths / BASE_COL_W) * 100);
  return Math.min(Math.max(ideal, 100), 600);
}

/* ─── GanttScrollTrigger ─────────────────────────────────────────────────── */
/**
 * Componente vazio que vive DENTRO do GanttProvider (portanto tem acesso ao
 * GanttContext) e dispara scrollToFeature após cada mudança de `trigger`.
 * Usa `version` (timestamp) para reativar o efeito mesmo se a feature for a
 * mesma.
 */
function GanttScrollTrigger({
  trigger,
}: {
  trigger: { feature: GanttFeature; version: number } | null;
}) {
  const gantt        = useContext(GanttContext);
  const lastVersion  = useRef<number>(0);

  useEffect(() => {
    if (!trigger || trigger.version === lastVersion.current) return;
    lastVersion.current = trigger.version;
    // Pequeno delay para que o GanttProvider finalize o re-render com o novo zoom
    const id = setTimeout(() => {
      gantt.scrollToFeature?.(trigger.feature);
    }, 80);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger?.version]);

  return null;
}

/* ─── sub-components ──────────────────────────────────────────────────────── */

function RequestSidebarRow({
  feature,
  isExpanded,
  isLoading,
  onToggle,
  onFocus,
}: {
  feature: GanttFeature;
  isExpanded: boolean;
  isLoading: boolean;
  onToggle: () => void;
  /** Chamado ao ABRIR — o pai calcula zoom + scroll */
  onFocus: () => void;
}) {
  const handleClick = () => {
    const wasExpanded = isExpanded;
    onToggle();
    if (!wasExpanded) onFocus();
  };

  return (
    <div
      className="relative flex items-center gap-2 px-2.5 text-xs hover:bg-secondary cursor-pointer select-none"
      style={{ height: "var(--gantt-row-height)" }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      {isExpanded
        ? <ChevronDown  className="size-3 shrink-0 text-muted-foreground" />
        : <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
      }
      <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: feature.status.color }} />
      <p className="flex-1 truncate font-medium">{feature.name}</p>
      {isLoading && <span className="text-muted-foreground/50 text-[10px]">...</span>}
    </div>
  );
}

function TaskSidebarRow({ feature }: { feature: GanttFeature }) {
  return (
    <div
      className="flex items-center gap-2 pl-8 pr-2.5 text-xs text-muted-foreground hover:bg-secondary/40"
      style={{ height: "var(--gantt-row-height)" }}
    >
      <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: feature.status.color }} />
      <p className="flex-1 truncate">{feature.name}</p>
    </div>
  );
}

function PlaceholderRow({ label }: { label?: string }) {
  return (
    <div className="flex items-center pl-8 text-xs text-muted-foreground/40" style={{ height: "var(--gantt-row-height)" }}>
      {label}
    </div>
  );
}

/* ─── main component ──────────────────────────────────────────────────────── */

/** Estado do pan por arraste (scroll interno do Gantt). */
type PanState = { scrollEl: HTMLElement; startX: number; startY: number };

export function AdminGanttView({ requests }: { requests: Request[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panRef       = useRef<PanState | null>(null);

  const [zoom,         setZoom]         = useState(BASE_ZOOM);
  const [scrollTrigger, setScrollTrigger] = useState<{ feature: GanttFeature; version: number } | null>(null);
  const [expandedIds,  setExpandedIds]  = useState<Set<string>>(new Set());
  const [tasksByReq,   setTasksByReq]   = useState<Record<string, RequestTask[]>>({});
  const [loadingIds,   setLoadingIds]   = useState<Set<string>>(new Set());
  const [isPanning,    setIsPanning]    = useState(false);
  const [hoveredSubtaskFeatureId, setHoveredSubtaskFeatureId] = useState<string | null>(null);

  /* Pan por arraste: scroll horizontal/vertical apenas dentro do Gantt */
  const handlePanMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("[role='button']") || target.closest(".rounded-md")) return;
    const scrollEl = containerRef.current?.querySelector(".gantt") as HTMLElement | null;
    if (!scrollEl) return;

    e.preventDefault();
    panRef.current = { scrollEl, startX: e.clientX, startY: e.clientY };
    setIsPanning(true);

    const onMove = (ev: MouseEvent) => {
      const p = panRef.current;
      if (!p) return;
      const dx = ev.clientX - p.startX;
      const dy = ev.clientY - p.startY;
      p.scrollEl.scrollLeft -= dx;
      p.scrollEl.scrollTop -= dy;
      p.startX = ev.clientX;
      p.startY = ev.clientY;
    };
    const onUp = () => {
      panRef.current = null;
      setIsPanning(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  /* Quando não há nenhum projeto expandido, volta ao zoom padrão */
  useEffect(() => {
    if (expandedIds.size === 0) setZoom(BASE_ZOOM);
  }, [expandedIds]);

  /** Calcula zoom e agenda scroll para o projeto expandido. */
  const focusProject = useCallback((feature: GanttFeature, firstTask?: GanttFeature) => {
    const cw      = containerRef.current?.clientWidth ?? 1000;
    const newZoom = calcZoom(feature.startAt, feature.endAt, cw);
    setZoom(newZoom);
    setScrollTrigger({ feature: firstTask ?? feature, version: Date.now() });
  }, []);

  const toggleExpand = useCallback(async (req: Request) => {
    const { id } = req;
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    if (!(id in tasksByReq) && !loadingIds.has(id)) {
      setLoadingIds((prev) => new Set(prev).add(id));
      try {
        const tasks = await getRequestTasks(id);
        setTasksByReq((prev) => ({ ...prev, [id]: tasks }));
      } finally {
        setLoadingIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      }
    }
  }, [tasksByReq, loadingIds]);

  const grouped = useMemo(() =>
    GROUP_ORDER.reduce<Record<RequestStatus, Request[]>>(
      (acc, s) => { acc[s] = requests.filter((r) => r.status === s); return acc; },
      {} as Record<RequestStatus, Request[]>
    ),
  [requests]);

  const activeGroups = GROUP_ORDER.filter((s) => grouped[s].length > 0);

  /* Foco: quando exatamente uma tarefa está expandida, ocultar as demais e mostrar dias no topo */
  const focusedRequest =
    expandedIds.size === 1
      ? requests.find((r) => expandedIds.has(r.id))
      : null;
  const focusedFeature = focusedRequest ? requestToFeature(focusedRequest) : null;
  const focusedRange =
    focusedFeature
      ? { start: focusedFeature.startAt, end: focusedFeature.endAt }
      : null;
  const expandedTaskFeatures =
    focusedRequest && tasksByReq[focusedRequest.id]
      ? tasksToFeatures(tasksByReq[focusedRequest.id], focusedRequest)
      : [];

  if (requests.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed py-16 text-sm text-muted-foreground">
        Nenhuma solicitação para exibir no Gantt.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`h-[640px] w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-border ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
      onMouseDown={handlePanMouseDown}
    >
      <GanttProvider range="monthly" zoom={zoom} className="h-full min-w-0">

        {/* Dispara scrollToFeature APÓS o GanttProvider re-renderizar com o novo zoom */}
        <GanttScrollTrigger trigger={scrollTrigger} />

        {/* ── sidebar esquerda ── */}
        <GanttSidebar>
          {activeGroups.map((statusKey) => (
            <GanttSidebarGroup key={statusKey} name={STATUS_LABELS[statusKey]}>
              {grouped[statusKey].map((req) => {
                const feature    = requestToFeature(req);
                const isExpanded = expandedIds.has(req.id);
                const isLoading  = loadingIds.has(req.id);
                const tasks      = tasksByReq[req.id];
                const hasFetched = req.id in tasksByReq;
                const taskFeatures = !isLoading && tasks ? tasksToFeatures(tasks, req) : [];

                return (
                  <div key={req.id}>
                    <RequestSidebarRow
                      feature={feature}
                      isExpanded={isExpanded}
                      isLoading={isLoading}
                      onToggle={() => toggleExpand(req)}
                      onFocus={() => focusProject(feature, taskFeatures[0])}
                    />

                    {isExpanded && isLoading && <PlaceholderRow label="Carregando etapas..." />}

                    {isExpanded && hasFetched && !isLoading && tasks.length === 0 && (
                      <PlaceholderRow label="Sem etapas cadastradas" />
                    )}

                    {isExpanded && !isLoading && taskFeatures.map((f) => (
                      <TaskSidebarRow key={f.id} feature={f} />
                    ))}
                  </div>
                );
              })}
            </GanttSidebarGroup>
          ))}
        </GanttSidebar>

        {/* ── timeline direita ── */}
        <GanttTimeline>
          <GanttHeader />
          <FullTimelineWeekendBackground />
          {focusedRange && <FocusedDaysHeader start={focusedRange.start} end={focusedRange.end} />}
          <GanttToday />
          {expandedTaskFeatures.map((f) => (
            <GanttStartDateMarker
              key={`marker-${f.id}`}
              date={f.startAt}
              label={formatStartDay(f.startAt)}
              showLabelWhenRowHovered={hoveredSubtaskFeatureId === f.id}
            />
          ))}
          <GanttFeatureList>
            {activeGroups.map((statusKey) => {
              const rows = focusedRequest
                ? grouped[statusKey].filter((req) => req.id === focusedRequest.id)
                : grouped[statusKey];
              if (rows.length === 0) return null;
              return (
                <GanttFeatureListGroup key={statusKey}>
                  {rows.map((req) => {
                  const feature      = requestToFeature(req);
                  const isExpanded   = expandedIds.has(req.id);
                  const isLoading    = loadingIds.has(req.id);
                  const tasks        = tasksByReq[req.id];
                  const hasFetched   = req.id in tasksByReq;
                  const taskFeatures = !isLoading && tasks ? tasksToFeatures(tasks, req) : [];

                  return (
                    <div key={req.id}>
                      {/* Barra da tarefa principal (request): nome + tipo + prioridade */}
                      <GanttFeatureRow features={[feature]} onMove={undefined}>
                        {() => (
                          <div className="flex min-w-0 flex-1 items-center gap-1.5">
                            <span className="min-w-0 flex-1 truncate text-xs">{req.title}</span>
                            <span className="shrink-0 rounded bg-muted/70 px-1 py-0.5 text-[9px] text-neutral-100 dark:text-neutral-200">
                              {TYPE_LABELS[req.type]}
                            </span>
                            <span className="shrink-0">
                              <Button type="button" variant="ghost" size="icon" className="shrink-0 size-7 text-neutral-100 dark:text-neutral-200">
                                <PriorityIcon priority={req.priority ?? 2} size={12} />
                              </Button>
                            </span>
                          </div>
                        )}
                      </GanttFeatureRow>

                      {isExpanded && (isLoading || (hasFetched && tasks.length === 0)) && (
                        <div style={{ height: "var(--gantt-row-height)" }} />
                      )}

                      {isExpanded && !isLoading && taskFeatures.map((f) => (
                        <div
                          key={f.id}
                          onMouseEnter={() => setHoveredSubtaskFeatureId(f.id)}
                          onMouseLeave={() => setHoveredSubtaskFeatureId(null)}
                        >
                          <GanttFeatureRow features={[f]} onMove={undefined}>
                            {(feat) => (
                              <div className="group/subtask min-w-0 flex-1 overflow-visible">
                                <span className="block min-w-0 max-w-full truncate text-xs transition-[max-width] duration-300 ease-out group-hover/subtask:max-w-[500px] group-hover/subtask:overflow-visible group-hover/subtask:whitespace-nowrap group-hover/subtask:text-clip">
                                  {feat.name}
                                </span>
                              </div>
                            )}
                          </GanttFeatureRow>
                        </div>
                      ))}
                    </div>
                  );
                })}
                </GanttFeatureListGroup>
              );
            })}
          </GanttFeatureList>
        </GanttTimeline>

      </GanttProvider>
    </div>
  );
}
