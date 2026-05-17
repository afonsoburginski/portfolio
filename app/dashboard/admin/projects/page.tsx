"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/dashboard/auth-provider";
import { LoginOverlay } from "@/components/dashboard/login-overlay";
import { isAdminEmail } from "@/lib/admin-helpers";
import {
  getAllProjectsAdmin,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
} from "@/lib/dashboard-data";
import type { Project, ProjectCategory } from "@/lib/schema";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Loader2, ShieldCheck, FolderKanban, Plus, Pencil, Trash2,
  Eye, EyeOff, ArrowUp, ArrowDown, ExternalLink, ImageOff,
  ImagePlus, X, FileText,
} from "lucide-react";

const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  web: "Web",
  mobile: "Mobile",
  desktop: "Desktop",
  full_system: "Full System",
  other: "Other",
};

type FormState = {
  slug: string;
  title: string;
  description: string;
  image: string | null;
  category: ProjectCategory;
  featured: boolean;
};

const EMPTY_FORM: FormState = {
  slug: "",
  title: "",
  description: "",
  image: null,
  category: "web",
  featured: true,
};

type ImageMeta = { width: number; height: number; sizeBytes: number };

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function AdminProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = isAdminEmail(user?.email);

  useEffect(() => {
    if (!user || !isAdmin) return;
    getAllProjectsAdmin()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, isAdmin]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageMeta(null);
    setError(null);
    setDialogOpen(true);
  }

  async function handleImageFile(file: File) {
    setError(null);

    // Preview imediato com dimensões reais (sem esperar o upload terminar).
    const localPreview = URL.createObjectURL(file);
    const img = new window.Image();
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 0, h: 0 });
      img.src = localPreview;
    });
    setForm((f) => ({ ...f, image: localPreview }));
    setImageMeta({ width: dims.w, height: dims.h, sizeBytes: file.size });

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "projects");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao fazer upload");
      }
      const { url } = await res.json();
      URL.revokeObjectURL(localPreview);
      setForm((f) => ({ ...f, image: url }));
    } catch (e) {
      URL.revokeObjectURL(localPreview);
      setForm((f) => ({ ...f, image: null }));
      setImageMeta(null);
      setError(e instanceof Error ? e.message : "Erro ao fazer upload");
    } finally {
      setUploading(false);
    }
  }

  function handleImageRemove() {
    setForm((f) => ({ ...f, image: null }));
    setImageMeta(null);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      slug: p.slug,
      title: p.title,
      description: p.description ?? "",
      image: p.image ?? null,
      category: p.category as ProjectCategory,
      featured: !!p.featured,
    });
    setImageMeta(null);
    setError(null);
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) return setError("Título é obrigatório.");
    const slug = (form.slug || slugify(form.title)).trim();
    if (!slug) return setError("Slug é obrigatório.");

    // Link is derived: every project opens at /case-study/<slug>
    const link = `/case-study/${slug}`;

    setSubmitting(true);
    try {
      if (editing) {
        const updated = await updateProject(editing.id, {
          slug,
          title: form.title.trim(),
          description: form.description.trim(),
          image: form.image,
          link,
          category: form.category,
          featured: form.featured,
        });
        setProjects((prev) => prev.map((p) => (p.id === editing.id ? updated : p)));
      } else {
        const created = await createProject({
          slug,
          title: form.title.trim(),
          description: form.description.trim(),
          image: form.image,
          link,
          category: form.category,
          featured: form.featured,
        });
        setProjects((prev) => [...prev, created]);
      }
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteProject(deleteTarget.id);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function move(p: Project, dir: -1 | 1) {
    const idx = projects.findIndex((x) => x.id === p.id);
    const target = idx + dir;
    if (target < 0 || target >= projects.length) return;
    const next = [...projects];
    [next[idx], next[target]] = [next[target], next[idx]];
    // Otimista
    const reindexed = next.map((x, i) => ({ ...x, sort_order: (i + 1) * 10 }));
    setProjects(reindexed);
    try {
      await reorderProjects(reindexed.map((x) => x.id));
    } catch {
      // Reverte em caso de erro
      setProjects(projects);
    }
  }

  async function toggleFeatured(p: Project) {
    const next = !p.featured;
    setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, featured: next } : x)));
    try {
      await updateProject(p.id, { featured: next });
    } catch {
      setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, featured: p.featured } : x)));
    }
  }

  if (authLoading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  if (!user) return <LoginOverlay />;
  if (!isAdmin)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <ShieldCheck className="size-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          Acesso restrito a administradores.
        </p>
      </div>
    );

  const visibleCount = projects.filter((p) => p.featured).length;

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg border bg-muted">
          <FolderKanban className="size-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os projetos exibidos na home. {visibleCount} visível{visibleCount === 1 ? "" : "s"} de {projects.length}.
          </p>
        </div>
        <Button size="sm" className="gap-2 h-8" onClick={openCreate}>
          <Plus className="size-3.5" />
          New Project
        </Button>
      </div>

      {/* list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <FolderKanban className="size-8 opacity-20" />
          <p className="text-sm">Nenhum projeto cadastrado.</p>
          <Button size="sm" variant="outline" onClick={openCreate} className="gap-2">
            <Plus className="size-3.5" />
            Adicionar primeiro projeto
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60">
          {/* column headers */}
          <div className="grid grid-cols-[40px_64px_2fr_1.5fr_90px_120px_120px] gap-3 border-b border-border/60 bg-muted/30 px-4 py-2.5">
            <span className="text-[11px] font-medium text-muted-foreground/70">Ordem</span>
            <span className="text-[11px] font-medium text-muted-foreground/70">Imagem</span>
            <span className="text-[11px] font-medium text-muted-foreground/70">Título</span>
            <span className="text-[11px] font-medium text-muted-foreground/70">Slug · Link</span>
            <span className="text-[11px] font-medium text-muted-foreground/70">Categoria</span>
            <span className="text-[11px] font-medium text-muted-foreground/70">Home</span>
            <span className="text-[11px] font-medium text-muted-foreground/70 text-right">Ações</span>
          </div>

          {projects.map((p, idx) => (
            <div
              key={p.id}
              className="grid grid-cols-[40px_64px_2fr_1.5fr_90px_120px_120px] items-center gap-3 border-b border-border/40 px-4 py-2.5 last:border-0 hover:bg-muted/20 transition-colors"
            >
              {/* order */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => move(p, -1)}
                  disabled={idx === 0}
                  className="flex size-4 items-center justify-center rounded text-muted-foreground/60 hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Mover para cima"
                >
                  <ArrowUp className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => move(p, 1)}
                  disabled={idx === projects.length - 1}
                  className="flex size-4 items-center justify-center rounded text-muted-foreground/60 hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Mover para baixo"
                >
                  <ArrowDown className="size-3" />
                </button>
              </div>

              {/* image */}
              <div className="relative size-12 overflow-hidden rounded-md border border-border/50 bg-muted/40">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground/30">
                    <ImageOff className="size-4" />
                  </div>
                )}
              </div>

              {/* title + description */}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                {p.description && (
                  <p className="truncate text-[11px] text-muted-foreground/70">{p.description}</p>
                )}
              </div>

              {/* slug + link */}
              <div className="min-w-0 space-y-0.5">
                <p className="truncate font-mono text-[11px] text-muted-foreground">{p.slug}</p>
                {p.link && (
                  <a
                    href={p.link}
                    target={p.link.startsWith("/") ? "_self" : "_blank"}
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 truncate text-[11px] text-muted-foreground/70 hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="size-3 shrink-0" />
                    <span className="truncate">{p.link}</span>
                  </a>
                )}
              </div>

              {/* category */}
              <span className="text-[11px] text-muted-foreground">
                {CATEGORY_LABEL[p.category as ProjectCategory]}
              </span>

              {/* featured */}
              <button
                type="button"
                onClick={() => toggleFeatured(p)}
                className={`inline-flex w-fit items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                  p.featured
                    ? "border-emerald-500/25 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                    : "border-neutral-500/25 bg-neutral-500/15 text-neutral-400 hover:bg-neutral-500/25"
                }`}
              >
                {p.featured ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                {p.featured ? "Visível" : "Oculto"}
              </button>

              {/* actions */}
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  asChild
                  aria-label="Editar case study"
                  title="Editar case study"
                >
                  <Link href={`/dashboard/admin/projects/${p.id}`}>
                    <FileText className="size-3.5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  onClick={() => openEdit(p)}
                  aria-label="Editar projeto"
                  title="Editar dados do card"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-red-400"
                  onClick={() => setDeleteTarget(p)}
                  aria-label="Remover projeto"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* create/edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="w-[min(960px,95vw)] max-w-none sm:max-w-none max-h-[90vh] overflow-y-auto bg-neutral-900 border-neutral-800 p-0"
        >
          <DialogHeader className="px-6 pt-6 pb-3 border-b border-neutral-800">
            <DialogTitle className="text-base">
              {editing ? "Editar projeto" : "Novo projeto"}
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Card exibido na home. O link abre automaticamente em <span className="font-mono">/case-study/&lt;slug&gt;</span>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-0">
            {/* ── coluna esquerda: imagem ─────────────────────── */}
            <div className="flex flex-col gap-2 px-6 pt-5 pb-5 md:border-r md:border-neutral-800">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-neutral-400">Imagem (thumb da home)</Label>
                {imageMeta && (
                  <span className="text-[10px] font-mono text-neutral-500">
                    {imageMeta.width}×{imageMeta.height} · {formatBytes(imageMeta.sizeBytes)}
                  </span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFile(file);
                  e.target.value = "";
                }}
                className="hidden"
              />

              {form.image ? (
                <div className="relative group min-h-[380px] flex items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950/50 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.image}
                    alt="Preview"
                    className="max-h-[460px] w-auto max-w-full object-contain"
                  />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <Loader2 className="size-5 animate-spin text-white" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-1 text-[11px] text-white hover:bg-black"
                      title="Trocar imagem"
                    >
                      <ImagePlus className="size-3.5" />
                      Trocar
                    </button>
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="flex size-7 items-center justify-center rounded-md bg-black/70 text-white hover:bg-red-600"
                      title="Remover imagem"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex min-h-[380px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-950/50 px-4 py-6 text-sm text-neutral-400 transition-colors hover:border-neutral-500 hover:bg-neutral-800/30 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      <ImagePlus className="size-7 text-neutral-500" />
                      <div className="text-center space-y-1">
                        <p className="font-medium text-neutral-300">Anexar imagem</p>
                        <p className="text-[11px] text-neutral-500">
                          PNG / JPG / WebP — recomenda‑se 1200×900px ou maior.
                        </p>
                      </div>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* ── coluna direita: campos ─────────────────────── */}
            <div className="flex flex-col gap-4 px-6 pt-5 pb-5">
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-400">Título</Label>
                <Input
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((f) => ({
                      ...f,
                      title,
                      slug: !editing && (f.slug === "" || f.slug === slugify(f.title)) ? slugify(title) : f.slug,
                    }));
                  }}
                  placeholder="Ex: Orcanorte"
                  className="h-9 bg-neutral-800 border-neutral-700 text-neutral-100"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-400">Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                  placeholder="orcanorte"
                  className="h-9 bg-neutral-800 border-neutral-700 text-neutral-100 font-mono text-xs"
                  required
                />
                <p className="text-[10px] text-neutral-500">
                  Abre em <span className="font-mono text-neutral-400">/case-study/{form.slug || "<slug>"}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-400">Descrição curta</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Uma linha que explica o projeto."
                  rows={3}
                  className="resize-none bg-neutral-800 border-neutral-700 text-neutral-100 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-400">Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v as ProjectCategory }))}
                >
                  <SelectTrigger className="h-9 bg-neutral-800 border-neutral-700 text-neutral-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800">
                    {(Object.keys(CATEGORY_LABEL) as ProjectCategory[]).map((c) => (
                      <SelectItem key={c} value={c} className="text-neutral-100 focus:bg-neutral-800">
                        {CATEGORY_LABEL[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-800/50 px-3 py-2 cursor-pointer hover:bg-neutral-800 transition-colors">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  className="size-4 rounded border-neutral-600 bg-neutral-900"
                />
                <span className="text-sm text-neutral-200">Exibir na home</span>
                <span className="ml-auto text-[11px] text-neutral-500">
                  Desmarque para ocultar sem deletar
                </span>
              </label>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>

            {/* ── footer ─────────────────────── */}
            <DialogFooter className="col-span-full border-t border-neutral-800 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting || uploading}
                className="gap-2 bg-white text-neutral-900 hover:bg-neutral-200"
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {editing ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-base">Remover projeto?</DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              <span className="font-medium text-neutral-300">{deleteTarget?.title}</span> será removido. Esta ação é irreversível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={handleDelete}
              className="gap-2 bg-red-600 text-white hover:bg-red-500"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
