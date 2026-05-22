"use client";

import { useRef, useState } from "react";
import { initPaymentBrick, unmountPaymentBrick } from "./mercadopago";
import { verifyPayment } from "./use-request-detail";
import type { Request } from "@/lib/schema";

const PIX_POLL_INTERVAL_MS = 5_000;
const PIX_POLL_TIMEOUT_MS  = 10 * 60_000;

export type PayStep = "idle" | "method" | "paying";
export type PayMethod = "pix" | "card";

interface Preference {
  id: string;
  amount: number;
  stageId: string | null;
}

interface UseRequestPaymentOptions {
  requestId: string;
  payerEmail?: string;
  onApproved: (patch: Partial<Request>, stageId: string | null) => void;
  onPending: () => void;
}

interface UseRequestPaymentResult {
  payStep: PayStep;
  payMethod: PayMethod | null;
  brickLoading: boolean;
  brickError: string | null;
  preference: Preference | null;
  activeStageId: string | null;
  startPayment: (stageId?: string | null) => Promise<void>;
  selectMethod: (method: PayMethod) => Promise<void>;
  cancelPayment: () => Promise<void>;
  goBackToMethod: () => Promise<void>;
}

export function useRequestPayment({
  requestId,
  payerEmail,
  onApproved,
  onPending,
}: UseRequestPaymentOptions): UseRequestPaymentResult {
  const brickMounted  = useRef(false);
  const pollTimer     = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartedAt = useRef<number>(0);

  const [payStep, setPayStep] = useState<PayStep>("idle");
  const [payMethod, setPayMethod] = useState<PayMethod | null>(null);
  const [brickLoading, setBrickLoading] = useState(false);
  const [brickError, setBrickError] = useState<string | null>(null);
  const [preference, setPreference] = useState<Preference | null>(null);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);

  async function unmount() {
    await unmountPaymentBrick(brickMounted);
  }

  function stopPolling() {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }

  function startPixPolling() {
    stopPolling();
    pollStartedAt.current = Date.now();

    pollTimer.current = setInterval(async () => {
      const elapsed = Date.now() - pollStartedAt.current;
      if (elapsed >= PIX_POLL_TIMEOUT_MS) { stopPolling(); return; }

      const status = await verifyPayment(requestId, activeStageId);
      if (status === "approved") {
        stopPolling();
        onApproved({ status: "approved", paid_at: new Date().toISOString() }, activeStageId);
        setPayStep("idle");
      }
    }, PIX_POLL_INTERVAL_MS);
  }

  async function startPayment(stageId: string | null = null) {
    setBrickError(null);
    setPayStep("method");
    setActiveStageId(stageId);
    try {
      const res = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, stageId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erro ao criar preferência");
      }
      const { preferenceId, amount, stageId: returnedStageId } = await res.json();
      setPreference({ id: preferenceId, amount, stageId: returnedStageId ?? null });
    } catch (err) {
      setBrickError(err instanceof Error ? err.message : "Erro desconhecido");
    }
  }

  async function selectMethod(method: PayMethod) {
    if (!preference) {
      setBrickError("Preferência não carregada. Tente novamente.");
      return;
    }
    setPayMethod(method);
    setPayStep("paying");
    setBrickLoading(true);
    setBrickError(null);
    brickMounted.current = true;

    await new Promise<void>(resolve => setTimeout(resolve, 0));

    try {
      await initPaymentBrick({
        preferenceId: preference.id,
        amount: preference.amount,
        method,
        payerEmail,
        onReady: () => setBrickLoading(false),
        onError: (err) => {
          console.error("[MP Brick]", err);
          setBrickError("Erro ao carregar. Tente novamente.");
          setBrickLoading(false);
        },
        onSubmit: async ({ formData }) => {
          try {
            const res = await fetch("/api/payments/process", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ requestId, stageId: activeStageId, formData }),
            });
            const json = await res.json();

            if (!res.ok) {
              setBrickError(json?.error ?? "Erro ao processar pagamento.");
              return;
            }

            // O backend sempre retorna pending. Só a webhook do MP altera o estado.
            // Mantém o brick montado pra mostrar o QR (PIX) ou recibo (cartão)
            // e dispara polling — o verify lê o D1 e detecta quando a webhook aprovou.
            onPending();
            startPixPolling();
          } catch {
            setBrickError("Erro ao processar. Tente novamente.");
          }
        },
      });
    } catch (err) {
      setBrickError(err instanceof Error ? err.message : "Erro desconhecido");
      setBrickLoading(false);
    }
  }

  async function cancelPayment() {
    stopPolling();
    await unmount();
    setPayStep("idle");
    setPayMethod(null);
    setBrickError(null);
    setPreference(null);
    setActiveStageId(null);
  }

  async function goBackToMethod() {
    await unmount();
    setPayStep("method");
    setBrickError(null);
  }

  return {
    payStep, payMethod, brickLoading, brickError, preference, activeStageId,
    startPayment, selectMethod, cancelPayment, goBackToMethod,
  };
}
