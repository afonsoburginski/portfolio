"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Paperclip, Trash2, Upload } from "lucide-react";
import type { RequestAttachment } from "@/lib/schema";

const ACCEPT_ATTACHMENTS = "image/*,.pdf,.md,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar";

function formatSize(size: number | null) {
  if (!size) return null;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function kindFromFile(file: File): "image" | "file" {
  return file.type.startsWith("image/") ? "image" : "file";
}

interface RequestAttachmentsProps {
  files: RequestAttachment[];
  folder?: string;
  onAdd: (attachment: {
    url: string;
    name: string;
    mime_type: string | null;
    size: number | null;
    kind: "image" | "file";
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function RequestAttachments({
  files,
  folder = "requests",
  onAdd,
  onDelete,
}: RequestAttachmentsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function uploadFiles(fileList: FileList | null) {
    const selected = Array.from(fileList ?? []);
    if (selected.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of selected) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Erro ao enviar ${file.name}`);
        }

        const uploaded = await res.json();
        await onAdd({
          url: uploaded.url,
          name: uploaded.name ?? file.name,
          mime_type: uploaded.type ?? file.type ?? null,
          size: uploaded.size ?? file.size ?? null,
          kind: kindFromFile(file),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar anexo");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(id: string) {
    if (!onDelete) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-3">
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <a
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-3 text-sm transition-colors hover:bg-muted/40"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-background/70 text-muted-foreground">
                <FileText className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">{file.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {formatSize(file.size) ?? "Arquivo"} · Abrir anexo
                </span>
              </span>
              {onDelete && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    remove(file.id);
                  }}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/60 opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                  title="Remover anexo"
                >
                  {deletingId === file.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                </button>
              )}
            </a>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTACHMENTS}
        multiple
        onChange={(event) => uploadFiles(event.target.files)}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 px-4 py-5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/40 disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            {files.length > 0 ? <Paperclip className="size-4" /> : <Upload className="size-4" />}
            Adicionar anexos
          </>
        )}
      </button>

      <p className="text-xs text-muted-foreground/60">
        Imagens aparecem na referência visual. PDFs, Markdown e outros arquivos ficam nesta lista.
      </p>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
