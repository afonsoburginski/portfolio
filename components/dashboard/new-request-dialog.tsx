"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRequest } from "@/lib/dashboard-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";

// Propósito = o que o cliente quer (leigo: só escolhe uma opção)
const PROPOSITOS = [
  { value: "feature",     label: "Nova funcionalidade" },
  { value: "bug_fix",     label: "Correção de bug" },
  { value: "integration", label: "Integração" },
  { value: "consulting",  label: "Consultoria técnica" },
];

interface NewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function NewRequestDialog({ open, onOpenChange, onSuccess }: NewRequestDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", type: "feature" as string });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createRequest({
        title: form.title,
        description: form.description,
        type: form.type,
        priority: 2, // padrão; admin ajusta depois
      });
      onOpenChange(false);
      setForm({ title: "", description: "", type: "feature" });
      onSuccess?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) setError(null);
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl min-h-[26rem] max-h-[90vh] overflow-y-auto flex flex-col gap-0">
        <DialogHeader>
          <DialogTitle>Nova solicitação</DialogTitle>
          <DialogDescription>
            Preencha o título, o propósito e descreva o que você precisa. Eu analiso e retorno em 24–48h.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="dialog-title">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dialog-title"
              placeholder="ex: Adicionar notificações push no app iOS"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Propósito <span className="text-destructive">*</span></Label>
            <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="O que você precisa?" />
              </SelectTrigger>
              <SelectContent>
                {PROPOSITOS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dialog-description">
              O que precisa ser feito <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="dialog-description"
              placeholder="Descreva o que você precisa: contexto, objetivo, como imagina o resultado..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={6}
              required
              className="resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Enviar solicitação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
