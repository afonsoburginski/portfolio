"use client";

import * as React from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import type { Request, RequestStage, RequestType } from "@/lib/database.types";
import { fmtBRL } from "./revenue-chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const TYPE_LABELS: Record<RequestType, string> = {
  feature:     "Nova func.",
  bug_fix:     "Bug",
  integration: "Integração",
  maintenance: "Manutenção",
  redesign:    "Redesign",
  full_system: "Sistema / SaaS",
  other:       "Outro",
};

const TYPE_COLORS: Record<string, string> = {
  feature:     "hsl(160 84% 39%)",
  bug_fix:     "hsl(0 84% 50%)",
  integration: "hsl(217 91% 60%)",
  maintenance: "hsl(25 95% 53%)",
  redesign:    "hsl(330 81% 60%)",
  full_system: "hsl(262 83% 58%)",
  other:       "hsl(0 0% 55%)",
};

function requestDate(r: Request): Date {
  // Usa a melhor data disponível: paid > approved > quoted > created
  const raw = r.paid_at ?? r.approved_at ?? r.quoted_at ?? r.updated_at ?? r.created_at;
  return new Date(raw || 0);
}

function parseBudgetLocal(raw: string | null | undefined): number {
  if (!raw) return 0;
  const s = raw.replace(/[R$\s]/g, "");
  if (/,\d{1,2}$/.test(s)) return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
  return parseFloat(s.replace(/\./g, "")) || 0;
}

function requestValue(r: Request, stages: RequestStage[]): number {
  const reqStages = stages.filter((s) => s.request_id === r.id);
  if (reqStages.length > 0) return reqStages.reduce((s, st) => s + st.amount, 0);
  return parseBudgetLocal(r.budget);
}

function lastMonths(n: number) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      month: d.toLocaleDateString("pt-BR", { month: "short" }),
      start: d,
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    };
  });
}

interface Props {
  requests: Request[];
  stages?: RequestStage[];
}

export function RevenueMonthCard({ requests, stages = [] }: Props) {
  // Inclui TODOS os requests com valor — quoted, approved, in_progress, delivered.
  // Assim tipos como "bug_fix" aparecem mesmo antes de virarem receita confirmada.
  const valued = requests.filter((r) => requestValue(r, stages) > 0);

  const { chartData, activeTypes, totalReceita, totalPedidos, legendItems } = React.useMemo(() => {
    const periods = lastMonths(6);

    // Descobre os tipos presentes
    const typeSet = new Set<string>();
    for (const r of valued) typeSet.add(r.type ?? "other");
    const types = Array.from(typeSet);

    // Monta dados: uma linha por mês, uma coluna por tipo
    const data = periods.map(({ month, start, end }) => {
      const row: Record<string, string | number> = { month };
      for (const t of types) {
        const inPeriod = valued.filter((r) => {
          const d = requestDate(r);
          return (r.type ?? "other") === t && d >= start && d <= end;
        });
        row[t] = inPeriod.reduce((s, r) => s + requestValue(r, stages), 0);
      }
      return row;
    });

    // Legenda (totais por tipo)
    const totalByType: Record<string, { Receita: number; Pedidos: number }> = {};
    for (const r of valued) {
      const t = r.type ?? "other";
      if (!totalByType[t]) totalByType[t] = { Receita: 0, Pedidos: 0 };
      totalByType[t].Receita += requestValue(r, stages);
      totalByType[t].Pedidos += 1;
    }
    const total = Object.values(totalByType).reduce((s, v) => s + v.Receita, 0);
    const totalP = Object.values(totalByType).reduce((s, v) => s + v.Pedidos, 0);

    const legend = types
      .sort((a, b) => (totalByType[b]?.Receita ?? 0) - (totalByType[a]?.Receita ?? 0))
      .map((t) => ({
        type: t,
        label: TYPE_LABELS[t as RequestType] ?? t,
        color: TYPE_COLORS[t] ?? "hsl(var(--muted))",
        Receita: totalByType[t]?.Receita ?? 0,
        Pedidos: totalByType[t]?.Pedidos ?? 0,
        pct: total > 0 ? ((totalByType[t]?.Receita ?? 0) / total) * 100 : 0,
      }));

    return {
      chartData: data,
      activeTypes: types,
      totalReceita: total,
      totalPedidos: totalP,
      legendItems: legend,
    };
  }, [valued, stages]);

  const chartConfig = React.useMemo<ChartConfig>(() => {
    const c: ChartConfig = {};
    for (const t of activeTypes) {
      c[t] = {
        label: TYPE_LABELS[t as RequestType] ?? t,
        color: TYPE_COLORS[t] ?? "hsl(var(--muted))",
      };
    }
    return c;
  }, [activeTypes]);

  const hasData = totalReceita > 0;

  return (
    <div className="flex h-full flex-col rounded-xl border border-border/80 bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Receita por tipo
        </p>
        {hasData && (
          <span className="text-[10px] font-medium text-muted-foreground">
            {activeTypes.length} tipo{activeTypes.length !== 1 ? "s" : ""} · {totalPedidos} pedido{totalPedidos !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {hasData ? (
        <>
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-h-[220px] min-h-[180px] flex-shrink-0"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      formatter={(v) => fmtBRL(Number(v))}
                    />
                  }
                />
                <PolarAngleAxis dataKey="month" tick={{ fontSize: 10 }} />
                <PolarGrid radialLines={false} />
                {activeTypes.map((t) => (
                  <Radar
                    key={t}
                    dataKey={t}
                    fill={TYPE_COLORS[t] ?? "hsl(var(--muted))"}
                    fillOpacity={0}
                    stroke={TYPE_COLORS[t] ?? "hsl(var(--muted))"}
                    strokeWidth={2}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="mt-3 flex flex-col gap-1.5 border-t border-border/50 pt-3">
            {legendItems.map((d) => (
              <div key={d.type} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="truncate font-medium text-foreground">{d.label}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2 tabular-nums">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fmtBRL(d.Receita)}</span>
                  <span className="text-muted-foreground">{d.pct.toFixed(0)}%</span>
                  <span className="text-muted-foreground/80">· {d.Pedidos} ped.</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted/10 text-center text-xs text-muted-foreground">
          Nenhuma receita ainda
        </div>
      )}
    </div>
  );
}
