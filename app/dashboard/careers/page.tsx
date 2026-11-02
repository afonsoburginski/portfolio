"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Job = {
  id: string; provider: string; title: string; company: string; location: string;
  salary: string | null; sourceUrl: string; publishedAt: string | null;
};
type Result = { jobs: Job[]; count: number; providers: { id: string; ok: boolean }[] };

export default function CareersPage() {
  const [query, setQuery] = useState("Senior Software Engineer");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/career/jobs?query=${encodeURIComponent(query)}&limit=50`, {
        credentials: "same-origin", cache: "no-store",
      });
      if (!response.ok) throw new Error(response.status === 401 ? "Sessão não autorizada." : "Busca indisponível.");
      setResult(await response.json() as Result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erro ao consultar as vagas.");
      setResult(null);
    } finally { setLoading(false); }
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-neutral-500">Career Agent · Acesso privado</p>
        <h1 className="text-3xl font-semibold tracking-tight">Vagas de tecnologia</h1>
        <p className="mt-2 text-sm text-neutral-400">Busca em Jobicy e Remotive. Consulte os requisitos e candidate-se no site original.</p>
      </div>
      <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} maxLength={100}
          placeholder="Cargo ou tecnologia" aria-label="Cargo ou tecnologia" className="sm:max-w-lg" />
        <Button type="submit" disabled={loading || !query.trim()}>{loading ? "Pesquisando…" : "Buscar vagas"}</Button>
      </form>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {result && (
        <>
          <p className="text-sm text-neutral-400">
            {result.jobs.length} de {result.count} vagas · {result.providers.map((p) => `${p.id}: ${p.ok ? "ativo" : "indisponível"}`).join(" · ")}
          </p>
          <div className="grid gap-3">
            {result.jobs.map((job) => (
              <article key={job.id} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-medium">{job.title}</h2>
                    <p className="mt-1 text-sm text-neutral-400">{job.company} · {job.location}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Fonte: <a className="underline hover:text-white" target="_blank" rel="noopener noreferrer"
                        href={job.provider === "jobicy" ? "https://jobicy.com" : "https://remotive.com"}>
                        {job.provider === "jobicy" ? "Jobicy" : "Remotive"}
                      </a>{job.salary ? ` · ${job.salary}` : ""}
                    </p>
                  </div>
                  <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800">
                    Ver vaga original
                  </a>
                </div>
              </article>
            ))}
            {!result.jobs.length && <p className="text-sm text-neutral-400">Nenhuma vaga encontrada com esses termos.</p>}
          </div>
        </>
      )}
    </section>
  );
}
