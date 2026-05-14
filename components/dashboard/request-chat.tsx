"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/dashboard/auth-provider";
import { Loader2, Paperclip, Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormattedMessageContent } from "@/components/dashboard/formatted-message-content";

interface Comment {
  id: string;
  request_id: string;
  user_id: string;
  is_admin: boolean;
  content: string;
  created_at: string;
  optimistic?: boolean;
  user?: { name: string | null; image: string | null } | null;
}

interface RequestChatProps {
  requestId: string;
  isAdmin?: boolean;
}

function Avatar({ name, isAdmin }: { name: string | null | undefined; isAdmin: boolean }) {
  const initials = name
    ? name.split(" ").slice(0, 2).map(s => s[0]).join("").toUpperCase()
    : isAdmin ? "A" : "U";
  return (
    <div className={cn(
      "size-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold",
      isAdmin ? "bg-purple-500/20 text-purple-300" : "bg-zinc-500/20 text-zinc-300"
    )}>
      {initials}
    </div>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return `ontem ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function markdownLinkLabel(label: string) {
  return label.replace(/[\[\]]/g, "").replace(/[()]/g, "-");
}

export function RequestChat({ requestId, isAdmin = false }: RequestChatProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track last count to scroll only when new messages arrive
  const lastCountRef = useRef(0);

  // SSE — uma conexão persistente, sem polling visível
  useEffect(() => {
    const es = new EventSource(`/api/comments/stream?requestId=${requestId}`);

    es.onmessage = (e) => {
      try {
        const data: Comment[] = JSON.parse(e.data);
        setComments((prev) => {
          // Preserva optimistic messages que ainda não foram confirmadas
          const optimistics = prev.filter((c) => c.optimistic);
          const confirmed = data.filter(
            (d) => !optimistics.some((o) => o.content === d.content && o.user_id === d.user_id)
          );
          return [...confirmed, ...optimistics];
        });
        setLoading(false);
      } catch { /* ignore parse error */ }
    };

    es.onerror = () => {
      setLoading(false);
    };

    return () => es.close();
  }, [requestId]);

  // Scroll para o fim APENAS quando o número de comentários confirmados aumenta
  useEffect(() => {
    const confirmedCount = comments.filter((c) => !c.optimistic).length;
    if (confirmedCount > lastCountRef.current) {
      lastCountRef.current = confirmedCount;
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [comments]);

  async function send(contentOverride?: string) {
    if (!(contentOverride ?? text).trim() || !user) return;

    const content = (contentOverride ?? text).trim();
    const tempId = `optimistic-${Date.now()}`;

    const optimisticComment: Comment = {
      id: tempId,
      request_id: requestId,
      user_id: user.id,
      is_admin: isAdmin,
      content,
      created_at: new Date().toISOString(),
      optimistic: true,
      user: { name: user.name ?? null, image: user.image ?? null },
    };

    setComments(prev => [...prev, optimisticComment]);
    setText("");
    setSending(true);
    textareaRef.current?.focus();

    try {
      await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, content }),
      });
      // SSE vai receber o novo comentário automaticamente — remove o optimistic
      setComments(prev => prev.filter(c => c.id !== tempId));
    } catch {
      setComments(prev => prev.filter(c => c.id !== tempId));
      setText(content);
    } finally {
      setSending(false);
    }
  }

  async function sendAttachment(file: File) {
    if (!user) return;
    if (file.size > 25 * 1024 * 1024) {
      setText((current) => current || "Arquivo deve ter no máximo 25 MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "comments");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao enviar anexo");
      }

      const { url, name } = await res.json();
      const attachmentLine = `[Anexo: ${markdownLinkLabel(name ?? file.name)}](${url})`;
      await send(text.trim() ? `${text.trim()}\n${attachmentLine}` : attachmentLine);
    } catch (err) {
      setText((current) => current || (err instanceof Error ? err.message : "Erro ao enviar anexo"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function deleteComment(id: string) {
    setComments(prev => prev.filter(c => c.id !== id));
    setDeletingId(id);
    try {
      await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
      // SSE detecta a remoção automaticamente
    } catch {
      /* SSE vai resync */ 
    } finally {
      setDeletingId(null);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const isMine = (c: Comment) => c.user_id === user?.id;

  return (
    <div className="flex flex-col rounded-xl border border-border/60 overflow-hidden bg-card">

      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60 bg-muted/20">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Comentários
        </span>
        {!loading && (
          <span className="text-[10px] text-muted-foreground/50">
            {comments.filter(c => !c.optimistic).length} mensage{comments.filter(c => !c.optimistic).length !== 1 ? "ns" : "m"}
          </span>
        )}
      </div>

      {/* Mensagens */}
      <div className="flex flex-col gap-3 px-4 py-4 min-h-[160px] max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-8">
            <Loader2 className="size-4 animate-spin text-muted-foreground/40" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <p className="text-xs text-muted-foreground/50">Nenhuma mensagem ainda.</p>
            <p className="text-[11px] text-muted-foreground/35">Comece a conversa abaixo.</p>
          </div>
        ) : (
          comments.map((c) => {
            const mine = isMine(c);
            return (
              <div
                key={c.id}
                className={cn(
                  "flex gap-2.5 group transition-opacity",
                  mine ? "flex-row-reverse" : "flex-row",
                  c.optimistic && "opacity-60"
                )}
              >
                <Avatar name={c.user?.name} isAdmin={c.is_admin} />
                <div className={cn("flex flex-col gap-1 max-w-[75%]", mine ? "items-end" : "items-start")}>
                  <div className="flex items-center gap-1.5">
                    {!mine && (
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {c.user?.name ?? (c.is_admin ? "Admin" : "Usuário")}
                      </span>
                    )}
                    {c.is_admin && (
                      <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-purple-500/15 text-purple-400 uppercase tracking-wide">
                        admin
                      </span>
                    )}
                  </div>

                  <div className="flex items-end gap-1.5">
                    {!c.optimistic && (isAdmin || mine) && (
                      <button
                        type="button"
                        onClick={() => deleteComment(c.id)}
                        disabled={deletingId === c.id}
                        className={cn(
                          "opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-muted-foreground/40 hover:text-red-400",
                          mine ? "order-first" : "order-last"
                        )}
                      >
                        {deletingId === c.id
                          ? <Loader2 className="size-2.5 animate-spin" />
                          : <Trash2 className="size-2.5" />
                        }
                      </button>
                    )}

                    <div className={cn(
                      "px-3 py-2 rounded-2xl text-sm leading-relaxed break-words",
                      mine
                        ? "bg-purple-600/80 text-white rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    )}>
                      <FormattedMessageContent content={c.content} />
                    </div>
                  </div>

                  <span className="text-[10px] text-muted-foreground/40">
                    {c.optimistic ? "Enviando..." : formatTime(c.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/60 px-3 py-2.5 flex items-end gap-2 bg-muted/10">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) sendAttachment(file);
          }}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || uploading}
          className="shrink-0 flex items-center justify-center size-8 rounded-lg border border-border/50 bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          title="Anexar arquivo"
        >
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Paperclip className="size-3.5" />}
        </button>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva uma mensagem... (Enter para enviar)"
          rows={1}
          className="flex-1 resize-none rounded-lg bg-muted/40 border border-border/40 px-3 py-2 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-purple-500/40 max-h-28 overflow-y-auto leading-relaxed"
          style={{ fieldSizing: "content" } as React.CSSProperties}
        />
        <button
          type="button"
          onClick={() => send()}
          disabled={!text.trim() || sending || uploading}
          className="shrink-0 flex items-center justify-center size-8 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}
