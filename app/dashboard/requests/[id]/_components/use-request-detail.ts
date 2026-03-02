"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import type { Request } from "@/lib/database.types";

export type PaymentFeedback = "success" | "pending" | "failure" | null;

interface UseRequestDetailOptions {
  id: string;
  userId: string | undefined;
}

interface UseRequestDetailResult {
  req: Request | null;
  loading: boolean;
  paymentFeedback: PaymentFeedback;
  dismissFeedback: () => void;
  decline: () => Promise<void>;
  declining: boolean;
  updateReq: (patch: Partial<Request>) => void;
}

async function getAccessToken(): Promise<string> {
  const { data: { session } } = await createBrowserSupabase().auth.getSession();
  if (!session?.access_token) throw new Error("Sem sessão ativa");
  return session.access_token;
}

/**
 * Verifica o status do pagamento no MercadoPago e corrige o DB se necessário.
 * Retorna "approved" se o pagamento foi confirmado (agora ou antes).
 */
export async function verifyPayment(requestId: string): Promise<string> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`/api/payments/verify?requestId=${requestId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return "unknown";
    const json = await res.json();
    return json.status ?? "unknown";
  } catch {
    return "unknown";
  }
}

export function useRequestDetail({ id, userId }: UseRequestDetailOptions): UseRequestDetailResult {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [req, setReq] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [declining, setDeclining] = useState(false);
  const [paymentFeedback, setPaymentFeedback] = useState<PaymentFeedback>(null);

  // Lê o resultado de pagamento da URL e limpa o param
  useEffect(() => {
    const status = searchParams.get("payment");
    if (status === "success" || status === "pending" || status === "failure") {
      setPaymentFeedback(status);
      router.replace(`/dashboard/requests/${id}`, { scroll: false });
    }
  }, [searchParams, id, router]);

  // Busca o pedido e verifica silenciosamente se um pagamento pendente foi aprovado
  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    async function load() {
      const { data } = await createBrowserSupabase()
        .from("requests")
        .select("*, profiles(id, full_name, email, avatar_url)")
        .eq("id", id)
        .single();
      if (!data) return;
      const request = data as unknown as Request;
      setReq(request);

      // Camada 3: se o pedido tem payment_id mas ainda está como "quoted",
      // verifica no MP — pode ter sido pago mas o webhook falhou
      if (request.status === "quoted" && request.mp_payment_id) {
        const status = await verifyPayment(id);
        if (status === "approved") {
          setReq(prev => prev ? {
            ...prev,
            status: "approved",
            paid_at: new Date().toISOString(),
          } : prev);
          setPaymentFeedback("success");
        }
      }
    }

    load().catch(console.error).then(() => setLoading(false));
  }, [userId, id]);

  function updateReq(patch: Partial<Request>) {
    setReq(prev => prev ? { ...prev, ...patch } : prev);
  }

  async function decline() {
    if (!req) return;
    setDeclining(true);
    try {
      const token = await getAccessToken();
      await fetch(`/api/requests/${req.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "rejected" }),
      });
      updateReq({ status: "rejected" });
    } finally {
      setDeclining(false);
    }
  }

  return {
    req,
    loading,
    paymentFeedback,
    dismissFeedback: () => setPaymentFeedback(null),
    decline,
    declining,
    updateReq,
  };
}
