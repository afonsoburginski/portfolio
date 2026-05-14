"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createRequest, createRequestAttachment } from "@/lib/dashboard-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
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
import { Loader2, Send, Type, AlignLeft, Tag, Paperclip, X, FileText } from "lucide-react";
import type { RequestType } from "@/lib/schema";

/* ─── constants ──────────────────────────────────────────────────────────── */

const PROPOSITOS = [
  { value: "feature",     label: "Nova funcionalidade" },
  { value: "bug_fix",     label: "Correção de bug" },
  { value: "integration", label: "Integração" },
  { value: "maintenance", label: "Manutenção" },
  { value: "redesign",    label: "Redesign / UI" },
  { value: "full_system", label: "Sistema completo / SaaS" },
  { value: "other",       label: "Outro" },
];

const ACCEPT_ATTACHMENT = "image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar";
const MAX_ATTACHMENT_MB = 25;

/* ─── media query hook ───────────────────────────────────────────────────── */

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

/* ─── field row ──────────────────────────────────────────────────────────── */

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
    <div className={`flex flex-col gap-1.5 sm:grid sm:grid-cols-[148px_1fr] sm:gap-4 border-b border-white/10 last:border-0 py-3.5 first:pt-0 last:pb-0 ${alignTop ? "sm:items-start" : "sm:items-center"}`}>
      <span className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400 select-none sm:pt-0.5">
        <Icon className="size-3.5 sm:size-4 shrink-0" />
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/* ─── form state ─────────────────────────────────────────────────────────── */

interface FormState {
  title: string;
  description: string;
  type: RequestType;
  attachmentFiles: Array<{ file: File; preview: string | null }>;
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  type: "feature",
  attachmentFiles: [],
};

/* ─── shared form body ───────────────────────────────────────────────────── */

interface FormBodyProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  error: string | null;
  submitting: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onClearImage: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  mobile?: boolean;
}

function FormBody({
  form, setForm, error, submitting,
  fileInputRef, onClearImage, onFileChange, onCancel, mobile,
}: FormBodyProps) {
  return (
    <>
      <div className={`rounded-xl border border-white/10 bg-neutral-800/50 ${mobile ? "mx-4" : "mx-6 mt-4"}`}>
        <div className="px-4 sm:px-5 pt-2">
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
            <Select
              value={form.type}
              onValueChange={v => setForm(f => ({ ...f, type: v as RequestType }))}
            >
              <SelectTrigger className="h-9 bg-neutral-800 border-neutral-600 text-neutral-100">
                <SelectValue placeholder="O que você precisa?" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-600">
                {PROPOSITOS.map(p => (
                  <SelectItem
                    key={p.value}
                    value={p.value}
                    className="text-neutral-100 focus:bg-neutral-700"
                  >
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
              required
              className={`resize-none bg-neutral-800 border-neutral-600 text-neutral-100 placeholder:text-neutral-500 text-sm focus-visible:ring-neutral-500 [field-sizing:fixed] ${mobile ? "min-h-[14rem]" : "min-h-[16rem]"}`}
            />
          </FieldRow>

          <FieldRow icon={Paperclip} label="Anexo (opcional)" alignTop>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_ATTACHMENT}
                multiple
                onChange={onFileChange}
                className="hidden"
              />
              {form.attachmentFiles.length > 0 ? (
                <div className="space-y-2">
                  {form.attachmentFiles.map(({ file, preview }, index) => (
                    <div key={`${file.name}-${index}`} className="relative inline-flex max-w-full items-center gap-3 rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2">
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={preview}
                          alt="Preview"
                          className="size-12 rounded-md border border-neutral-700 object-cover"
                        />
                      ) : (
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-neutral-700 text-neutral-300">
                          <FileText className="size-5" />
                        </span>
                      )}
                      <span className="min-w-0 pr-6">
                        <span className="block truncate text-sm font-medium text-neutral-100">
                          {file.name}
                        </span>
                        <span className="block text-xs text-neutral-500">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={onClearImage}
                    className="flex w-fit items-center gap-1.5 rounded-md border border-neutral-600 px-2 py-1 text-xs text-neutral-400 hover:bg-red-500/10 hover:text-red-400"
                    aria-label="Remover anexo"
                  >
                    <X className="size-3.5" />
                    Limpar anexos
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-600 px-4 py-3 text-sm text-neutral-400 hover:border-neutral-500 hover:bg-neutral-700/40 hover:text-neutral-200 transition-colors w-full sm:w-auto"
                >
                  <Paperclip className="size-4 shrink-0" />
                  Adicionar anexo
                </button>
              )}
              <p className="text-xs text-neutral-500 pb-1">
                Imagem, PDF, planilha, documento ou compactado · Máx. {MAX_ATTACHMENT_MB} MB
              </p>
            </div>
          </FieldRow>
        </div>
      </div>

      {error && (
        <p className={`text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 ${mobile ? "mx-4 mt-3" : "mx-6 mt-4"}`}>
          {error}
        </p>
      )}

      {/* Footer — desktop only (mobile footer is handled by DrawerFooter) */}
      {!mobile && (
        <div className="flex justify-end gap-2 px-6 py-4 mt-auto border-t border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-neutral-600 bg-transparent text-neutral-300 hover:bg-neutral-800 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="gap-2 bg-white text-neutral-900 hover:bg-neutral-200"
          >
            {submitting
              ? <Loader2 className="size-4 animate-spin" />
              : <Send className="size-4" />}
            Enviar solicitação
          </Button>
        </div>
      )}
    </>
  );
}

/* ─── props ──────────────────────────────────────────────────────────────── */

interface NewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/* ─── component ──────────────────────────────────────────────────────────── */

export function NewRequestDialog({ open, onOpenChange, onSuccess }: NewRequestDialogProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) { setForm(f => ({ ...f, attachmentFiles: [] })); return; }
    const tooLarge = files.find((file) => file.size > MAX_ATTACHMENT_MB * 1024 * 1024);
    if (tooLarge) {
      setError(`Arquivo deve ter no máximo ${MAX_ATTACHMENT_MB} MB.`);
      return;
    }
    form.attachmentFiles.forEach(({ preview }) => {
      if (preview) URL.revokeObjectURL(preview);
    });
    setForm(f => ({
      ...f,
      attachmentFiles: files.map((file) => ({
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      })),
    }));
    setError(null);
  }

  function clearImage() {
    form.attachmentFiles.forEach(({ preview }) => {
      if (preview) URL.revokeObjectURL(preview);
    });
    setForm(f => ({ ...f, attachmentFiles: [] }));
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
      if (form.attachmentFiles.length > 0) {
        for (const { file } of form.attachmentFiles) {
          try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("folder", "requests");
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            if (res.ok) {
              const uploaded = await res.json();
              await createRequestAttachment({
                request_id: request.id,
                url: uploaded.url,
                name: uploaded.name ?? file.name,
                mime_type: uploaded.type ?? file.type ?? null,
                size: uploaded.size ?? file.size ?? null,
                kind: file.type.startsWith("image/") ? "image" : "file",
              });
            }
          } catch (attachmentErr) {
            console.warn("Attachment upload failed (request was created):", attachmentErr);
          }
        }
      }
      handleOpenChange(false);
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
      form.attachmentFiles.forEach(({ preview }) => {
        if (preview) URL.revokeObjectURL(preview);
      });
      setForm(EMPTY_FORM);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    onOpenChange(next);
  }

  const sharedFormProps = {
    form, setForm, error, submitting,
    fileInputRef, onClearImage: clearImage,
    onFileChange: handleFileChange,
    onCancel: () => handleOpenChange(false),
  };

  /* ── mobile: Drawer ── */
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="bg-neutral-900 border-neutral-700/80 text-neutral-100 max-h-[98vh] min-h-[92vh] flex flex-col">
          <DrawerHeader className="px-4 pt-2 pb-4 border-b border-white/10 text-left">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-white/10">
                <FileText className="size-4 text-neutral-300" />
              </div>
              <DrawerTitle className="text-base font-semibold text-white">
                Nova solicitação
              </DrawerTitle>
            </div>
            <DrawerDescription className="text-neutral-400 text-xs">
              Preencha os campos abaixo. Analiso e retorno em 24–48h.
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-y-auto">
            <div className="py-4 flex flex-col gap-0 flex-1">
              <FormBody {...sharedFormProps} mobile />
            </div>

            <DrawerFooter className="border-t border-white/10 px-4 py-4 gap-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full gap-2 bg-white text-neutral-900 hover:bg-neutral-200 h-11 text-sm font-semibold"
              >
                {submitting
                  ? <Loader2 className="size-4 animate-spin" />
                  : <Send className="size-4" />}
                Enviar solicitação
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="w-full border-neutral-600 bg-transparent text-neutral-300 hover:bg-neutral-800 hover:text-white h-10"
              >
                Cancelar
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    );
  }

  /* ── desktop: Dialog ── */
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[calc(100vw-2rem)] min-w-[44rem] max-w-[58rem] min-h-[46rem] max-h-[90vh] overflow-y-auto flex flex-col gap-0 p-0 border border-neutral-700/80 bg-neutral-900 text-neutral-100 shadow-2xl"
        showCloseButton
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/10">
              <FileText className="size-5 text-neutral-300" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-white leading-tight">
                Nova solicitação
              </DialogTitle>
              <DialogDescription className="text-neutral-400 text-sm">
                Preencha os campos abaixo. Analiso e retorno em 24–48h.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 pb-0">
          <FormBody {...sharedFormProps} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
