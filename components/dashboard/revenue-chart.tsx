"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { Request, RequestStage } from "@/lib/database.types";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

/* ── parse "R$ 5.000,50" / "5000" / "5.000" → number ── */
function parseBudget(raw: string | null | undefined): number {
  if (!raw) return 0;
  const s = raw.replace(/[R$\s]/g, "");
  if (/,\d{1,2}$/.test(s)) {
    return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
  }
  return parseFloat(s.replace(/\./g, "")) || 0;
}

export function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function lastMonths(n: number) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      start: d,
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    };
  });
}

const APPROVED_STATUSES = ["approved", "in_progress", "delivered"] as const;
type ApprovedStatus = typeof APPROVED_STATUSES[number];

function isApproved(r: Request) {
  return APPROVED_STATUSES.includes(r.status as ApprovedStatus);
}

function approvedDate(r: Request): Date {
  return new Date(r.approved_at ?? r.quoted_at ?? r.updated_at ?? r.created_at ?? 0);
}

function paidDate(stage: RequestStage, fallbackReq: Request): Date {
  return new Date(stage.paid_at ?? fallbackReq.paid_at ?? fallbackReq.approved_at ?? stage.updated_at ?? 0);
}

function quotedDate(r: Request): Date {
  return new Date(r.quoted_at ?? r.updated_at ?? r.created_at ?? 0);
}

/**
 * Computa receita REALMENTE recebida vs. a receber (pendente) por request,
 * usando as stages como fonte de verdade quando existirem.
 */
function splitRequestValue(req: Request, stages: RequestStage[]) {
  const reqStages = stages.filter((s) => s.request_id === req.id);
  const budget = parseBudget(req.budget);

  if (reqStages.length > 0) {
    const paid = reqStages.filter((s) => s.status === "paid").reduce((sum, s) => sum + s.amount, 0);
    const pending = reqStages.filter((s) => s.status === "pending").reduce((sum, s) => sum + s.amount, 0);
    return { paid, pending, stages: reqStages };
  }

  // Sem stages: a marca legacy `paid_at` define se está paga
  if (req.paid_at || req.paid_manually) return { paid: budget, pending: 0, stages: [] as RequestStage[] };
  if (isApproved(req)) return { paid: 0, pending: budget, stages: [] as RequestStage[] };
  return { paid: 0, pending: 0, stages: [] as RequestStage[] };
}

const chartConfig = {
  Recebida: { label: "Recebida", color: "hsl(160 84% 39%)" },
  A_receber: { label: "A receber", color: "hsl(35 92% 55%)" },
  Orcada: { label: "Orçada", color: "hsl(262 83% 58%)" },
} satisfies ChartConfig;

interface RevenueChartProps {
  requests: Request[];
  stages?: RequestStage[];
  months?: number;
}

export function RevenueChart({ requests, stages = [], months = 12 }: RevenueChartProps) {
  const periods = lastMonths(months);

  const data = periods.map(({ key, label, start, end }) => {
    let recebida = 0;
    let aReceber = 0;
    let orcada = 0;
    let pedidos = 0;

    for (const req of requests) {
      const { paid, pending, stages: reqStages } = splitRequestValue(req, stages);

      // Recebida: stages pagas (ou request legacy paid_at) cujo paid_at cai no período
      if (reqStages.length > 0) {
        for (const stage of reqStages) {
          if (stage.status !== "paid") continue;
          const d = paidDate(stage, req);
          if (d >= start && d <= end) recebida += stage.amount;
        }
      } else if (req.paid_at) {
        const d = new Date(req.paid_at);
        if (d >= start && d <= end) recebida += paid;
      }

      // A receber: stages pendentes de requests aprovados — usa data de aprovação
      if (isApproved(req) && pending > 0) {
        const d = approvedDate(req);
        if (d >= start && d <= end) aReceber += pending;
      }

      // Orçada: total do request quoted (não aprovado ainda)
      if (req.status === "quoted") {
        const d = quotedDate(req);
        if (d >= start && d <= end) {
          orcada += parseBudget(req.budget);
          pedidos += 1;
        }
      }

      if (isApproved(req)) {
        const d = approvedDate(req);
        if (d >= start && d <= end) pedidos += 1;
      }
    }

    return { key, label, Recebida: recebida, A_receber: aReceber, Orcada: orcada, Pedidos: pedidos };
  });

  const thisMonth = data[data.length - 1]?.Recebida ?? 0;
  const lastMonth = data[data.length - 2]?.Recebida ?? 0;
  const mom = lastMonth === 0 ? (thisMonth > 0 ? 100 : 0) : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  const momUp = mom >= 0;

  const maxVal = Math.max(
    ...data.map((d) => d.Recebida),
    ...data.map((d) => d.A_receber),
    ...data.map((d) => d.Orcada),
    1,
  );
  const hasAny = data.some((d) => d.Recebida + d.A_receber + d.Orcada > 0);

  return (
    <div className="flex h-full flex-col gap-4">
      {hasAny ? (
        <ChartContainer config={chartConfig} className="min-h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%" minHeight={220}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="recebidaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(160 84% 39%)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aReceberFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(35 92% 55%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(35 92% 55%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="orcadaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(262 83% 58%)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={months <= 6 ? 0 : Math.max(0, Math.floor(months / 5) - 1)}
              />
              <YAxis
                width={56}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
                domain={[0, Math.ceil(maxVal * 1.1)]}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => fmtBRL(Number(value))}
                    labelFormatter={(_, payload) => {
                      const p = payload?.[0]?.payload;
                      return p ? p.label : "";
                    }}
                  />
                }
                cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "4 2", strokeOpacity: 0.6 }}
              />
              <ReferenceLine
                x={data[data.length - 1]?.label}
                stroke="hsl(var(--border))"
                strokeDasharray="4 2"
                strokeOpacity={0.35}
              />
              <Area type="monotone" dataKey="Recebida" stroke="hsl(160 84% 39%)" strokeWidth={2} fill="url(#recebidaFill)" dot={false} activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="A_receber" name="A receber" stroke="hsl(35 92% 55%)" strokeWidth={2} fill="url(#aReceberFill)" dot={false} activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="Orcada" stroke="hsl(262 83% 58%)" strokeWidth={2} fill="url(#orcadaFill)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      ) : (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 text-center">
          <DollarSign className="size-9 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Nenhuma receita ainda</p>
          <p className="text-xs text-muted-foreground/70">Pedidos aprovados/entregues aparecem aqui</p>
        </div>
      )}

      {hasAny && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
          <Legend color="hsl(160 84% 39%)" label="Recebida" />
          <Legend color="hsl(35 92% 55%)" label="A receber" />
          <Legend color="hsl(262 83% 58%)" label="Orçada" />
          <span
            className={`ml-auto flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm font-medium ${
              momUp
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {momUp ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
            {momUp ? "+" : ""}
            {mom}% vs mês ant.
          </span>
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-md bg-muted/40 px-2 py-1 text-xs">
      <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-medium">{label}</span>
    </span>
  );
}

// Mantido apenas pra compatibilidade com revenue-month-card
export function getReceivedRequests(requests: Request[]) {
  return requests.filter(
    (r) =>
      r.budget &&
      String(r.budget).trim() !== "" &&
      APPROVED_STATUSES.includes(r.status as ApprovedStatus),
  );
}
