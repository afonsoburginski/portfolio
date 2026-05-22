// Página pública (sem auth) — mesma UI do /dashboard/requests/[id], só que
// read-only. Reaproveita o RequestCard.

import { notFound } from "next/navigation";
import Link from "next/link";
import { loadQuoteByShareToken } from "@/lib/repos/quotes";
import { RequestCard } from "@/app/dashboard/requests/[id]/_components/request-card";
import type { Request, RequestAttachment, RequestStage } from "@/lib/schema";

export const dynamic = "force-dynamic";

function sanitizeRequest(req: Request): Request {
  // Esconde campos que não precisam vazar no HTML público.
  return {
    ...req,
    user_id: "",
    mp_payment_id: null,
    share_token: null,
  };
}

function sanitizeStages(stages: RequestStage[]): RequestStage[] {
  return stages.map((s) => ({ ...s, mp_payment_id: null }));
}

function sanitizeAttachments(attachments: RequestAttachment[]): RequestAttachment[] {
  return attachments;
}

export default async function PublicQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const quote = await loadQuoteByShareToken(token);
  if (!quote) notFound();

  const req = sanitizeRequest(quote);
  const stages = sanitizeStages(quote.stages);
  const attachments = sanitizeAttachments(quote.attachments);
  const isPaid = !!req.paid_at || !!req.paid_manually;
  const hasQuote = !!req.budget;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        {/* Banner fino indicando link público */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs">
          <span className="text-muted-foreground">
            Você está vendo um orçamento compartilhado em modo somente leitura.
          </span>
          <Link
            href={`/dashboard/requests/${req.id}`}
            className="font-medium text-purple-400 hover:underline"
          >
            Acessar painel completo →
          </Link>
        </div>

        <RequestCard
          req={req}
          tasks={[]}
          stages={stages}
          attachments={attachments}
          isPaid={isPaid}
          hasQuote={hasQuote}
          declining={false}
          readOnly
          backHref="/"
        />
      </div>
    </div>
  );
}
