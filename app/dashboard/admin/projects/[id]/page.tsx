"use client";

import { useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/dashboard/auth-provider";
import { LoginOverlay } from "@/components/dashboard/login-overlay";
import { isAdminEmail } from "@/lib/admin-helpers";
import {
  getProjectByIdAdmin,
  updateProjectCaseStudy,
} from "@/lib/dashboard-data";
import type { Project } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Loader2, ShieldCheck, ArrowLeft, Save, Plus, Trash2,
  ImagePlus, X, ExternalLink, ChevronDown, ChevronRight,
  ArrowUp, ArrowDown, Image as ImageIcon, Film,
} from "lucide-react";

type ChallengeRow = { title: string; detail: string };
type SectionRow = {
  title: string;
  body: string[];
  subsections: string[];
  image: string;
  video: string;
};

function parseJson<T>(raw: string | null | undefined, fb: T): T {
  if (!raw) return fb;
  try { return JSON.parse(raw) as T; } catch { return fb; }
}

/* ─── ListEditor: rows of single-line items with reorder + delete ───── */

function ListEditor({
  items, onChange, placeholder, multiline,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  const update = (i: number, v: string) => onChange(items.map((x, idx) => (idx === i ? v : x)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const swap = (i: number, j: number) => {
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-1.5">
      {items.length === 0 && (
        <p className="text-[11px] text-neutral-500 italic px-1">Nenhum item.</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="group flex items-start gap-1.5">
          <div className="flex flex-col gap-0.5 pt-1.5">
            <button
              type="button"
              onClick={() => swap(i, i - 1)}
              disabled={i === 0}
              className="flex size-4 items-center justify-center rounded text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-20 disabled:cursor-not-allowed"
              aria-label="Mover para cima"
            >
              <ArrowUp className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => swap(i, i + 1)}
              disabled={i === items.length - 1}
              className="flex size-4 items-center justify-center rounded text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-20 disabled:cursor-not-allowed"
              aria-label="Mover para baixo"
            >
              <ArrowDown className="size-3" />
            </button>
          </div>
          {multiline ? (
            <Textarea
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              rows={2}
              className="resize-none bg-neutral-800 border-neutral-700 text-neutral-100 text-sm flex-1"
            />
          ) : (
            <Input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className="h-9 bg-neutral-800 border-neutral-700 text-neutral-100 text-sm flex-1"
            />
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-neutral-500 hover:text-red-400 shrink-0"
            onClick={() => remove(i)}
            aria-label="Remover"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 border-dashed border-neutral-700 bg-transparent text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 w-full"
        onClick={() => onChange([...items, ""])}
      >
        <Plus className="size-3.5" />
        Adicionar item
      </Button>
    </div>
  );
}

/* ─── ImageField: URL input + R2 upload + thumb preview ────────────── */

function ImageField({
  value, onChange, compact,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true); setErr(null);
    const localPreview = URL.createObjectURL(file);
    onChange(localPreview);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "projects");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Upload failed");
      const { url } = await res.json();
      URL.revokeObjectURL(localPreview);
      onChange(url);
    } catch (e) {
      URL.revokeObjectURL(localPreview);
      onChange(null);
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
        className="hidden"
      />
      <div className="flex gap-2">
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="https://cdn.afonsodev.com/projects/…"
          className="h-9 flex-1 bg-neutral-800 border-neutral-700 text-neutral-100 text-xs font-mono"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 shrink-0"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
          Upload
        </Button>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-red-400 shrink-0"
            onClick={() => onChange(null)}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="preview"
          className={`${compact ? "max-h-24" : "max-h-48"} rounded border border-neutral-800 object-contain bg-neutral-950`}
        />
      )}
      {err && <p className="text-[11px] text-red-400">{err}</p>}
    </div>
  );
}

/* ─── ChallengeCard: collapsible challenge editor ──────────────────── */

function ChallengeCard({
  challenge, index, total, isOpen,
  onToggle, onUpdate, onRemove, onMove,
}: {
  challenge: ChallengeRow;
  index: number;
  total: number;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<ChallengeRow>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        <button type="button" onClick={onToggle} className="flex items-center gap-2 flex-1 min-w-0 text-left">
          {isOpen ? <ChevronDown className="size-3.5 text-neutral-500 shrink-0" /> : <ChevronRight className="size-3.5 text-neutral-500 shrink-0" />}
          <span className={`text-sm truncate ${challenge.title ? "text-neutral-100 font-medium" : "text-neutral-500 italic"}`}>
            {challenge.title || "Sem título"}
          </span>
          {challenge.detail && !isOpen && (
            <span className="text-[11px] text-neutral-500 truncate">· {challenge.detail.slice(0, 80)}</span>
          )}
        </button>
        <div className="flex items-center gap-0.5 shrink-0">
          <Button variant="ghost" size="icon" className="size-7 text-neutral-500 hover:text-neutral-200 disabled:opacity-30" disabled={index === 0} onClick={() => onMove(-1)}>
            <ArrowUp className="size-3" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 text-neutral-500 hover:text-neutral-200 disabled:opacity-30" disabled={index === total - 1} onClick={() => onMove(1)}>
            <ArrowDown className="size-3" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 text-neutral-500 hover:text-red-400" onClick={onRemove}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      {isOpen && (
        <div className="px-3 pb-3 space-y-2 border-t border-neutral-800/60">
          <div className="pt-3">
            <Label className="text-[11px] text-neutral-500 mb-1 block">Título do challenge</Label>
            <Input
              value={challenge.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Ex: SEO-first and highly performant catalog"
              className="h-8 bg-neutral-800 border-neutral-700 text-neutral-100 text-sm"
            />
          </div>
          <div>
            <Label className="text-[11px] text-neutral-500 mb-1 block">Detalhe / solução</Label>
            <Textarea
              value={challenge.detail}
              onChange={(e) => onUpdate({ detail: e.target.value })}
              placeholder="Como você abordou esse desafio"
              rows={3}
              className="resize-none bg-neutral-800 border-neutral-700 text-neutral-100 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── SectionCard: collapsible rich section editor ─────────────────── */

function SectionCard({
  section, index, total, isOpen,
  onToggle, onUpdate, onRemove, onMove,
}: {
  section: SectionRow;
  index: number;
  total: number;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<SectionRow>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        <button type="button" onClick={onToggle} className="flex items-center gap-2 flex-1 min-w-0 text-left">
          {isOpen ? <ChevronDown className="size-3.5 text-neutral-500 shrink-0" /> : <ChevronRight className="size-3.5 text-neutral-500 shrink-0" />}
          <span className={`text-sm truncate ${section.title ? "text-neutral-100 font-medium" : "text-neutral-500 italic"}`}>
            {section.title || "Sem título"}
          </span>
          <span className="flex items-center gap-2 text-[10px] text-neutral-500 shrink-0">
            <span>{section.body.length} ¶</span>
            {section.subsections.length > 0 && <span>· {section.subsections.length} subs</span>}
            {section.image && <ImageIcon className="size-3" />}
            {section.video && <Film className="size-3" />}
          </span>
        </button>
        <div className="flex items-center gap-0.5 shrink-0">
          <Button variant="ghost" size="icon" className="size-7 text-neutral-500 hover:text-neutral-200 disabled:opacity-30" disabled={index === 0} onClick={() => onMove(-1)}>
            <ArrowUp className="size-3" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 text-neutral-500 hover:text-neutral-200 disabled:opacity-30" disabled={index === total - 1} onClick={() => onMove(1)}>
            <ArrowDown className="size-3" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 text-neutral-500 hover:text-red-400" onClick={onRemove}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      {isOpen && (
        <div className="px-3 pb-3 space-y-3 border-t border-neutral-800/60 pt-3">
          <div>
            <Label className="text-[11px] text-neutral-500 mb-1 block">Título da section</Label>
            <Input
              value={section.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Ex: Architecture"
              className="h-8 bg-neutral-800 border-neutral-700 text-neutral-100 text-sm font-medium"
            />
          </div>

          <div>
            <Label className="text-[11px] text-neutral-500 mb-1 block">Parágrafos (cada item vira um &lt;p&gt;)</Label>
            <ListEditor
              items={section.body}
              onChange={(body) => onUpdate({ body })}
              placeholder="Um parágrafo desta section…"
              multiline
            />
          </div>

          <div>
            <Label className="text-[11px] text-neutral-500 mb-1 block">Subsections (cada item vira um &lt;h3&gt;)</Label>
            <ListEditor
              items={section.subsections}
              onChange={(subsections) => onUpdate({ subsections })}
              placeholder="Frontend"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] text-neutral-500 mb-1 block">Imagem (opcional)</Label>
              <ImageField value={section.image || null} onChange={(v) => onUpdate({ image: v ?? "" })} compact />
            </div>
            <div>
              <Label className="text-[11px] text-neutral-500 mb-1 block">Vídeo URL (opcional)</Label>
              <Input
                value={section.video}
                onChange={(e) => onUpdate({ video: e.target.value })}
                placeholder="https://cdn.afonsodev.com/projects/…mp4"
                className="h-9 bg-neutral-800 border-neutral-700 text-neutral-100 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */

type Tab = "hero" | "content" | "challenges" | "sections";

const TABS: { id: Tab; label: string; counter?: (s: State) => number }[] = [
  { id: "hero",       label: "Hero" },
  { id: "content",    label: "Conteúdo" },
  { id: "challenges", label: "Challenges", counter: (s) => s.challenges.length },
  { id: "sections",   label: "Sections",   counter: (s) => s.sections.length },
];

type State = {
  challenges: ChallengeRow[];
  sections: SectionRow[];
};

export default function ProjectEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<Tab>("hero");

  // editable fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [timeline, setTimeline] = useState("");
  const [stack, setStack] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [story, setStory] = useState("");
  const [revenueNote, setRevenueNote] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [image2, setImage2] = useState<string | null>(null);
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [openChallenges, setOpenChallenges] = useState<Set<number>>(new Set());
  const [openSections, setOpenSections] = useState<Set<number>>(new Set());

  const isAdmin = isAdminEmail(user?.email);

  useEffect(() => {
    if (!user || !isAdmin) return;
    getProjectByIdAdmin(id)
      .then((p) => {
        if (!p) return;
        setProject(p);
        setTitle(p.title);
        setSubtitle(p.subtitle ?? "");
        setDescription(p.description ?? "");
        setRole(p.role ?? "");
        setTimeline(p.timeline ?? "");
        setStack(p.stack ?? "");
        setLiveUrl(p.live_url ?? "");
        setGithubUrl(p.github_url ?? "");
        setStory(p.story ?? "");
        setRevenueNote(p.revenue_note ?? "");
        setImage(p.image);
        setImage2(p.image2);
        setExtraImages(parseJson<string[]>(p.extra_images, []));
        setObjectives(parseJson<string[]>(p.objectives, []));
        setHighlights(parseJson<string[]>(p.highlights, []));
        setOutcomes(parseJson<string[]>(p.outcomes, []));
        setChallenges(parseJson<ChallengeRow[]>(p.challenges, []));
        const secs = parseJson<{ title: string; body: string[]; subsections?: string[]; image?: string; video?: string }[]>(p.sections, []);
        setSections(
          secs.map((s) => ({
            title: s.title ?? "",
            body: s.body ?? [],
            subsections: s.subsections ?? [],
            image: s.image ?? "",
            video: s.video ?? "",
          })),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, isAdmin, id]);

  async function handleSave() {
    if (!project) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const sectionsPayload = sections
        .filter((s) => s.title.trim() !== "")
        .map((s) => ({
          title: s.title.trim(),
          body: s.body.filter((p) => p.trim()),
          subsections: s.subsections.filter((p) => p.trim()),
          ...(s.image.trim() ? { image: s.image.trim() } : {}),
          ...(s.video.trim() ? { video: s.video.trim() } : {}),
        }));

      await updateProjectCaseStudy(project.id, {
        subtitle: subtitle.trim() || null,
        role: role.trim() || null,
        timeline: timeline.trim() || null,
        stack: stack.trim() || null,
        live_url: liveUrl.trim() || null,
        github_url: githubUrl.trim() || null,
        story: story.trim() || null,
        image2: image2,
        revenue_note: revenueNote.trim() || null,
        extra_images: JSON.stringify(extraImages.filter((x) => x.trim())),
        objectives: JSON.stringify(objectives.filter((x) => x.trim())),
        highlights: JSON.stringify(highlights.filter((x) => x.trim())),
        outcomes: JSON.stringify(outcomes.filter((x) => x.trim())),
        challenges: JSON.stringify(challenges.filter((c) => c.title.trim() || c.detail.trim())),
        sections: JSON.stringify(sectionsPayload),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  function toggleSet(s: Set<number>, i: number) {
    const next = new Set(s);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    return next;
  }

  if (authLoading || loading)
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
        <p className="text-sm text-muted-foreground">Acesso restrito a administradores.</p>
      </div>
    );
  if (!project)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <p className="text-sm">Projeto não encontrado.</p>
        <Link href="/dashboard/admin/projects" className="text-xs underline">Voltar</Link>
      </div>
    );

  const state: State = { challenges, sections };

  return (
    <div className="flex flex-col gap-4">
      {/* sticky toolbar */}
      <div className="sticky top-14 z-20 -mx-6 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3 px-6 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 h-8 text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/dashboard/admin/projects")}
          >
            <ArrowLeft className="size-3.5" />
            Projects
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground/60 font-mono truncate">{project.slug}</p>
            <h1 className="text-sm font-semibold truncate">{title || "Untitled"}</h1>
          </div>
          <Link
            href={`/case-study/${project.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            <ExternalLink className="size-3.5" />
            Preview
          </Link>
          <Button
            size="sm"
            className="gap-2 h-8 bg-white text-neutral-900 hover:bg-neutral-200"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            {saved ? "Salvo" : "Salvar"}
          </Button>
        </div>

        {/* tabs */}
        <div className="flex gap-1 px-6">
          {TABS.map((t) => {
            const count = t.counter?.(state);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                {count !== undefined && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* ── HERO TAB ─────────────────────────────────────── */}
      {tab === "hero" && (
        <div className="space-y-5">
          <Card title="Identidade" hint="Cargo, período e stack que aparecem logo abaixo do título.">
            <Grid cols="2">
              <Field label="Título" hint="Editado em Projects">
                <Input value={title} disabled className="h-9 bg-neutral-800/50 border-neutral-700 text-neutral-400 text-sm italic" />
              </Field>
              <Field label="Subtítulo (opcional)">
                <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Linha de apoio" className="h-9 bg-neutral-800 border-neutral-700 text-neutral-100" />
              </Field>
              <Field label="Role">
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex: Full-stack Engineer" className="h-9 bg-neutral-800 border-neutral-700 text-neutral-100" />
              </Field>
              <Field label="Timeline">
                <Input value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="Ex: 2024–2025" className="h-9 bg-neutral-800 border-neutral-700 text-neutral-100" />
              </Field>
            </Grid>
            <Field label="Stack" hint="Texto livre, separado por vírgulas.">
              <Textarea value={stack} onChange={(e) => setStack(e.target.value)} rows={2} className="resize-none bg-neutral-800 border-neutral-700 text-neutral-100 text-sm" />
            </Field>
          </Card>

          <Card title="Links" hint="Botões que aparecem no topo do case-study.">
            <Grid cols="2">
              <Field label="Live URL">
                <Input value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://…" className="h-9 bg-neutral-800 border-neutral-700 text-neutral-100 text-xs font-mono" />
              </Field>
              <Field label="GitHub URL">
                <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/…" className="h-9 bg-neutral-800 border-neutral-700 text-neutral-100 text-xs font-mono" />
              </Field>
            </Grid>
          </Card>

          <Card title="Imagens" hint="Hero (imagem principal) e uma secundária opcional que aparece abaixo.">
            <Grid cols="2">
              <Field label="Imagem principal"><ImageField value={image} onChange={setImage} /></Field>
              <Field label="Imagem 2 (opcional)"><ImageField value={image2} onChange={setImage2} /></Field>
            </Grid>
            <Field label="Extra images" hint="Lista de URLs adicionais — não renderizadas ainda no view; ficam disponíveis pra reuso em sections.">
              <ListEditor items={extraImages} onChange={setExtraImages} placeholder="https://cdn.afonsodev.com/projects/…" />
            </Field>
          </Card>
        </div>
      )}

      {/* ── CONTENT TAB ──────────────────────────────────── */}
      {tab === "content" && (
        <div className="space-y-5">
          <Card title="Descrição & Story">
            <Field label="Description" hint="Parágrafo principal — editado em Projects.">
              <Textarea value={description} disabled rows={3} className="resize-none bg-neutral-800/50 border-neutral-700 text-neutral-400 text-sm italic" />
            </Field>
            <Field label="Story (Vision & MVP)" hint="Primeira section narrada — aparece logo após o hero.">
              <Textarea value={story} onChange={(e) => setStory(e.target.value)} rows={5} className="resize-none bg-neutral-800 border-neutral-700 text-neutral-100 text-sm" />
            </Field>
          </Card>

          <Card title="Objectives" hint="Bullets que viram a section Objectives.">
            <ListEditor items={objectives} onChange={setObjectives} placeholder="Um objetivo" multiline />
          </Card>

          <Card title="Highlights" hint="Pontos altos do projeto, renderizados como bullets.">
            <ListEditor items={highlights} onChange={setHighlights} placeholder="Um highlight" multiline />
          </Card>

          <Card title="Outcomes" hint="Resultados que aparecem no fim do case.">
            <ListEditor items={outcomes} onChange={setOutcomes} placeholder="Um resultado" multiline />
          </Card>

          <Card title="Revenue note (opcional)" hint="Bloco discreto ao final mostrando aspecto financeiro.">
            <Textarea value={revenueNote} onChange={(e) => setRevenueNote(e.target.value)} rows={2} className="resize-none bg-neutral-800 border-neutral-700 text-neutral-100 text-sm" />
          </Card>
        </div>
      )}

      {/* ── CHALLENGES TAB ──────────────────────────────── */}
      {tab === "challenges" && (
        <Card
          title="Challenges & Solutions"
          hint="Blocos com título + detalhe. Clique numa linha pra expandir."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
              onClick={() => {
                setChallenges((cs) => {
                  const next = [...cs, { title: "", detail: "" }];
                  setOpenChallenges(new Set([next.length - 1]));
                  return next;
                });
              }}
            >
              <Plus className="size-3" />
              Adicionar
            </Button>
          }
        >
          {challenges.length === 0 ? (
            <p className="text-xs text-neutral-500 italic">Nenhum challenge cadastrado.</p>
          ) : (
            <div className="space-y-2">
              {challenges.map((c, idx) => (
                <ChallengeCard
                  key={idx}
                  challenge={c}
                  index={idx}
                  total={challenges.length}
                  isOpen={openChallenges.has(idx)}
                  onToggle={() => setOpenChallenges((s) => toggleSet(s, idx))}
                  onUpdate={(patch) =>
                    setChallenges((cs) => cs.map((x, i) => (i === idx ? { ...x, ...patch } : x)))
                  }
                  onRemove={() => setChallenges((cs) => cs.filter((_, i) => i !== idx))}
                  onMove={(dir) =>
                    setChallenges((cs) => {
                      const t = idx + dir;
                      if (t < 0 || t >= cs.length) return cs;
                      const next = [...cs];
                      [next[idx], next[t]] = [next[t], next[idx]];
                      return next;
                    })
                  }
                />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── SECTIONS TAB ────────────────────────────────── */}
      {tab === "sections" && (
        <Card
          title="Sections"
          hint="Blocos longos com parágrafos, subsections, imagem e vídeo. Cada um vira uma âncora no TOC."
          action={
            <div className="flex items-center gap-2">
              {sections.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-neutral-400 hover:text-neutral-200"
                  onClick={() =>
                    setOpenSections(
                      openSections.size === sections.length
                        ? new Set()
                        : new Set(sections.map((_, i) => i)),
                    )
                  }
                >
                  {openSections.size === sections.length ? "Recolher todas" : "Expandir todas"}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                onClick={() => {
                  setSections((ss) => {
                    const next = [...ss, { title: "", body: [], subsections: [], image: "", video: "" }];
                    setOpenSections(new Set([next.length - 1]));
                    return next;
                  });
                }}
              >
                <Plus className="size-3" />
                Adicionar
              </Button>
            </div>
          }
        >
          {sections.length === 0 ? (
            <p className="text-xs text-neutral-500 italic">Nenhuma section cadastrada.</p>
          ) : (
            <div className="space-y-2">
              {sections.map((s, idx) => (
                <SectionCard
                  key={idx}
                  section={s}
                  index={idx}
                  total={sections.length}
                  isOpen={openSections.has(idx)}
                  onToggle={() => setOpenSections((set) => toggleSet(set, idx))}
                  onUpdate={(patch) =>
                    setSections((ss) => ss.map((x, i) => (i === idx ? { ...x, ...patch } : x)))
                  }
                  onRemove={() => setSections((ss) => ss.filter((_, i) => i !== idx))}
                  onMove={(dir) =>
                    setSections((ss) => {
                      const t = idx + dir;
                      if (t < 0 || t >= ss.length) return ss;
                      const next = [...ss];
                      [next[idx], next[t]] = [next[t], next[idx]];
                      return next;
                    })
                  }
                />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* footer save */}
      <div className="flex justify-end pt-2 pb-6">
        <Button
          size="sm"
          className="gap-2 bg-white text-neutral-900 hover:bg-neutral-200"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {saved ? "Salvo" : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}

/* ─── layout primitives ───────────────────────────────────────────── */

function Card({
  title, hint, action, children,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border/40 bg-muted/20 px-4 py-2.5">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
        </div>
        {action}
      </div>
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-xs text-neutral-400">{label}</Label>
        {hint && <span className="text-[10px] text-neutral-500">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Grid({ cols, children }: { cols: "2" | "3"; children: React.ReactNode }) {
  return (
    <div className={`grid grid-cols-1 ${cols === "2" ? "md:grid-cols-2" : "md:grid-cols-3"} gap-3`}>
      {children}
    </div>
  );
}
