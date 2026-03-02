"use client";

import { use, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/dashboard/auth-provider";
import { LoginOverlay } from "@/components/dashboard/login-overlay";
import { RequestChat } from "@/components/dashboard/request-chat";

import { useRequestDetail } from "./_components/use-request-detail";
import { useRequestPayment } from "./_components/use-request-payment";
import { PaymentFeedbackBanner } from "./_components/payment-feedback";
import { PaymentFlow } from "./_components/payment-flow";
import { RequestCard } from "./_components/request-card";
import { QUOTE_STATUSES } from "./_components/constants";
import { useNotifications } from "@/hooks/use-notifications";

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();

  const { markRequestRead } = useNotifications();

  const {
    req, loading, paymentFeedback, dismissFeedback, decline, declining, updateReq,
  } = useRequestDetail({ id, userId: user?.id });

  // Marca notificações deste pedido como lidas ao abrir a página
  useEffect(() => {
    if (user && id) markRequestRead(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  const {
    payStep, payMethod, brickLoading, brickError, preference,
    startPayment, selectMethod, cancelPayment, goBackToMethod,
  } = useRequestPayment({
    requestId: id,
    onApproved: (patch) => { updateReq(patch); dismissFeedback(); setTimeout(() => updateReq({ status: "approved" }), 0); },
    onPending: () => { /* feedback é controlado pelo banner */ },
  });

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <LoginOverlay />;

  if (!req) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-sm">
        Pedido não encontrado.
      </div>
    );
  }

  const hasQuote = QUOTE_STATUSES.includes(req.status as typeof QUOTE_STATUSES[number]) && !!req.budget;
  const isPaid = !!req.paid_at || !!req.paid_manually;

  // Tela de pagamento substitui o layout inteiro
  if (payStep !== "idle") {
    return (
      <PaymentFlow
        title={req.title}
        budget={req.budget}
        requestType={req.type}
        payStep={payStep}
        payMethod={payMethod}
        brickLoading={brickLoading}
        brickError={brickError}
        preferenceReady={!!preference}
        onCancel={cancelPayment}
        onSelectMethod={selectMethod}
        onGoBack={goBackToMethod}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <PaymentFeedbackBanner feedback={paymentFeedback} onDismiss={dismissFeedback} />

      <RequestCard
        req={req}
        isPaid={isPaid}
        hasQuote={hasQuote}
        declining={declining}
        onStartPayment={startPayment}
        onDecline={decline}
      />

      <RequestChat requestId={req.id} isAdmin={false} />
    </div>
  );
}
