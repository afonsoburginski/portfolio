// Cálculo de valores com desconto aplicado proporcionalmente.
//
// Princípio: o desconto é definido como valor absoluto (BRL) no request.
// Distribuímos esse valor entre as stages proporcionalmente ao amount delas
// (stages canceladas são ignoradas). Stages já pagas mantêm o que foi pago
// — o desconto residual fica restrito ao que ainda está pendente.
//
// Esse arquivo é a fonte única de verdade pra:
//  - quanto cobrar de uma stage específica (create-preference, pix/create)
//  - quanto cobrar de "pagar tudo de uma vez"
//  - quanto mostrar nas charts (Recebida / A receber)
//  - quanto mostrar na UI (RequestCard, página pública)

import type { Request, RequestStage } from "@/lib/schema";

export interface PricingBreakdown {
  /** Soma bruta de todas as stages (não-canceladas). */
  gross: number;
  /** Desconto total cadastrado no request. */
  discount: number;
  /** gross - discount (mínimo 0). */
  netTotal: number;
  /** Stages com valor efetivo (face) e fator aplicado. */
  stages: Array<{
    id: string;
    title: string;
    status: string;
    is_extra: boolean;
    cancelled: boolean;
    /** Valor original cadastrado. */
    grossAmount: number;
    /** Valor após desconto proporcional aplicado (esse é o que se cobra). */
    netAmount: number;
    /** Quanto de desconto foi atribuído a essa stage. */
    discountShare: number;
    /** Já foi paga? */
    paid: boolean;
  }>;
  /** Soma já paga (em valores efetivos = netAmount das stages pagas). */
  paidNet: number;
  /** Soma ainda a receber. */
  pendingNet: number;
}

function parseBudgetFallback(raw: string | null | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

/**
 * Computa o breakdown financeiro completo de um request + stages.
 *
 * - Se o request não tem stages, usa req.budget como gross e aplica desconto direto.
 * - Stages canceladas entram zeradas no breakdown e não recebem fatia de desconto.
 * - Stages extras (is_extra=true) NÃO recebem desconto — desconto é só do orçamento base.
 */
export function computeRequestPricing(
  request: Pick<Request, "budget" | "discount_amount">,
  stages: RequestStage[],
): PricingBreakdown {
  const discount = Math.max(0, request.discount_amount ?? 0);
  const active = stages.filter((s) => s.status !== "cancelled");

  if (active.length === 0) {
    const gross = parseBudgetFallback(request.budget);
    const net = Math.max(0, gross - discount);
    return {
      gross,
      discount: Math.min(discount, gross),
      netTotal: net,
      stages: stages.map((s) => ({
        id: s.id,
        title: s.title,
        status: s.status,
        is_extra: s.is_extra,
        cancelled: s.status === "cancelled",
        grossAmount: s.amount,
        netAmount: 0,
        discountShare: 0,
        paid: s.status === "paid",
      })),
      paidNet: 0,
      pendingNet: net,
    };
  }

  // Soma base que vai receber o desconto = stages ativas não-extras
  const baseStages = active.filter((s) => !s.is_extra);
  const baseTotal = baseStages.reduce((sum, s) => sum + s.amount, 0);
  const extrasTotal = active.filter((s) => s.is_extra).reduce((sum, s) => sum + s.amount, 0);
  const gross = baseTotal + extrasTotal;

  // Trava o desconto no máximo do baseTotal (não pode descontar mais que o orçamento base)
  const effectiveDiscount = Math.min(discount, baseTotal);

  // Distribui proporcionalmente. Última stage base recebe o resto pra não vazar centavos.
  const stagesOut: PricingBreakdown["stages"] = [];
  let assigned = 0;
  for (const s of stages) {
    if (s.status === "cancelled") {
      stagesOut.push({
        id: s.id,
        title: s.title,
        status: s.status,
        is_extra: s.is_extra,
        cancelled: true,
        grossAmount: s.amount,
        netAmount: 0,
        discountShare: 0,
        paid: false,
      });
      continue;
    }
    if (s.is_extra) {
      stagesOut.push({
        id: s.id,
        title: s.title,
        status: s.status,
        is_extra: true,
        cancelled: false,
        grossAmount: s.amount,
        netAmount: round2(s.amount),
        discountShare: 0,
        paid: s.status === "paid",
      });
      continue;
    }
    // Stage base: ganha fatia do desconto proporcional ao peso
    const isLastBase = baseStages.indexOf(s) === baseStages.length - 1;
    let share: number;
    if (isLastBase) {
      // Última pega o resto pra não acumular floating-point
      share = round2(effectiveDiscount - assigned);
    } else {
      share = baseTotal > 0 ? round2((s.amount / baseTotal) * effectiveDiscount) : 0;
      assigned = round2(assigned + share);
    }
    const net = round2(Math.max(0, s.amount - share));
    stagesOut.push({
      id: s.id,
      title: s.title,
      status: s.status,
      is_extra: false,
      cancelled: false,
      grossAmount: s.amount,
      netAmount: net,
      discountShare: share,
      paid: s.status === "paid",
    });
  }

  const paidNet = stagesOut.filter((s) => s.paid).reduce((sum, s) => sum + s.netAmount, 0);
  const pendingNet = stagesOut
    .filter((s) => !s.paid && !s.cancelled)
    .reduce((sum, s) => sum + s.netAmount, 0);

  return {
    gross,
    discount: effectiveDiscount,
    netTotal: round2(gross - effectiveDiscount),
    stages: stagesOut,
    paidNet: round2(paidNet),
    pendingNet: round2(pendingNet),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Valor que se deve cobrar de uma stage específica. */
export function effectiveStageAmount(
  request: Pick<Request, "budget" | "discount_amount">,
  stages: RequestStage[],
  stageId: string,
): number {
  const breakdown = computeRequestPricing(request, stages);
  const found = breakdown.stages.find((s) => s.id === stageId);
  return found?.netAmount ?? 0;
}

/** Valor a cobrar quando o cliente quer pagar tudo que está pendente. */
export function effectivePendingTotal(
  request: Pick<Request, "budget" | "discount_amount">,
  stages: RequestStage[],
): number {
  return computeRequestPricing(request, stages).pendingNet;
}
