import { AlertCircle, CheckCircle2, Sparkles, XCircle } from "lucide-react";
import type { PaymentFeedback } from "./use-request-detail";

interface Props {
  feedback: PaymentFeedback;
  onDismiss: () => void;
}

export function PaymentFeedbackBanner({ feedback, onDismiss }: Props) {
  if (!feedback) return null;

  if (feedback === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-5 py-5 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/15">
          <CheckCircle2 className="size-6 text-emerald-400" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
            <Sparkles className="size-3.5" />Pagamento confirmado!
          </p>
          <p className="text-xs text-muted-foreground">
            Pedido aprovado — em breve começo o desenvolvimento.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          Fechar
        </button>
      </div>
    );
  }

  if (feedback === "pending") {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 px-4 py-3">
        <AlertCircle className="size-5 text-yellow-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-yellow-400">Pagamento pendente</p>
          <p className="text-xs text-muted-foreground">
            Assim que confirmado, o pedido será aprovado automaticamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3">
      <XCircle className="size-5 text-red-400 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-red-400">Pagamento não concluído</p>
        <p className="text-xs text-muted-foreground">Verifique seus dados e tente novamente.</p>
      </div>
    </div>
  );
}
