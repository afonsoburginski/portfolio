import { AlertCircle, ArrowLeft, ChevronLeft, CreditCard, Loader2, QrCode } from "lucide-react";
import type { PayMethod, PayStep } from "./use-request-payment";
import { TYPE_LABELS } from "./constants";

interface Props {
  title: string;
  budget: string | null | undefined;
  requestType: string;
  payStep: PayStep;
  payMethod: PayMethod | null;
  brickLoading: boolean;
  brickError: string | null;
  preferenceReady: boolean;
  onCancel: () => void;
  onSelectMethod: (method: PayMethod) => void;
  onGoBack: () => void;
}

export function PaymentFlow({
  title, budget, requestType,
  payStep, payMethod, brickLoading, brickError, preferenceReady,
  onCancel, onSelectMethod, onGoBack,
}: Props) {
  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 py-4">

      {/* Header com indicador de progresso */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Pagamento</p>
          <p className="text-sm font-semibold truncate">{title}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className={`size-2 rounded-full ${payStep === "method" ? "bg-purple-400" : "bg-purple-400/30"}`} />
          <span className={`size-2 rounded-full ${payStep === "paying" ? "bg-purple-400" : "bg-purple-400/30"}`} />
        </div>
      </div>

      {/* Resumo do valor */}
      <div className="rounded-xl border border-border/60 bg-card px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Total a pagar</p>
          <p className="text-2xl font-bold">{budget}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Projeto</p>
          <p className="text-xs font-medium text-muted-foreground truncate max-w-[140px]">
            {TYPE_LABELS[requestType] ?? requestType}
          </p>
        </div>
      </div>

      {/* Step 1 — seleção de método */}
      {payStep === "method" && (
        <div className="space-y-4">
          <div>
            <p className="text-base font-semibold">Como você quer pagar?</p>
            <p className="text-xs text-muted-foreground mt-0.5">Escolha o método de pagamento</p>
          </div>

          {brickError && <ErrorAlert message={brickError} />}

          <div className="grid grid-cols-2 gap-3">
            <MethodCard
              label="PIX"
              sublabel="Instantâneo · sem taxas"
              icon={<QrCode className="size-7" />}
              iconBg="bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20"
              border="hover:border-emerald-500/50 hover:bg-emerald-500/5"
              disabled={!preferenceReady}
              onClick={() => onSelectMethod("pix")}
            />
            <MethodCard
              label="Cartão"
              sublabel="Crédito ou débito"
              icon={<CreditCard className="size-7" />}
              iconBg="bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20"
              border="hover:border-purple-500/50 hover:bg-purple-500/5"
              disabled={!preferenceReady}
              onClick={() => onSelectMethod("card")}
            />
          </div>
        </div>
      )}

      {/* Step 2 — brick de pagamento */}
      {payStep === "paying" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onGoBack}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="size-3.5" />Voltar
            </button>
            <span className="text-muted-foreground/40">·</span>
            <span className="flex items-center gap-1.5 text-xs font-medium">
              {payMethod === "pix"
                ? <><QrCode className="size-3.5 text-emerald-400" />PIX</>
                : <><CreditCard className="size-3.5 text-purple-400" />Cartão</>
              }
            </span>
          </div>

          {brickLoading && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
              <span className="text-xs">Carregando formulário...</span>
            </div>
          )}

          {brickError && <ErrorAlert message={brickError} />}

          <div id="mp-payment-brick" className={brickLoading ? "opacity-0 h-0 overflow-hidden" : ""} />
        </div>
      )}
    </div>
  );
}

/* ── Sub-componentes locais ── */

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2">
      <AlertCircle className="size-4 text-red-400 shrink-0" />
      <p className="text-xs text-red-400">{message}</p>
    </div>
  );
}

interface MethodCardProps {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  iconBg: string;
  border: string;
  disabled: boolean;
  onClick: () => void;
}

function MethodCard({ label, sublabel, icon, iconBg, border, disabled, onClick }: MethodCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-6 text-center transition-all hover:shadow-md disabled:pointer-events-none disabled:opacity-40 ${border}`}
    >
      <div className={`flex size-14 items-center justify-center rounded-2xl transition-colors ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>
      </div>
      {disabled && (
        <Loader2 className="absolute right-3 top-3 size-3 animate-spin text-muted-foreground" />
      )}
    </button>
  );
}
