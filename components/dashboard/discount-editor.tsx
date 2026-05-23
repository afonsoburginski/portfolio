"use client";

import { useEffect, useState } from "react";
import { Check, Percent, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  requestId: string;
  /** Valor atual do desconto no D1 (em BRL). */
  discountAmount: number;
  discountReason: string | null;
  /** Total bruto pra mostrar prévia rápida e impedir desconto absurdo. */
  grossTotal: number;
  onSaved: (next: { discount_amount: number; discount_reason: string | null }) => void;
}

function parseBRL(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9.,]/g, "").replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

export function DiscountEditor({
  requestId,
  discountAmount,
  discountReason,
  grossTotal,
  onSaved,
}: Props) {
  const [amount, setAmount] = useState<string>(discountAmount > 0 ? discountAmount.toFixed(2).replace(".", ",") : "");
  const [reason, setReason] = useState<string>(discountReason ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setAmount(discountAmount > 0 ? discountAmount.toFixed(2).replace(".", ",") : "");
    setReason(discountReason ?? "");
    setDirty(false);
  }, [discountAmount, discountReason]);

  const numeric = parseBRL(amount);
  const tooMuch = numeric > grossTotal && grossTotal > 0;
  const willNet = Math.max(0, grossTotal - numeric);

  async function save() {
    if (tooMuch) {
      setError("Desconto não pode passar do valor total.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discount_amount: numeric,
          discount_reason: reason.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Falha ao salvar");
      onSaved({
        discount_amount: json.discount_amount ?? numeric,
        discount_reason: json.discount_reason ?? (reason.trim() || null),
      });
      setDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function clear() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discount_amount: 0, discount_reason: null }),
      });
      if (!res.ok) throw new Error("Falha ao remover desconto");
      onSaved({ discount_amount: 0, discount_reason: null });
      setAmount("");
      setReason("");
      setDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Percent className="size-3.5" />
          Desconto comercial
        </p>
        {discountAmount > 0 && (
          <span className="text-[11px] font-medium text-emerald-400">
            Ativo: − {fmtBRL(discountAmount)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3">
        <div>
          <Label htmlFor={`disc-${requestId}`} className="text-[11px] text-muted-foreground">
            Valor (R$)
          </Label>
          <Input
            id={`disc-${requestId}`}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setDirty(true);
            }}
            placeholder="0,00"
            inputMode="decimal"
            disabled={saving}
            className={tooMuch ? "border-red-500/50" : ""}
          />
        </div>
        <div>
          <Label htmlFor={`disc-reason-${requestId}`} className="text-[11px] text-muted-foreground">
            Motivo (opcional, aparece no anexo / nota)
          </Label>
          <Textarea
            id={`disc-reason-${requestId}`}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setDirty(true);
            }}
            placeholder="ex.: cliente fidelizado, pagamento à vista, parceria…"
            rows={2}
            disabled={saving}
            className="resize-none text-sm"
          />
        </div>
      </div>

      {grossTotal > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-muted-foreground">
            Total bruto: <span className="font-semibold text-foreground">{fmtBRL(grossTotal)}</span>
          </span>
          <span className="text-muted-foreground">
            Total c/ desconto:{" "}
            <span className="font-semibold text-emerald-400">{fmtBRL(willNet)}</span>
          </span>
        </div>
      )}

      {tooMuch && (
        <p className="mt-2 text-xs text-red-400">
          Desconto maior que o total bruto. Vai ser limitado ao máximo.
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <div className="mt-3 flex gap-2">
        <Button onClick={save} disabled={saving || !dirty} size="sm" className="gap-1.5">
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          Aplicar
        </Button>
        {discountAmount > 0 && (
          <Button
            onClick={clear}
            disabled={saving}
            size="sm"
            variant="outline"
            className="gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <X className="size-3.5" />
            Remover desconto
          </Button>
        )}
      </div>
    </div>
  );
}
