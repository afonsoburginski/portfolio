"use client";

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Request, RequestAttachment, RequestStage, RequestTask } from "@/lib/schema";

export type PaymentFeedback = "success" | "pending" | "failure" | null;

interface UseRequestDetailOptions {
  id: string;
  userId: string | undefined;
}

interface UseRequestDetailResult {
  req: Request | null;
  tasks: RequestTask[];
  stages: RequestStage[];
  attachments: RequestAttachment[];
  loading: boolean;
  paymentFeedback: PaymentFeedback;
  dismissFeedback: () => void;
  decline: () => Promise<void>;
  declining: boolean;
  updateReq: (patch: Partial<Request>) => void;
  setStages: Dispatch<SetStateAction<RequestStage[]>>;
  setAttachments: Dispatch<SetStateAction<RequestAttachment[]>>;
}

export async function verifyPayment(requestId: string, stageId?: string | null): Promise<string> {
  try {
    const qs = new URLSearchParams({ requestId, ...(stageId ? { stageId } : {}) });
    const res = await fetch(`/api/payments/verify?${qs.toString()}`);
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
  const [tasks, setTasks] = useState<RequestTask[]>([]);
  const [stages, setStages] = useState<RequestStage[]>([]);
  const [attachments, setAttachments] = useState<RequestAttachment[]>([]);
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
      const data = await res.json();
      const { request_tasks: reqTasks, request_attachments: reqAttachments, request_stages: reqStages, ...request } = data as Request & {
        request_tasks?: RequestTask[];
        request_attachments?: RequestAttachment[];
        request_stages?: RequestStage[];
      };
      setReq(request);
      setTasks(reqTasks ?? []);
      setStages(reqStages ?? []);
      setAttachments(reqAttachments ?? []);

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
    tasks,
    stages,
    attachments,
    loading,
    paymentFeedback,
    dismissFeedback: () => setPaymentFeedback(null),
    decline,
    declining,
    updateReq,
    setStages,
    setAttachments,
  };
}
