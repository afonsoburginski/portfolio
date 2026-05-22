"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Loader2, RefreshCw, Share2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  requestId: string;
  requestTitle: string;
  budget?: string | null;
  /** Telefone opcional do cliente (com DDD); abre wa.me direto pra ele. */
  clientPhone?: string;
}

interface ShareData {
  token: string | null;
  url: string | null;
}

const WHATSAPP_GREEN_BTN =
  "bg-emerald-500 text-black hover:bg-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-400";

export function ShareQuoteButton({ requestId, requestTitle, budget, clientPhone }: Props) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ShareData>({ token: null, url: null });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [phone, setPhone] = useState(clientPhone ?? "");
  const [error, setError] = useState<string | null>(null);

  // Carrega o token atual ao abrir
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        const res = await fetch(`/api/requests/${requestId}/share`, { method: "GET" });
        if (!res.ok) throw new Error("Falha ao carregar link");
        const json = (await res.json()) as ShareData;
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro desconhecido");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, requestId]);

  async function generate(rotate = false) {
    setLoading(true);
    setError(null);
    try {
      const qs = rotate ? "?rotate=1" : "";
      const res = await fetch(`/api/requests/${requestId}/share${qs}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Erro ao gerar link");
      setData({ token: json.token, url: json.url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  async function revoke() {
    if (!confirm("Revogar o link público? O cliente perderá acesso até gerar um novo.")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/share`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao revogar");
      setData({ token: null, url: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!data.url) return;
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  const whatsappUrl = (() => {
    if (!data.url) return null;
    const valor = budget ? `Valor: ${budget}\n` : "";
    const text =
      `Olá! Compartilho o orçamento referente a: *${requestTitle}*\n\n` +
      valor +
      `Confira os detalhes e formas de pagamento:\n${data.url}\n\n` +
      `Qualquer dúvida estou à disposição.`;
    const onlyDigits = phone.replace(/\D/g, "");
    const params = new URLSearchParams({ text });
    return onlyDigits ? `https://wa.me/${onlyDigits}?${params}` : `https://wa.me/?${params}`;
  })();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="size-3.5" />
          Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar orçamento</DialogTitle>
          <DialogDescription>
            Link público (sem login) para o cliente acompanhar o orçamento e os pagamentos.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        {!data.token ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-center">
            <p className="text-sm text-muted-foreground">Nenhum link gerado ainda para este orçamento.</p>
            <Button onClick={() => generate(false)} disabled={loading} className="mt-3 gap-2">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
              Gerar link público
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Link público</Label>
              <div className="flex gap-2">
                <Input value={data.url ?? ""} readOnly className="font-mono text-xs" />
                <Button type="button" variant="outline" size="icon" onClick={copy} title="Copiar">
                  {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">WhatsApp do cliente (opcional)</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="ex.: 11 91234-5678 (com DDD)"
                inputMode="tel"
                className="text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Em branco abre o WhatsApp pra você escolher o contato.
              </p>
            </div>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${WHATSAPP_GREEN_BTN}`}
              >
                <svg viewBox="0 0 24 24" className="size-4 fill-current">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.815 11.815 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.891-11.893 11.891a11.9 11.9 0 01-5.687-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.595 5.392l-.999 3.648 3.893-.74zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.296-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.15-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                </svg>
                Enviar pelo WhatsApp
              </a>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => generate(true)}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                title="Gerar novo token (invalida o anterior)"
              >
                <RefreshCw className="size-3.5" />
                Rotacionar
              </Button>
              <Button
                onClick={revoke}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex-1 gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="size-3.5" />
                Revogar
              </Button>
            </div>
          </div>
        )}

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}
