// Página pública (sem auth) com a visão do orçamento.
// Server component — busca direto do service.

import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarClock, CheckCircle2, Clock, FileText, Receipt, Truck } from "lucide-react";
import { getPublicQuoteByToken, QuoteNotFoundError, type PublicQuoteView } from "@/lib/services/quotes";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  submitted: "Enviado",
  reviewing: "Em análise",
  quoted: "Orçamento pronto",
  approved: "Aprovado",
  rejected: "Recusado",
  in_progress: "Em produção",
  delivered: "Concluído",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  reviewing: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  quoted: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  approved: "bg-green-500/15 text-green-400 border-green-500/20",
  rejected: "bg-red-500/15 text-red-400 border-red-500/20",
  in_progress: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-neutral-500/15 text-neutral-400 border-neutral-500/20",
};

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function PublicQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let quote: PublicQuoteView;
  try {
    quote = await getPublicQuoteByToken(token);
  } catch (err) {
    if (err instanceof QuoteNotFoundError) notFound();
    throw err;
  }

  const paidTotal = quote.stages
    .filter((s) => s.status === "paid")
    .reduce((sum, s) => sum + s.amount, 0);
  const pendingTotal = quote.stages
    .filter((s) => s.status === "pending")
    .reduce((sum, s) => sum + s.amount, 0);
  const total = quote.stages.reduce((sum, s) => sum + s.amount, 0);
  const heroImage = quote.attachments.find((a) => a.kind === "image") ?? null;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-3xl space-y-4">
        {/* Header */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Orçamento</p>
              <h1 className="mt-1 text-xl font-semibold leading-tight">{quote.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={`inline-flex items-center rounded border px-1.5 py-0.5 ${
                    STATUS_COLORS[quote.status] ?? "border-border bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {STATUS_LABELS[quote.status] ?? quote.status}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3" />
                  Atualizado {fmtDate(quote.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Imagem hero (se houver) */}
        {heroImage && (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage.url}
              alt={heroImage.name ?? "Referência"}
              className="aspect-video w-full object-cover"
            />
          </div>
        )}

        {/* Resumo financeiro */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MoneyCard label="Total" value={total > 0 ? fmtBRL(total) : (quote.budget ?? "—")} accent="foreground" />
          <MoneyCard label="Já pago" value={fmtBRL(paidTotal)} accent="emerald" />
          <MoneyCard label="A pagar" value={fmtBRL(pendingTotal)} accent="amber" />
        </div>

        {/* Descrição */}
        <Section title="Descrição" icon={<FileText className="size-3.5" />}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{quote.description}</p>
        </Section>

        {/* Etapas */}
        {quote.stages.length > 0 && (
          <Section title="Etapas" icon={<Receipt className="size-3.5" />}>
            <div className="space-y-2">
              {quote.stages.map((stage) => {
                const paid = stage.status === "paid";
                const cancelled = stage.status === "cancelled";
                return (
                  <div
                    key={stage.id}
                    className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/10 px-3 py-2.5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{stage.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">{fmtBRL(stage.amount)}</span>
                        {paid && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="size-3" />
                            Pago em {fmtDate(stage.paid_at)}
                          </span>
                        )}
                        {cancelled && <span className="text-neutral-400">Cancelado</span>}
                        {!paid && !cancelled && stage.due_date && (
                          <span className="flex items-center gap-1">
                            <CalendarClock className="size-3" />
                            Vence {fmtDate(stage.due_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Datas-chave */}
        {(quote.payment_deadline || quote.delivery_deadline) && (
          <Section title="Prazos" icon={<CalendarClock className="size-3.5" />}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {quote.payment_deadline && (
                <div className="rounded-lg border border-border/60 px-3 py-2">
                  <p className="text-[11px] text-muted-foreground">Vencimento do pagamento</p>
                  <p className="text-sm font-medium">{fmtDate(quote.payment_deadline)}</p>
                </div>
              )}
              {quote.delivery_deadline && (
                <div className="rounded-lg border border-border/60 px-3 py-2">
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Truck className="size-3" />Entrega
                  </p>
                  <p className="text-sm font-medium">{fmtDate(quote.delivery_deadline)}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* CTA */}
        <div className="rounded-xl border border-border/60 bg-muted/10 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Para acompanhar e efetuar pagamentos, entre na sua área do cliente.
          </p>
          <Link
            href={`/dashboard/requests/${quote.id}`}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
          >
            Acessar painel
          </Link>
        </div>

        <p className="pt-4 text-center text-[11px] text-muted-foreground/60">
          Documento gerado automaticamente — qualquer divergência, fale com seu contato.
        </p>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {title}
      </p>
      {children}
    </div>
  );
}

function MoneyCard({ label, value, accent }: { label: string; value: string; accent: "foreground" | "emerald" | "amber" }) {
  const colorMap = {
    foreground: "text-foreground",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
  } as const;
  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${colorMap[accent]}`}>{value}</p>
    </div>
  );
}
