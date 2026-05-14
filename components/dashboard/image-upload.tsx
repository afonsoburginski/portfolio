"use client";

import { useState, useRef } from "react";
import { FileText, ImagePlus, Loader2, Paperclip, Trash2 } from "lucide-react";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  className?: string;
  accept?: string;
  label?: string;
  description?: string;
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(url);
}

function fileLabelFromUrl(url: string) {
  try {
    const path = new URL(url).pathname;
    const last = decodeURIComponent(path.split("/").pop() ?? "arquivo");
    return last.replace(/^[0-9a-f-]{36}-/i, "") || "arquivo";
  } catch {
    return "arquivo";
  }
}

export function ImageUpload({
  value,
  onChange,
  folder = "requests",
  className = "",
  accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar",
  label = "Adicionar anexo",
  description = "Imagem, PDF, planilha, documento ou compactado.",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao fazer upload");
      }

      const { url } = await res.json();
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao fazer upload");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (!value) return;

    // Extrai a key da URL
    const url = new URL(value);
    const key = url.pathname.slice(1); // remove leading /

    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
    } catch {
      // Ignora erro de delete, remove a referência mesmo assim
    }

    onChange(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // Reset input para permitir selecionar o mesmo arquivo novamente
    e.target.value = "";
  }

  if (value) {
    const image = isImageUrl(value);
    const label = fileLabelFromUrl(value);

    return (
      <div className={`relative group ${className}`}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Anexo do projeto"
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
        ) : (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-3 text-sm transition-colors hover:bg-muted/40"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-background/70 text-muted-foreground">
              <FileText className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-foreground">{label}</span>
              <span className="block text-xs text-muted-foreground">Abrir anexo</span>
            </span>
          </a>
        )}
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          title="Remover anexo"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 px-4 py-6 text-sm text-muted-foreground transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            {accept === "image/*" ? <ImagePlus className="size-4" /> : <Paperclip className="size-4" />}
            {label}
          </>
        )}
      </button>
      <p className="mt-1.5 text-xs text-muted-foreground/60">{description}</p>

      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
