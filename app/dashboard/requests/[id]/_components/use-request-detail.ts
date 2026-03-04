"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Request } from "@/lib/schema";

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

export async function verifyPayment(requestId: string): Promise<string> {
  try {
    const res = await fetch(`/api/payments/verify?requestId=${requestId}`);
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

  useEffect(() => {
    const status = searchParams.get("payment");
    if (status === "success" || status === "pending" || status === "failure") {
      setPaymentFeedback(status);
      router.replace(`/dashboard/requests/${id}`, { scroll: false });
    }
  }, [searchParams, id, router]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    async function load() {
      const res = await fetch(`/api/requests/${id}`);
      if (!res.ok) return;
      const request: Request = await res.json();
      setReq(request);

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
      await fetch(`/api/requests/${req.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
