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
import type { Request } from "@/lib/database.types";
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

const RECEIVED_STATUSES = ["approved", "in_progress", "delivered"] as const;

function revenueDate(r: Request): Date {
  const raw = r.paid_at ?? r.approved_at ?? r.delivered_at ?? r.updated_at;
  return new Date(raw || 0);
}

function quotedDate(r: Request): Date {
  const raw = r.quoted_at ?? r.updated_at ?? r.created_at;
  return new Date(raw || 0);
}

export function getReceivedRequests(requests: Request[]) {
  return requests.filter(
    (r) =>
      r.budget &&
      String(r.budget).trim() !== "" &&
      RECEIVED_STATUSES.includes(r.status as (typeof RECEIVED_STATUSES)[number]),
  );
}

function getQuotedRequests(requests: Request[]) {
  return requests.filter(
    (r) =>
      r.budget &&
      String(r.budget).trim() !== "" &&
      r.status === "quoted",
  );
}

const chartConfig = {
  Receita: {
    label: "Receita",
    color: "hsl(160 84% 39%)",
  },
  Orcadas: {
    label: "Orçadas",
    color: "hsl(262 83% 58%)",
  },
  Pedidos: {
    label: "Pedidos",
    color: "hsl(215 20% 65%)",
  },
} satisfies ChartConfig;

interface RevenueChartProps {
  requests: Request[];
  months?: number;
}

export function RevenueChart({ requests, months = 12 }: RevenueChartProps) {
  const periods = lastMonths(months);
  const receivedRequests = getReceivedRequests(requests);
  const quotedRequests = getQuotedRequests(requests);

  const data = periods.map(({ key, label, start, end }) => {
    const inPeriod = receivedRequests.filter((r) => {
      const d = revenueDate(r);
      return d >= start && d <= end;
    });
    const quotedInPeriod = quotedRequests.filter((r) => {
      const d = quotedDate(r);
      return d >= start && d <= end;
    });
    const revenue = inPeriod.reduce((sum, r) => sum + parseBudget(r.budget), 0);
    const orcadas = quotedInPeriod.reduce((sum, r) => sum + parseBudget(r.budget), 0);
    return {
      key,
      label,
      Receita: revenue,
      Orcadas: orcadas,
      Pedidos: inPeriod.length,
    };
  });

  const thisMonth = data[data.length - 1]?.Receita ?? 0;
  const lastMonth = data[data.length - 2]?.Receita ?? 0;
  const mom =
    lastMonth === 0 ? (thisMonth > 0 ? 100 : 0) : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  const momUp = mom >= 0;
  const maxVal = Math.max(
    ...data.map((d) => d.Receita),
    ...data.map((d) => d.Orcadas),
    1,
  );
  const hasRevenue = receivedRequests.length > 0 || quotedRequests.length > 0;

  return (
    <div className="flex h-full flex-col gap-4">
      {hasRevenue ? (
        <ChartContainer config={chartConfig} className="min-h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%" minHeight={220}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="orcadasFill" x1="0" y1="0" x2="0" y2="1">
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
              <Area
                type="monotone"
                dataKey="Receita"
                stroke="hsl(160 84% 39%)"
                strokeWidth={2}
                fill="url(#revenueFill)"
                dot={false}
                activeDot={{ r: 4, fill: "hsl(160 84% 39%)", strokeWidth: 2, stroke: "hsl(var(--background))" }}
              />
              <Area
                type="monotone"
                dataKey="Orcadas"
                stroke="hsl(262 83% 58%)"
                strokeWidth={2}
                fill="url(#orcadasFill)"
                dot={false}
                activeDot={{ r: 4, fill: "hsl(262 83% 58%)", strokeWidth: 2, stroke: "hsl(var(--background))" }}
              />
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

      {hasRevenue && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
          {[...data]
            .filter((d) => d.Receita > 0)
            .sort((a, b) => b.Receita - a.Receita)
            .slice(0, 4)
            .map((d) => (
              <div
                key={d.key}
                className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-xs"
              >
                <span className="font-medium capitalize">{d.label}</span>
                <span className="text-muted-foreground">·</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {fmtBRL(d.Receita)}
                </span>
              </div>
            ))}
          <span
            className={`ml-1 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm font-medium ${
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
