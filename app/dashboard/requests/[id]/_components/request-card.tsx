import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, CalendarClock, CheckCircle2, Clock,
  CreditCard, DollarSign, Loader2, MessageSquare, Truck, XCircle,
} from "lucide-react";
import type { Request } from "@/lib/database.types";
import { STATUS_COLORS, STATUS_LABELS, TYPE_LABELS } from "./constants";

interface Props {
  req: Request;
  isPaid: boolean;
  hasQuote: boolean;
  declining: boolean;
  onStartPayment: () => void;
  onDecline: () => void;
}

export function RequestCard({ req, isPaid, hasQuote, declining, onStartPayment, onDecline }: Props) {
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
        {hasQuote && <QuoteBar req={req} />}

        {/* Descrição */}
        <div className="px-5 py-4 flex-1 overflow-y-auto">
          <SectionLabel>Descrição</SectionLabel>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{req.description}</p>
        </div>

        {/* Mensagem do admin */}
        {req.admin_notes && (
          <div className="border-t border-border/60 px-5 py-4">
            <SectionLabel icon={<MessageSquare className="size-3" />}>Mensagem</SectionLabel>
            <p className="text-sm leading-relaxed">{req.admin_notes}</p>
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

function QuoteBar({ req }: { req: Request }) {
  return (
    <div className="flex items-center gap-5 border-b border-border/60 px-5 py-2.5 bg-muted/20 flex-wrap">
      <MetaItem icon={<DollarSign className="size-3 text-purple-400" />} label="Valor">
        <span className="text-sm font-bold">{req.budget}</span>
      </MetaItem>
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
