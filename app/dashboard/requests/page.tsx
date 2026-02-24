"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/dashboard/auth-provider";
import { LoginOverlay } from "@/components/dashboard/login-overlay";
import { getMyRequests } from "@/lib/dashboard-data";
import type { Request, RequestStatus } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { NewRequestDialog } from "@/components/dashboard/new-request-dialog";
import { PlusCircle, Loader2, ChevronRight, FileText } from "lucide-react";

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
  submitted: "Submitted", reviewing: "Reviewing", quoted: "Quote Ready",
  approved: "Approved", rejected: "Rejected", in_progress: "In Progress",
  delivered: "Delivered", cancelled: "Cancelled",
};

const TYPE_LABELS: Record<string, string> = {
  feature: "Feature", bug_fix: "Bug Fix", integration: "Integration", consulting: "Consulting",
};

const ALL_STATUSES: Array<RequestStatus | "all"> = [
  "all", "submitted", "reviewing", "quoted", "in_progress", "delivered", "rejected",
];

export default function MyRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [newRequestOpen, setNewRequestOpen] = useState(false);

  const refresh = () => getMyRequests().then(setRequests).catch(console.error);

  useEffect(() => {
    if (!user) return;
    refresh().finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
  if (!user) return <LoginOverlay />;

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">My Requests</h1>
          <p className="text-sm text-muted-foreground">{requests.length} total</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setNewRequestOpen(true)}>
          <PlusCircle className="size-4" />
          New
        </Button>
        <NewRequestDialog open={newRequestOpen} onOpenChange={setNewRequestOpen} onSuccess={refresh} />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {ALL_STATUSES.map(s => {
          const count = s === "all" ? requests.length : requests.filter(r => r.status === s).length;
          const active = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                active
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : STATUS_LABELS[s]}
              <span className={`ml-1.5 ${active ? "opacity-60" : "opacity-40"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="flex items-center justify-center size-12 rounded-full bg-muted">
                <FileText className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {filter === "all" ? "No requests yet." : `No ${STATUS_LABELS[filter as RequestStatus].toLowerCase()} requests.`}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Delivery</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(req => (
                  <TableRow
                    key={req.id}
                    className="cursor-pointer"
                    onClick={() => { window.location.href = `/dashboard/requests/${req.id}`; }}
                  >
                    <TableCell className="pl-6 font-medium">
                      <div className="flex items-center gap-2">
                        <span>{req.title}</span>
                        {req.status === "quoted" && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded-md font-semibold animate-pulse">
                            ACTION
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                      {TYPE_LABELS[req.type]}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_COLORS[req.status]}`}>
                        {STATUS_LABELS[req.status]}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(req.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {req.delivery_deadline
                        ? <span className="text-orange-400">{new Date(req.delivery_deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        : <span className="text-muted-foreground/40">—</span>}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-muted-foreground/40" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
