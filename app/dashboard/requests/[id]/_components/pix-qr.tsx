"use client";

import { useState } from "react";
import { Check, Copy, Loader2, QrCode } from "lucide-react";

interface Props {
  qrCodeBase64: string;
  qrCode: string; // payload "copia e cola"
  amount: number;
  ticketUrl?: string;
  onCancel?: () => void;
}

export function PixQr({ qrCodeBase64, qrCode, amount, ticketUrl, onCancel }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  const amountStr = amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-border/60 bg-card p-6">
      <div className="flex items-center gap-2 text-emerald-400">
        <QrCode className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">PIX gerado</span>
      </div>

      <div className="rounded-lg bg-white p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${qrCodeBase64}`}
          alt="QR Code PIX"
          width={240}
          height={240}
          className="size-60"
        />
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">Valor a pagar</p>
        <p className="text-2xl font-bold">{amountStr}</p>
      </div>

      <button
        type="button"
        onClick={copy}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
      >
        {copied ? (
          <>
            <Check className="size-4" />Copiado!
          </>
        ) : (
          <>
            <Copy className="size-4" />Copiar código (copia e cola)
          </>
        )}
      </button>

      {ticketUrl && (
        <a
          href={ticketUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Abrir comprovante no Mercado Pago
        </a>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        Aguardando confirmação do pagamento…
      </div>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-muted-foreground/70 hover:text-foreground"
        >
          Cancelar
        </button>
      )}
    </div>
  );
}
