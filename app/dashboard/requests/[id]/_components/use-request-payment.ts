"use client";

import { useRef, useState } from "react";
import { initPaymentBrick, unmountPaymentBrick } from "./mercadopago";
import { verifyPayment } from "./use-request-detail";
import type { Request } from "@/lib/schema";

const PIX_POLL_INTERVAL_MS = 5_000;
const PIX_POLL_TIMEOUT_MS  = 10 * 60_000;

export type PayStep = "idle" | "method" | "paying" | "pix-qr";
export type PayMethod = "pix" | "card";

export interface PixData {
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl?: string;
  amount: number;
}

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
  pixData: PixData | null;
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
  const [pixData, setPixData] = useState<PixData | null>(null);

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
        setPixData(null);
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
    setBrickError(null);

    // PIX: cria pagamento direto no backend (pula a tela de e-mail do brick)
    // e renderiza o QR imediatamente. Só a webhook do MP marca como pago.
    if (method === "pix") {
      try {
        const res = await fetch("/api/payments/pix/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId, stageId: activeStageId }),
        });
        const json = await res.json();
        if (!res.ok) {
          setBrickError(json?.error ?? "Erro ao gerar PIX.");
          return;
        }
        setPixData({
          qrCode: json.pix.qrCode,
          qrCodeBase64: json.pix.qrCodeBase64,
          ticketUrl: json.pix.ticketUrl,
          amount: json.amount ?? preference.amount,
        });
        setPayStep("pix-qr");
        onPending();
        startPixPolling();
      } catch {
        setBrickError("Erro ao gerar PIX. Tente novamente.");
      }
      return;
    }

    // Cartão: usa o brick (precisa dos campos de número/cvv/validade)
    setPayStep("paying");
    setBrickLoading(true);
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

            // Backend sempre retorna pending — só a webhook do MP altera o estado.
            // PIX: temos o QR pra renderizar dentro do site (não depende mais do email).
            // Cartão: ficamos esperando a confirmação via polling.
            if (json.pix?.qrCodeBase64 && preference) {
              await unmount();
              setPixData({
                qrCode: json.pix.qrCode,
                qrCodeBase64: json.pix.qrCodeBase64,
                ticketUrl: json.pix.ticketUrl,
                amount: preference.amount,
              });
              setPayStep("pix-qr");
            }
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
    setPixData(null);
  }

  async function goBackToMethod() {
    await unmount();
    setPayStep("method");
    setBrickError(null);
  }

  return {
    payStep, payMethod, brickLoading, brickError, preference, activeStageId, pixData,
    startPayment, selectMethod, cancelPayment, goBackToMethod,
  };
}
