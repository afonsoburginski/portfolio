"use client";

import { useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/dashboard/auth-provider";
import { LoginOverlay } from "@/components/dashboard/login-overlay";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import type { Request, RequestStatus } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Loader2, XCircle,
  CalendarClock, DollarSign, Truck, MessageSquare, Clock,
  CheckCircle2, CreditCard, AlertCircle, QrCode, ChevronLeft,
  Sparkles,
} from "lucide-react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MercadoPago: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentBrickController: any;
  }
}

const STATUS_COLORS: Record<RequestStatus, string> = {
  submitted:   "bg-blue-500/15 text-blue-400 border-blue-500/20",
  reviewing:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  quoted:      "bg-purple-500/15 text-purple-400 border-purple-500/20",
  approved:    "bg-green-500/15 text-green-400 border-green-500/20",
  rejected:    "bg-red-500/15 text-red-400 border-red-500/20",
  in_progress: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  delivered:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  cancelled:   "bg-neutral-500/15 text-neutral-400 border-neutral-500/20",
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  submitted:   "Enviado",
  reviewing:   "Em análise",
  quoted:      "Orçamento pronto",
  approved:    "Aprovado",
  rejected:    "Recusado",
  in_progress: "Em produção",
  delivered:   "Concluído",
  cancelled:   "Cancelado",
};

const TYPE_LABELS: Record<string, string> = {
  feature: "Nova funcionalidade", bug_fix: "Correção de bug", integration: "Integração",
  maintenance: "Manutenção", redesign: "Redesign / UI", other: "Outro",
};

function loadMpScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.MercadoPago) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [req, setReq] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [declining, setDeclining] = useState(false);
  const [payStep, setPayStep] = useState<"idle" | "method" | "paying">("idle");
  const [payMethod, setPayMethod] = useState<"pix" | "card" | null>(null);
  const [brickLoading, setBrickLoading] = useState(false);
  const [brickError, setBrickError] = useState<string | null>(null);
  const [paymentFeedback, setPaymentFeedback] = useState<"success" | "pending" | "failure" | null>(null);
  const brickMounted = useRef(false);
  const [preference, setPreference] = useState<{ id: string; amount: number } | null>(null);

  // Check payment return params
  useEffect(() => {
    const status = searchParams.get("payment");
    if (status === "success" || status === "pending" || status === "failure") {
      setPaymentFeedback(status);
      router.replace(`/dashboard/requests/${id}`, { scroll: false });
    }
  }, [searchParams, id, router]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await createBrowserSupabase()
        .from("requests")
        .select("*, profiles(id, full_name, email, avatar_url)")
        .eq("id", id)
        .single();
      if (data) setReq(data as unknown as Request);
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, [user, id]);

  async function getToken(): Promise<string> {
    const { data: { session } } = await createBrowserSupabase().auth.getSession();
    if (!session?.access_token) throw new Error("Sem sessão");
    return session.access_token;
  }

  async function decline() {
    if (!req) return;
    setDeclining(true);
    try {
      const token = await getToken();
      await fetch(`/api/requests/${req.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "rejected" }),
      });
      setReq(r => r ? { ...r, status: "rejected" } : r);
    } finally {
      setDeclining(false);
    }
  }

  async function unmountBrick() {
    if (brickMounted.current && window.paymentBrickController) {
      await window.paymentBrickController.unmount().catch(() => {});
      brickMounted.current = false;
    }
  }

  async function initBrick(preferenceId: string, amount: number, method: "pix" | "card") {
    await loadMpScript();
    await unmountBrick();
    brickMounted.current = true;

    const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, {
      locale: "pt-BR",
    });
    const bricksBuilder = mp.bricks();

    const paymentMethods = method === "pix"
      ? { bankTransfer: "all" as const, ticket: "none" as const, creditCard: "none" as const, debitCard: "none" as const, mercadoPago: "none" as const }
      : { creditCard: "all" as const, debitCard: "all" as const, bankTransfer: "none" as const, ticket: "none" as const, mercadoPago: "none" as const };

    await bricksBuilder.create("payment", "mp-payment-brick", {
      initialization: { amount, preferenceId },
      customization: {
        paymentMethods,
        visual: {
          style: {
            theme: "dark",
            customVariables: { baseColor: "#a855f7" },
          },
          hideFormTitle: true,
        },
      },
      callbacks: {
        onReady: () => { setBrickLoading(false); },
        onError: (err: unknown) => {
          console.error("[MP Brick]", err);
          setBrickError("Erro ao carregar. Tente novamente.");
          setBrickLoading(false);
        },
        onSubmit: async ({ formData }: { formData: unknown }) => {
          try {
            const token = await getToken();
            const res = await fetch("/api/payments/process", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ requestId: id, formData }),
            });
            const json = await res.json();
            if (json.status === "approved") {
              await unmountBrick();
              setReq(r => r ? { ...r, status: "approved", paid_at: new Date().toISOString() } : r);
              setPayStep("idle");
              setPaymentFeedback("success");
            } else if (json.status === "pending" || json.status === "in_process") {
              await unmountBrick();
              setPayStep("idle");
              setPaymentFeedback("pending");
            } else {
              setBrickError("Pagamento não aprovado. Verifique os dados e tente novamente.");
            }
          } catch {
            setBrickError("Erro ao processar. Tente novamente.");
          }
        },
      },
    });
  }

  async function startPayment() {
    setBrickError(null);
    setPayStep("method");
    /* pré-carrega a preferência em background para não atrasar ao selecionar */
    try {
      const token = await getToken();
      const res = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requestId: id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erro ao criar preferência");
      }
      const { preferenceId, amount } = await res.json();
      setPreference({ id: preferenceId, amount });
    } catch (err) {
      setBrickError(err instanceof Error ? err.message : "Erro desconhecido");
    }
  }

  async function selectMethod(method: "pix" | "card") {
    if (!preference) {
      setBrickError("Preferência não carregada. Tente novamente.");
      return;
    }
    setPayMethod(method);
    setPayStep("paying");
    setBrickLoading(true);
    setBrickError(null);
    try {
      await initBrick(preference.id, preference.amount, method);
    } catch (err) {
      setBrickError(err instanceof Error ? err.message : "Erro desconhecido");
      setBrickLoading(false);
    }
  }

  async function cancelPayment() {
    await unmountBrick();
    setPayStep("idle");
    setPayMethod(null);
    setBrickError(null);
    setPreference(null);
  }

  if (authLoading || loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
  if (!user) return <LoginOverlay />;
  if (!req) return (
    <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-sm">
      Pedido não encontrado.
    </div>
  );

  const hasQuote = ["quoted", "approved", "in_progress", "delivered"].includes(req.status) && req.budget;
  const isPaid = !!req.paid_at || !!req.paid_manually;

  /* ── Tela de pagamento (step-by-step) ──────────────────────────── */
  if (payStep !== "idle") {
    return (
      <div className="max-w-3xl mx-auto w-full space-y-6 py-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={cancelPayment}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Pagamento</p>
            <p className="text-sm font-semibold truncate">{req.title}</p>
          </div>
          {/* Step indicator */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${payStep === "method" ? "bg-purple-400" : "bg-purple-400/30"}`} />
            <span className={`size-2 rounded-full ${payStep === "paying" ? "bg-purple-400" : "bg-purple-400/30"}`} />
          </div>
        </div>

        {/* Resumo do valor */}
        <div className="rounded-xl border border-border/60 bg-card px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total a pagar</p>
            <p className="text-2xl font-bold">{req.budget}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Projeto</p>
            <p className="text-xs font-medium text-muted-foreground truncate max-w-[140px]">{TYPE_LABELS[req.type] ?? req.type}</p>
          </div>
        </div>

        {/* ── Step 1: selecionar método ── */}
        {payStep === "method" && (
          <div className="space-y-4">
            <div>
              <p className="text-base font-semibold">Como você quer pagar?</p>
              <p className="text-xs text-muted-foreground mt-0.5">Escolha o método de pagamento</p>
            </div>

            {brickError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2">
                <AlertCircle className="size-4 text-red-400 shrink-0" />
                <p className="text-xs text-red-400">{brickError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => selectMethod("pix")}
                disabled={!preference}
                className="group relative flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-6 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:shadow-md disabled:pointer-events-none disabled:opacity-40"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
                  <QrCode className="size-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold">PIX</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Instantâneo · sem taxas</p>
                </div>
                {!preference && (
                  <Loader2 className="absolute right-3 top-3 size-3 animate-spin text-muted-foreground" />
                )}
              </button>

              <button
                type="button"
                onClick={() => selectMethod("card")}
                disabled={!preference}
                className="group relative flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-6 text-center transition-all hover:border-purple-500/50 hover:bg-purple-500/5 hover:shadow-md disabled:pointer-events-none disabled:opacity-40"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 transition-colors group-hover:bg-purple-500/20">
                  <CreditCard className="size-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Cartão</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Crédito ou débito</p>
                </div>
                {!preference && (
                  <Loader2 className="absolute right-3 top-3 size-3 animate-spin text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: brick ── */}
        {payStep === "paying" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => { await unmountBrick(); setPayStep("method"); setBrickError(null); }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="size-3.5" />
                Voltar
              </button>
              <span className="text-muted-foreground/40">·</span>
              <span className="flex items-center gap-1.5 text-xs font-medium">
                {payMethod === "pix"
                  ? <><QrCode className="size-3.5 text-emerald-400" />PIX</>
                  : <><CreditCard className="size-3.5 text-purple-400" />Cartão</>
                }
              </span>
            </div>

            {brickLoading && (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                <Loader2 className="size-6 animate-spin" />
                <span className="text-xs">Carregando formulário...</span>
              </div>
            )}

            {brickError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2">
                <AlertCircle className="size-4 text-red-400 shrink-0" />
                <p className="text-xs text-red-400">{brickError}</p>
              </div>
            )}

            <div id="mp-payment-brick" className={brickLoading ? "opacity-0 h-0 overflow-hidden" : ""} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full space-y-5">
      {/* Back + title */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild className="size-8 text-muted-foreground flex-shrink-0 mt-0.5">
          <Link href="/dashboard"><ArrowLeft className="size-4" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold leading-tight">{req.title}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-muted-foreground border rounded-md px-2 py-0.5">
              {TYPE_LABELS[req.type] ?? req.type}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_COLORS[req.status]}`}>
              {STATUS_LABELS[req.status]}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" />
              {new Date(req.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* Payment feedback banners */}
      {paymentFeedback === "success" && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-5 py-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="size-7 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
              <Sparkles className="size-4" />
              Pagamento confirmado!
            </p>
            <p className="text-sm text-muted-foreground">
              Pedido aprovado — em breve começo o desenvolvimento.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPaymentFeedback(null)}
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            Fechar
          </button>
        </div>
      )}
      {paymentFeedback === "pending" && (
        <div className="flex items-center gap-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 px-4 py-3">
          <AlertCircle className="size-5 text-yellow-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-400">Pagamento pendente</p>
            <p className="text-xs text-muted-foreground">Assim que confirmado, o pedido será aprovado automaticamente.</p>
          </div>
        </div>
      )}
      {paymentFeedback === "failure" && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3">
          <XCircle className="size-5 text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-400">Pagamento não concluído</p>
            <p className="text-xs text-muted-foreground">Verifique seus dados e tente novamente.</p>
          </div>
        </div>
      )}

      {/* Description */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Descrição</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{req.description}</p>
        </CardContent>
      </Card>

      {/* Image */}
      {req.image_url && (
        <Card>
          <CardContent className="p-3">
            <img src={req.image_url} alt="Referência" className="w-full rounded-lg object-cover max-h-64" />
          </CardContent>
        </Card>
      )}

      {/* Quote & Payment */}
      {hasQuote && (
        <Card className={req.status === "quoted" ? "border-purple-500/40" : isPaid ? "border-emerald-500/30" : "border-green-500/20"}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <DollarSign className="size-4 text-purple-400" />
                <CardTitle className="text-sm font-medium">
                  {req.status === "quoted" ? "Orçamento — ação necessária" : "Orçamento"}
                </CardTitle>
              </div>
              {isPaid && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-md px-2 py-0.5">
                  <CheckCircle2 className="size-3" />
                  Pago
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Valor</p>
                <p className="text-2xl font-bold">{req.budget}</p>
              </div>
              {req.payment_deadline && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <CalendarClock className="size-3" />Vencimento
                  </p>
                  <p className="text-sm font-semibold">
                    {new Date(req.payment_deadline).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
              )}
              {req.delivery_deadline && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Truck className="size-3" />Entrega
                  </p>
                  <p className="text-sm font-semibold">
                    {new Date(req.delivery_deadline).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
              )}
            </div>

            {req.admin_notes && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="size-3" />Mensagem
                  </p>
                  <p className="text-sm leading-relaxed">{req.admin_notes}</p>
                </div>
              </>
            )}

            {/* Payment actions — only when status is quoted */}
            {req.status === "quoted" && (
              <>
                <Separator />
                <div className="flex gap-3">
                  <Button
                    onClick={startPayment}
                    className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <CreditCard className="size-4" />
                    Pagar agora
                  </Button>
                  <Button
                    onClick={decline}
                    disabled={declining}
                    variant="outline"
                    className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    {declining ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                    Recusar
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Client notes */}
      {req.client_notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sua resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{req.client_notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
