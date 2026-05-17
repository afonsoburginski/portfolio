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
  ImagePlus, X, ExternalLink,
} from "lucide-react";

type ChallengeRow = { title: string; detail: string };
type SectionRow = {
  title: string;
  body: string;        // textarea: one paragraph per line
  subsections: string; // textarea: one subsection per line
  image: string;
  video: string;
};

function parseJson<T>(raw: string | null | undefined, fb: T): T {
  if (!raw) return fb;
  try { return JSON.parse(raw) as T; } catch { return fb; }
}

const linesToArray = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const arrayToLines = (a: string[] | null | undefined) => (a ?? []).join("\n");

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
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
      <Label className="text-xs text-neutral-400">{label}</Label>
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
          className="h-9 gap-1.5 border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
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
            className="h-9 border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-red-400"
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
          className="max-h-40 rounded border border-neutral-800 object-contain bg-neutral-950"
        />
      )}
      {err && <p className="text-[11px] text-red-400">{err}</p>}
    </div>
  );
}

export default function ProjectEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
  const [extraImages, setExtraImages] = useState("");
  const [objectives, setObjectives] = useState("");
  const [highlights, setHighlights] = useState("");
  const [outcomes, setOutcomes] = useState("");
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);
  const [sections, setSections] = useState<SectionRow[]>([]);

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
        setExtraImages(arrayToLines(parseJson<string[]>(p.extra_images, [])));
        setObjectives(arrayToLines(parseJson<string[]>(p.objectives, [])));
        setHighlights(arrayToLines(parseJson<string[]>(p.highlights, [])));
        setOutcomes(arrayToLines(parseJson<string[]>(p.outcomes, [])));
        setChallenges(parseJson<ChallengeRow[]>(p.challenges, []));
        const secs = parseJson<{ title: string; body: string[]; subsections?: string[]; image?: string; video?: string }[]>(p.sections, []);
        setSections(
          secs.map((s) => ({
            title: s.title ?? "",
            body: (s.body ?? []).join("\n"),
            subsections: (s.subsections ?? []).join("\n"),
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
          body: linesToArray(s.body),
          subsections: linesToArray(s.subsections),
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
        extra_images: JSON.stringify(linesToArray(extraImages)),
        objectives: JSON.stringify(linesToArray(objectives)),
        highlights: JSON.stringify(linesToArray(highlights)),
        outcomes: JSON.stringify(linesToArray(outcomes)),
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

  return (
    <div className="flex flex-col gap-6">
      {/* sticky header */}
      <div className="sticky top-14 z-20 -mx-6 flex flex-wrap items-center gap-3 border-b border-border/50 bg-background/95 px-6 py-3 backdrop-blur-sm">
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

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Hero */}
      <Section title="Hero" hint="Informações principais exibidas no topo do case-study.">
        <Grid cols="2">
          <Field label="Título"><Input value={title} disabled className="h-9 bg-neutral-800/50 border-neutral-700 text-neutral-400 text-xs italic" /></Field>
          <Field label="Subtítulo"><Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="h-9 bg-neutral-800 border-neutral-700 text-neutral-100" placeholder="Opcional" /></Field>
          <Field label="Role"><Input value={role} onChange={(e) => setRole(e.target.value)} className="h-9 bg-neutral-800 border-neutral-700 text-neutral-100" placeholder="Ex: Full-stack Engineer" /></Field>
          <Field label="Timeline"><Input value={timeline} onChange={(e) => setTimeline(e.target.value)} className="h-9 bg-neutral-800 border-neutral-700 text-neutral-100" placeholder="Ex: 2024–2025" /></Field>
          <Field label="Live URL"><Input value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} className="h-9 bg-neutral-800 border-neutral-700 text-neutral-100 text-xs font-mono" placeholder="https://…" /></Field>
          <Field label="GitHub URL"><Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="h-9 bg-neutral-800 border-neutral-700 text-neutral-100 text-xs font-mono" placeholder="https://github.com/…" /></Field>
        </Grid>
        <Field label="Stack (texto livre, separado por vírgulas)">
          <Textarea value={stack} onChange={(e) => setStack(e.target.value)} rows={2} className="resize-none bg-neutral-800 border-neutral-700 text-neutral-100 text-sm" />
        </Field>
      </Section>

      {/* Imagens */}
      <Section title="Imagens" hint="Imagem principal (thumb da home + hero) e secundária.">
        <Grid cols="2">
          <ImageField label="Imagem principal" value={image} onChange={setImage} />
          <ImageField label="Imagem 2 (opcional)" value={image2} onChange={setImage2} />
        </Grid>
        <Field label="Extra images (uma URL por linha)">
          <Textarea value={extraImages} onChange={(e) => setExtraImages(e.target.value)} rows={3} className="resize-none bg-neutral-800 border-neutral-700 text-neutral-100 text-xs font-mono" />
        </Field>
      </Section>

      {/* Conteúdo */}
      <Section title="Conteúdo" hint="Story, descrição e bullets.">
        <Field label="Description (parágrafo de abertura)">
          <Textarea value={description} disabled rows={3} className="resize-none bg-neutral-800/50 border-neutral-700 text-neutral-400 text-xs italic" />
          <p className="text-[10px] text-neutral-500 mt-1">Editado na tela anterior (Projects).</p>
        </Field>
        <Field label="Story (Vision & MVP)">
          <Textarea value={story} onChange={(e) => setStory(e.target.value)} rows={4} className="resize-none bg-neutral-800 border-neutral-700 text-neutral-100 text-sm" />
        </Field>
        <Field label="Objectives (uma por linha)">
          <Textarea value={objectives} onChange={(e) => setObjectives(e.target.value)} rows={5} className="resize-none bg-neutral-800 border-neutral-700 text-neutral-100 text-sm" />
        </Field>
        <Field label="Highlights (uma por linha)">
          <Textarea value={highlights} onChange={(e) => setHighlights(e.target.value)} rows={5} className="resize-none bg-neutral-800 border-neutral-700 text-neutral-100 text-sm" />
        </Field>
        <Field label="Outcomes (uma por linha)">
          <Textarea value={outcomes} onChange={(e) => setOutcomes(e.target.value)} rows={5} className="resize-none bg-neutral-800 border-neutral-700 text-neutral-100 text-sm" />
        </Field>
        <Field label="Revenue note (opcional)">
          <Textarea value={revenueNote} onChange={(e) => setRevenueNote(e.target.value)} rows={2} className="resize-none bg-neutral-800 border-neutral-700 text-neutral-100 text-sm" />
        </Field>
      </Section>

      {/* Challenges */}
      <Section
        title="Challenges & Solutions"
        hint="Cada bloco tem um título e um detalhamento."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
            onClick={() => setChallenges((cs) => [...cs, { title: "", detail: "" }])}
          >
            <Plus className="size-3" />
            Adicionar
          </Button>
        }
      >
        {challenges.length === 0 ? (
          <p className="text-xs text-neutral-500 italic">Nenhum challenge cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {challenges.map((c, idx) => (
              <div key={idx} className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <Input
                    value={c.title}
                    onChange={(e) => setChallenges((cs) => cs.map((x, i) => i === idx ? { ...x, title: e.target.value } : x))}
                    placeholder="Título do challenge"
                    className="h-8 bg-neutral-800 border-neutral-700 text-neutral-100 text-sm font-medium"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-neutral-500 hover:text-red-400 shrink-0"
                    onClick={() => setChallenges((cs) => cs.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                <Textarea
                  value={c.detail}
                  onChange={(e) => setChallenges((cs) => cs.map((x, i) => i === idx ? { ...x, detail: e.target.value } : x))}
                  placeholder="Como você resolveu / abordou esse desafio"
                  rows={3}
                  className="resize-none bg-neutral-800 border-neutral-700 text-neutral-100 text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Sections */}
      <Section
        title="Sections"
        hint="Blocos extras que aparecem no case-study com TOC próprio."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
            onClick={() => setSections((ss) => [...ss, { title: "", body: "", subsections: "", image: "", video: "" }])}
          >
            <Plus className="size-3" />
            Adicionar
          </Button>
        }
      >
        {sections.length === 0 ? (
          <p className="text-xs text-neutral-500 italic">Nenhuma section cadastrada.</p>
        ) : (
          <div className="space-y-4">
            {sections.map((s, idx) => (
              <div key={idx} className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <Input
                    value={s.title}
                    onChange={(e) => setSections((ss) => ss.map((x, i) => i === idx ? { ...x, title: e.target.value } : x))}
                    placeholder="Título da section"
                    className="h-8 bg-neutral-800 border-neutral-700 text-neutral-100 text-sm font-medium"
                  />
                  <div className="flex gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-neutral-500 hover:text-neutral-200 disabled:opacity-30"
                      disabled={idx === 0}
                      onClick={() => setSections((ss) => {
                        const next = [...ss];
                        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                        return next;
                      })}
                      aria-label="Mover para cima"
                    >↑</Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-neutral-500 hover:text-neutral-200 disabled:opacity-30"
                      disabled={idx === sections.length - 1}
                      onClick={() => setSections((ss) => {
                        const next = [...ss];
                        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                        return next;
                      })}
                      aria-label="Mover para baixo"
                    >↓</Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-neutral-500 hover:text-red-400"
                      onClick={() => setSections((ss) => ss.filter((_, i) => i !== idx))}
                      aria-label="Remover section"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Body (um parágrafo por linha)">
                    <Textarea
                      value={s.body}
                      onChange={(e) => setSections((ss) => ss.map((x, i) => i === idx ? { ...x, body: e.target.value } : x))}
                      rows={5}
                      className="resize-none bg-neutral-800 border-neutral-700 text-neutral-100 text-sm"
                    />
                  </Field>
                  <Field label="Subsections (uma por linha)">
                    <Textarea
                      value={s.subsections}
                      onChange={(e) => setSections((ss) => ss.map((x, i) => i === idx ? { ...x, subsections: e.target.value } : x))}
                      rows={5}
                      className="resize-none bg-neutral-800 border-neutral-700 text-neutral-100 text-sm"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Image URL">
                    <Input
                      value={s.image}
                      onChange={(e) => setSections((ss) => ss.map((x, i) => i === idx ? { ...x, image: e.target.value } : x))}
                      placeholder="https://cdn.afonsodev.com/projects/…"
                      className="h-9 bg-neutral-800 border-neutral-700 text-neutral-100 text-xs font-mono"
                    />
                  </Field>
                  <Field label="Video URL (mp4)">
                    <Input
                      value={s.video}
                      onChange={(e) => setSections((ss) => ss.map((x, i) => i === idx ? { ...x, video: e.target.value } : x))}
                      placeholder="https://cdn.afonsodev.com/projects/…mp4"
                      className="h-9 bg-neutral-800 border-neutral-700 text-neutral-100 text-xs font-mono"
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

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

/* ─── small layout helpers ─────────────────────────── */

function Section({
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-neutral-400">{label}</Label>
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
