"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useAuth } from "@/components/dashboard/auth-provider";
import { LoginOverlay } from "@/components/dashboard/login-overlay";
import { respondToQuote } from "@/lib/dashboard-data";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import type { Request, RequestStatus } from "@/lib/database.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Loader2, CheckCircle2, XCircle,
  CalendarClock, DollarSign, Truck, MessageSquare, Clock,
} from "lucide-react";

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
  submitted: "Submitted", reviewing: "Under Review", quoted: "Quote Ready",
  approved: "Approved", rejected: "Rejected", in_progress: "In Progress",
  delivered: "Delivered", cancelled: "Cancelled",
};

const TYPE_LABELS: Record<string, string> = {
  feature: "New Feature", bug_fix: "Bug Fix", integration: "Integration", consulting: "Technical Consulting",
};

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const [req, setReq] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!user) return;
    createBrowserSupabase()
      .from("requests")
      .select("*, profiles(id, full_name, email, avatar_url)")
      .eq("id", id)
      .single()
      .then(({ data }) => { if (data) setReq(data as unknown as Request); })
      .finally(() => setLoading(false));
  }, [user, id]);

  async function decide(status: "approved" | "rejected") {
    setActing(true);
    try {
      const updated = await respondToQuote(id, status, notes || undefined);
      setReq(updated);
    } finally {
      setActing(false);
    }
  }

  if (authLoading || loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
  if (!user) return <LoginOverlay />;
  if (!req) return (
    <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-sm">
      Request not found.
    </div>
  );

  const hasQuote = ["quoted", "approved", "in_progress", "delivered"].includes(req.status) && req.budget;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Back + title */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild className="size-8 text-muted-foreground flex-shrink-0 mt-0.5">
          <Link href="/dashboard/requests"><ArrowLeft className="size-4" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold leading-tight">{req.title}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-muted-foreground border rounded-md px-2 py-0.5">
              {TYPE_LABELS[req.type]}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_COLORS[req.status]}`}>
              {STATUS_LABELS[req.status]}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" />
              {new Date(req.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{req.description}</p>
        </CardContent>
      </Card>

      {/* Quote */}
      {hasQuote && (
        <Card className={req.status === "quoted" ? "border-purple-500/40" : "border-green-500/20"}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="size-4 text-purple-400" />
              <CardTitle className="text-sm font-medium">
                {req.status === "quoted" ? "Quote from Afonso — action required" : "Quote"}
              </CardTitle>
            </div>
            {req.status === "quoted" && (
              <CardDescription>Review the details below and approve or decline.</CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Budget</p>
                <p className="text-2xl font-bold">{req.budget}</p>
              </div>
              {req.payment_deadline && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <CalendarClock className="size-3" />Payment by
                  </p>
                  <p className="text-sm font-semibold">
                    {new Date(req.payment_deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              )}
              {req.delivery_deadline && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Truck className="size-3" />Delivery by
                  </p>
                  <p className="text-sm font-semibold">
                    {new Date(req.delivery_deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              )}
            </div>

            {req.admin_notes && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="size-3" />Note from Afonso
                  </p>
                  <p className="text-sm leading-relaxed">{req.admin_notes}</p>
                </div>
              </>
            )}

            {req.status === "quoted" && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Textarea
                    placeholder="Optional message before responding..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={() => decide("approved")}
                      disabled={acting}
                      className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {acting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                      Approve & Move Forward
                    </Button>
                    <Button
                      onClick={() => decide("rejected")}
                      disabled={acting}
                      variant="outline"
                      className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="size-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Client notes (after decision) */}
      {req.client_notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Your response</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{req.client_notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
