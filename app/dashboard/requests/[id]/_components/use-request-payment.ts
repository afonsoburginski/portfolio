"use client";

import { useRef, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { initPaymentBrick, unmountPaymentBrick } from "./mercadopago";
import { verifyPayment } from "./use-request-detail";
import type { Request } from "@/lib/database.types";

const PIX_POLL_INTERVAL_MS = 5_000;  // verifica a cada 5s
const PIX_POLL_TIMEOUT_MS  = 10 * 60_000; // para depois de 10min

export type PayStep = "idle" | "method" | "paying";
export type PayMethod = "pix" | "card";

interface Preference {
  id: string;
  amount: number;
}

interface UseRequestPaymentOptions {
  requestId: string;
  onApproved: (patch: Partial<Request>) => void;
  onPending: () => void;
}

interface UseRequestPaymentResult {
  payStep: PayStep;
  payMethod: PayMethod | null;
  brickLoading: boolean;
  brickError: string | null;
  preference: Preference | null;
  startPayment: () => Promise<void>;
  selectMethod: (method: PayMethod) => Promise<void>;
  cancelPayment: () => Promise<void>;
  goBackToMethod: () => Promise<void>;
}

async function getAccessToken(): Promise<string> {
  const { data: { session } } = await createBrowserSupabase().auth.getSession();
  if (!session?.access_token) throw new Error("Sem sessão ativa");
  return session.access_token;
}

export function useRequestPayment({
  requestId,
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

  async function unmount() {
    await unmountPaymentBrick(brickMounted);
  }

  function stopPolling() {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }

  /**
   * Camada 4 — polling local para PIX pendente.
   * Consulta /api/payments/verify a cada 5s até o pagamento ser aprovado
   * ou o timeout de 10min ser atingido.
   */
  function startPixPolling() {
    stopPolling();
    pollStartedAt.current = Date.now();

    pollTimer.current = setInterval(async () => {
      const elapsed = Date.now() - pollStartedAt.current;
      if (elapsed >= PIX_POLL_TIMEOUT_MS) { stopPolling(); return; }

      const status = await verifyPayment(requestId);
      if (status === "approved") {
        stopPolling();
        onApproved({ status: "approved", paid_at: new Date().toISOString() });
        setPayStep("idle");
      }
    }, PIX_POLL_INTERVAL_MS);
  }

  async function startPayment() {
    setBrickError(null);
    setPayStep("method");
    // Pré-carrega preferência em background para não travar ao selecionar método
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requestId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erro ao criar preferência");
      }
      const { preferenceId, amount } = await res.json();
      setPreference({ id: preferenceId, amount });
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

    // Aguarda o React commitar o DOM com o div #mp-payment-brick antes de montar o Brick
    await new Promise<void>(resolve => setTimeout(resolve, 0));

    const { data: { session } } = await createBrowserSupabase().auth.getSession();
    const payerEmail = session?.user?.email ?? undefined;

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
            const token = await getAccessToken();
            const res = await fetch("/api/payments/process", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ requestId, formData }),
            });
            const json = await res.json();

            if (json.status === "approved") {
              await unmount();
              onApproved({ status: "approved", paid_at: new Date().toISOString() });
              setPayStep("idle");
            } else if (json.status === "pending" || json.status === "in_process") {
              await unmount();
              onPending();
              setPayStep("idle");
              // Camada 4: inicia polling local — verifica aprovação a cada 5s
              startPixPolling();
            } else {
              setBrickError("Pagamento não aprovado. Verifique os dados e tente novamente.");
            }
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
  }

  async function goBackToMethod() {
    await unmount();
    setPayStep("method");
    setBrickError(null);
  }

  return {
    payStep, payMethod, brickLoading, brickError, preference,
    startPayment, selectMethod, cancelPayment, goBackToMethod,
  };
}
