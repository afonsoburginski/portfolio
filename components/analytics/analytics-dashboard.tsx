"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Eye, FileText, Globe2, Linkedin, RefreshCw } from "lucide-react";

type Metric = { views: number };
type AnalyticsData = {
  range: { since: string; today: string };
  summary: { views30d: number; articleViews30d: number; pages30d: number; viewsToday: number };
  daily: Array<{ day: string; views: number }>;
  pages: Array<{ path: string; views: number }>;
  referrers: Array<{ domain: string; views: number }>;
  countries: Array<{ country: string; views: number }>;
  devices: Array<{ device: string; views: number }>;
  linkedin: { connected: boolean; analyticsAvailable: boolean };
};

const count = new Intl.NumberFormat("pt-BR");
const dateLabel = (day: string) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`));

function MetricCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Eye }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="flex items-center justify-between text-sm text-neutral-400">
        <span>{label}</span>
        <Icon className="size-4 text-neutral-500" aria-hidden="true" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{count.format(value)}</p>
    </article>
  );
}

function Ranking({ title, items, label }: { title: string; items: Array<Metric & { name: string }>; label: string }) {
  const max = Math.max(1, ...items.map((item) => item.views));
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <h2 className="text-sm font-medium text-neutral-200">{title}</h2>
      {items.length ? (
        <ol className="mt-4 space-y-4">
          {items.map((item) => (
            <li key={item.name}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span className="min-w-0 truncate text-neutral-300" title={item.name}>{item.name}</span>
                <span className="shrink-0 tabular-nums text-neutral-500">{count.format(item.views)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5" role="img" aria-label={`${label}: ${item.name}`}>
                <div className="h-full rounded-full bg-[#2dd4bf]/70" style={{ width: `${Math.max(3, item.views / max * 100)}%` }} />
              </div>
            </li>
          ))}
        </ol>
      ) : <p className="mt-4 text-sm text-neutral-500">Sem dados neste período.</p>}
    </section>
  );
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/analytics", { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "Acesso não autorizado." : "Não foi possível carregar os dados.");
      setData(await response.json() as AnalyticsData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const daily = useMemo(() => {
    if (!data) return [];
    const values = new Map(data.daily.map((item) => [item.day, item.views]));
    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date(Date.now() - (13 - index) * 86_400_000).toISOString().slice(0, 10);
      return { day: date, views: values.get(date) ?? 0 };
    });
  }, [data]);
  const maxDaily = Math.max(1, ...daily.map((item) => item.views));

  if (loading && !data) return <div className="py-20 text-center text-sm text-neutral-500">Carregando analytics…</div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Portfolio</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Analytics do site</h1>
          <p className="mt-1 text-sm text-neutral-400">Tráfego agregado dos últimos 30 dias</p>
        </div>
        <button onClick={() => void refresh()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-neutral-300 transition hover:bg-white/5 disabled:opacity-50">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Atualizar
        </button>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Visualizações · 30 dias" value={data?.summary.views30d ?? 0} icon={Eye} />
        <MetricCard label="Artigos · 30 dias" value={data?.summary.articleViews30d ?? 0} icon={FileText} />
        <MetricCard label="Hoje" value={data?.summary.viewsToday ?? 0} icon={BarChart3} />
        <MetricCard label="Páginas visitadas" value={data?.summary.pages30d ?? 0} icon={Globe2} />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-neutral-200">Visualizações por dia</h2>
          <span className="text-xs text-neutral-500">14 dias · fuso UTC</span>
        </div>
        {daily.every((item) => item.views === 0) ? (
          <p className="py-12 text-center text-sm text-neutral-500">A coleta começa quando a nova versão entrar no ar.</p>
        ) : (
          <div className="mt-6 grid h-44 grid-cols-7 gap-2 sm:grid-cols-14" aria-label="Gráfico de visualizações dos últimos 14 dias">
            {daily.map((item) => (
              <div key={item.day} className="flex min-w-0 flex-col items-center justify-end gap-2" title={`${dateLabel(item.day)}: ${count.format(item.views)} visualizações`}>
                <span className="hidden text-[10px] tabular-nums text-neutral-500 sm:block">{item.views || ""}</span>
                <div className="w-full rounded-t-md bg-[#1f6feb]/75" style={{ height: `${item.views ? Math.max(5, item.views / maxDaily * 100) : 2}%` }} />
                <span className="text-[9px] text-neutral-600">{dateLabel(item.day).slice(0, 5)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <Ranking title="Páginas mais vistas" items={(data?.pages ?? []).map((item) => ({ name: item.path, views: item.views }))} label="Página" />
        <Ranking title="Origem do tráfego" items={(data?.referrers ?? []).map((item) => ({ name: item.domain, views: item.views }))} label="Origem" />
        <Ranking title="Países" items={(data?.countries ?? []).map((item) => ({ name: item.country, views: item.views }))} label="País" />
        <Ranking title="Dispositivos" items={(data?.devices ?? []).map((item) => ({ name: item.device, views: item.views }))} label="Dispositivo" />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-200"><Linkedin className="size-4 text-[#2dd4bf]" aria-hidden="true" /> LinkedIn</div>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          {data?.linkedin.analyticsAvailable
            ? "A permissão de analytics está disponível, mas as métricas do LinkedIn ainda não são importadas por este painel. A API fornece contagens, não nomes de leitores."
            : data?.linkedin.connected
              ? "A conexão atual permite publicar, mas não ler métricas de alcance. O LinkedIn exige acesso adicional para analytics; mesmo com ele, a API retorna contagens, não nomes de leitores."
              : "Conecte o LinkedIn para publicar. A API não fornece a identidade dos leitores de artigos."}
        </p>
      </section>

      <p className="rounded-xl border border-white/5 px-4 py-3 text-xs leading-5 text-neutral-500">
        Métricas agregadas a partir da ativação. Sem IP armazenado, cookies, IDs de visitantes ou user-agent bruto. Crawlers identificados são filtrados; visitantes únicos não são calculados.
      </p>
    </div>
  );
}
