import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, CalendarClock, CheckCircle2, Clock,
  CreditCard, DollarSign, Loader2, MessageSquare, Truck, XCircle,
} from "lucide-react";
import type { Request, RequestTask } from "@/lib/database.types";
import { FormattedMessageContent } from "@/components/dashboard/formatted-message-content";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { updateRequestImage } from "@/lib/dashboard-data";
import { STATUS_COLORS, STATUS_LABELS, TYPE_LABELS } from "./constants";

interface Props {
  req: Request;
  tasks: RequestTask[];
  isPaid: boolean;
  hasQuote: boolean;
  declining: boolean;
  onStartPayment: () => void;
  onDecline: () => void;
  onImageChange?: (url: string | null) => void;
}

export function RequestCard({ req, tasks, isPaid, hasQuote, declining, onStartPayment, onDecline, onImageChange }: Props) {
  const hasImage = !!req.image_url;

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden bg-card flex flex-col md:flex-row">

      {/* ── Imagem (esquerda) — ocupa 100% da altura via self-stretch ── */}
      {hasImage && (
        <div className="relative md:w-[55%] shrink-0 border-b md:border-b-0 md:border-r border-border/60 bg-black/30 self-stretch">
          {/* Botão voltar sobreposto */}
          <Link
            href="/dashboard"
            className="absolute top-3 left-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={req.image_url!}
            alt="Referência do projeto"
            className="w-full h-full object-cover"
            style={{ minHeight: 300 }}
          />
        </div>
      )}

      {/* ── Painel direito ── */}
      <div className="flex flex-col flex-1 min-w-0">
        <RequestHeader req={req} isPaid={isPaid} showBackButton={!hasImage} />
        {hasQuote && <QuoteBar req={req} tasks={tasks} isPaid={isPaid} />}

        {/* Descrição */}
        <div className="px-5 py-4 flex-1 overflow-y-auto">
          <SectionLabel>Descrição</SectionLabel>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{req.description}</p>
        </div>

        {/* Upload de imagem */}
        {onImageChange && (
          <div className="border-t border-border/60 px-5 py-4">
            <SectionLabel>Imagem de referência</SectionLabel>
            <ImageUpload
              value={req.image_url}
              onChange={async (url) => {
                await updateRequestImage(req.id, url);
                onImageChange(url);
              }}
              folder="requests"
            />
          </div>
        )}

        {/* Observações do admin */}
        {req.admin_notes && (
          <div className="border-t border-border/60 px-5 py-4">
            <SectionLabel icon={<MessageSquare className="size-3" />}>Observações</SectionLabel>
            <div className="text-sm leading-relaxed">
              <FormattedMessageContent content={req.admin_notes} />
            </div>
          </div>
        )}

        {/* Ações de pagamento */}
        {req.status === "quoted" && (
          <div className="border-t border-border/60 px-5 py-4 flex gap-3">
            <Button
              onClick={onStartPayment}
              className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <CreditCard className="size-4" />Pagar agora
            </Button>
            <Button
              onClick={onDecline}
              disabled={declining}
              variant="outline"
              className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              {declining
                ? <Loader2 className="size-4 animate-spin" />
                : <XCircle className="size-4" />
              }
              Recusar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-componentes ── */

function RequestHeader({
  req, isPaid, showBackButton,
}: { req: Request; isPaid: boolean; showBackButton: boolean }) {
  return (
    <div className="flex items-start gap-3 border-b border-border/60 px-4 py-3">
      {showBackButton && (
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="size-7 text-muted-foreground shrink-0 mt-0.5 -ml-1"
        >
          <Link href="/dashboard"><ArrowLeft className="size-4" /></Link>
        </Button>
      )}

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold leading-snug">{req.title}</h1>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <Badge>{TYPE_LABELS[req.type] ?? req.type}</Badge>
          <Badge className={STATUS_COLORS[req.status]}>{STATUS_LABELS[req.status]}</Badge>
          {isPaid && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded px-1.5 py-0.5">
              <CheckCircle2 className="size-2.5" />Pago
            </span>
          )}
          <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 ml-auto">
            <Clock className="size-3" />
            {new Date(req.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit", month: "short", year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

function QuoteBar({ req, tasks, isPaid }: { req: Request; tasks: RequestTask[]; isPaid: boolean }) {
  const fmtBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

  const parseBudget = (b: string | null | undefined) => {
    if (!b) return 0;
    const n = parseFloat(b.replace(/[^0-9.,]/g, "").replace(",", "."));
    return isNaN(n) ? 0 : n;
  };

  const budgetBase  = parseBudget(req.budget);
  const extrasTotal = tasks.reduce((acc, t) => acc + ((t.value as number | null) ?? 0), 0);
  const totalGeral  = budgetBase + extrasTotal;
  const paidValue   = isPaid ? totalGeral : 0;
  const remaining   = totalGeral - paidValue;

  return (
    <div className="border-b border-border/60 bg-muted/20">
      {/* linha 1: valores */}
      <div className="flex items-center gap-5 px-5 py-2.5 flex-wrap">
        <MetaItem icon={<DollarSign className="size-3 text-purple-400" />} label="Orçamento base">
          <span className="text-sm font-bold">{req.budget ?? "—"}</span>
        </MetaItem>

        {extrasTotal > 0 && (
          <MetaItem icon={<DollarSign className="size-3 text-emerald-400" />} label="Extras">
            <span className="text-sm font-semibold text-emerald-400">+ {fmtBRL(extrasTotal)}</span>
          </MetaItem>
        )}

        {extrasTotal > 0 && (
          <MetaItem icon={<DollarSign className="size-3 text-foreground" />} label="Total">
            <span className="text-sm font-bold">{fmtBRL(totalGeral)}</span>
          </MetaItem>
        )}

        {req.payment_deadline && (
          <MetaItem icon={<CalendarClock className="size-3 text-muted-foreground" />} label="Vencimento">
            <span className="text-sm font-medium">
              {new Date(req.payment_deadline).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </span>
          </MetaItem>
        )}

        {req.delivery_deadline && (
          <MetaItem icon={<Truck className="size-3 text-muted-foreground" />} label="Entrega">
            <span className="text-sm font-medium">
              {new Date(req.delivery_deadline).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </span>
          </MetaItem>
        )}
      </div>

      {/* linha 2: pago / restante */}
      {totalGeral > 0 && (
        <div className="flex items-center gap-4 px-5 pb-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3 text-emerald-400" />
            <span className="text-[11px] text-muted-foreground">Pago</span>
            <span className={`text-xs font-semibold ${isPaid ? "text-emerald-400" : "text-muted-foreground/60"}`}>
              {fmtBRL(paidValue)}
            </span>
          </div>
          {remaining > 0 && (
            <div className="flex items-center gap-1.5">
              <CreditCard className="size-3 text-amber-400" />
              <span className="text-[11px] text-muted-foreground">Restante</span>
              <span className="text-xs font-semibold text-amber-400">{fmtBRL(remaining)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetaItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-[11px] text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center text-[11px] border rounded px-1.5 py-0.5 ${className}`}>
      {children}
    </span>
  );
}

function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
      {icon}{children}
    </p>
  );
}
