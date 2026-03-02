"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createRequest, uploadRequestImage, updateRequestImage } from "@/lib/dashboard-data";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send, Type, AlignLeft, Tag, ImagePlus, X } from "lucide-react";

const PROPOSITOS = [
  { value: "feature",     label: "Nova funcionalidade" },
  { value: "bug_fix",     label: "Correção de bug" },
  { value: "integration", label: "Integração" },
  { value: "maintenance", label: "Manutenção" },
  { value: "redesign",    label: "Redesign / UI" },
  { value: "other",       label: "Outro" },
];

const ACCEPT_IMAGE = "image/jpeg,image/png,image/webp,image/gif";
const MAX_IMAGE_MB = 5;

function FieldRow({
  icon: Icon,
  label,
  children,
  alignTop,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  alignTop?: boolean;
}) {
  return (
    <div className={`grid grid-cols-[140px_1fr] gap-4 border-b border-white/10 last:border-0 py-3 first:pt-0 last:pb-0 ${alignTop ? "items-start" : "items-center"}`}>
      <span className="flex items-center gap-2 text-sm text-neutral-400 select-none pt-0.5">
        <Icon className="size-4 shrink-0" />
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

interface NewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function NewRequestDialog({ open, onOpenChange, onSuccess }: NewRequestDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "feature" as string,
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setForm(f => ({ ...f, imageFile: null, imagePreview: null }));
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`Imagem deve ter no máximo ${MAX_IMAGE_MB} MB.`);
      return;
    }
    const preview = URL.createObjectURL(file);
    setForm(f => ({ ...f, imageFile: file, imagePreview: preview }));
    setError(null);
  }

  function clearImage() {
    if (form.imagePreview) URL.revokeObjectURL(form.imagePreview);
    setForm(f => ({ ...f, imageFile: null, imagePreview: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const request = await createRequest({
        title: form.title,
        description: form.description,
        type: form.type,
        priority: 2,
      });
      if (form.imageFile) {
        try {
          const imageUrl = await uploadRequestImage(request.id, form.imageFile);
          await updateRequestImage(request.id, imageUrl);
        } catch (imgErr) {
          console.warn("Image upload failed (request was created):", imgErr);
          // Request already created; image upload failed (e.g. bucket not set up)
        }
      }
      onOpenChange(false);
      if (form.imagePreview) URL.revokeObjectURL(form.imagePreview);
      setForm({ title: "", description: "", type: "feature", imageFile: null, imagePreview: null });
      onSuccess?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setError(null);
      if (form.imagePreview) URL.revokeObjectURL(form.imagePreview);
      setForm(f => ({ ...f, imageFile: null, imagePreview: null }));
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[calc(100vw-2rem)] min-w-[44rem] max-w-[56rem] min-h-[38rem] max-h-[88vh] overflow-y-auto flex flex-col gap-0 p-0 border border-neutral-700/80 bg-neutral-900 text-neutral-100 shadow-2xl"
        showCloseButton
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
          <DialogTitle className="text-lg font-semibold text-white">
            Nova solicitação
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Preencha os campos abaixo. Analiso e retorno em 24–48h.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-4 rounded-xl border border-white/10 mx-6 mt-4 bg-neutral-800/50">
            <FieldRow icon={Type} label="Título">
              <Input
                placeholder="ex: Adicionar notificações push no app iOS"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                className="h-9 bg-neutral-800 border-neutral-600 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-neutral-500"
              />
            </FieldRow>
            <FieldRow icon={Tag} label="Propósito">
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="h-9 bg-neutral-800 border-neutral-600 text-neutral-100">
                  <SelectValue placeholder="O que você precisa?" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-600">
                  {PROPOSITOS.map(p => (
                    <SelectItem key={p.value} value={p.value} className="text-neutral-100 focus:bg-neutral-700">
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow icon={AlignLeft} label="O que precisa ser feito" alignTop>
              <Textarea
                placeholder="Descreva o contexto, objetivo e como imagina o resultado..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={5}
                required
                className="resize-none bg-neutral-800 border-neutral-600 text-neutral-100 placeholder:text-neutral-500 text-sm focus-visible:ring-neutral-500"
              />
            </FieldRow>
            <FieldRow icon={ImagePlus} label="Imagem (opcional)" alignTop>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_IMAGE}
                  onChange={handleFileChange}
                  className="hidden"
                />
                {form.imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={form.imagePreview}
                      alt="Preview"
                      className="max-h-40 rounded-lg border border-neutral-600 object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-neutral-800 border border-neutral-600 text-neutral-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-colors"
                      aria-label="Remover imagem"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 border-neutral-600 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="size-4" />
                    Adicionar imagem
                  </Button>
                )}
                <p className="text-xs text-neutral-500">
                  JPEG, PNG, WebP ou GIF. Máx. {MAX_IMAGE_MB} MB.
                </p>
              </div>
            </FieldRow>
          </div>

          {error && (
            <p className="mx-6 mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2 px-6 py-4 mt-auto border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="gap-2 bg-white text-neutral-900 hover:bg-neutral-200"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Enviar solicitação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
