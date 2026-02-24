"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/dashboard/auth-provider";
import { getMyRequests, isAdminEmail } from "@/lib/dashboard-data";
import type { Request, RequestStatus } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { NewRequestDialog } from "@/components/dashboard/new-request-dialog";
import {
  PlusCircle, Loader2, ChevronRight, FileText,
  CheckCircle2, AlertCircle, Rocket,
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
  submitted:   "Submitted",
  reviewing:   "Reviewing",
  quoted:      "Quote Ready",
  approved:    "Approved",
  rejected:    "Rejected",
  in_progress: "In Progress",
  delivered:   "Delivered",
  cancelled:   "Cancelled",
};

const TYPE_LABELS: Record<string, string> = {
  feature: "Feature", bug_fix: "Bug Fix", integration: "Integration", consulting: "Consulting",
};

function StatusPill({ status }: { status: RequestStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function RequestsOverview() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const isAdmin = isAdminEmail(user?.email);

  const refresh = () => getMyRequests().then(setRequests).catch(console.error);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const name = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? "there";

  const stats = [
    { label: "Total",        value: requests.length,                                          icon: FileText,     accent: "text-foreground"  },
    { label: "In Progress",  value: requests.filter(r => r.status === "in_progress").length,  icon: Rocket,       accent: "text-orange-400"  },
    { label: "Awaiting You", value: requests.filter(r => r.status === "quoted").length,       icon: AlertCircle,  accent: "text-purple-400"  },
    { label: "Delivered",    value: requests.filter(r => r.status === "delivered").length,    icon: CheckCircle2, accent: "text-emerald-400" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {isAdmin ? "Dashboard" : `Hey, ${name} 👋`}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isAdmin ? "All client requests at a glance." : "Track your feature requests and quotes."}
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setNewRequestOpen(true)}>
          <PlusCircle className="size-4" />
          New Request
        </Button>
        <NewRequestDialog open={newRequestOpen} onOpenChange={setNewRequestOpen} onSuccess={refresh} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <Card key={s.label}>
            <CardHeader className="pb-1 pt-4 px-4 flex-row items-center gap-2 space-y-0">
              <s.icon className={`size-3.5 ${s.accent}`} />
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className={`text-3xl font-bold ${s.accent}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Requests table */}
      <Card>
        <CardHeader className="px-6 py-4 border-b">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {requests.length} request{requests.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="flex items-center justify-center size-12 rounded-full bg-muted">
                <FileText className="size-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">No requests yet</p>
                <p className="text-xs text-muted-foreground mt-1">Submit your first request to get started.</p>
              </div>
              <Button size="sm" className="gap-2" onClick={() => setNewRequestOpen(true)}>
                <PlusCircle className="size-4" />
                Submit Request
              </Button>
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
                {requests.map(req => (
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
                      <StatusPill status={req.status} />
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
                      <ChevronRight className="size-4 text-muted-foreground/50" />
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
