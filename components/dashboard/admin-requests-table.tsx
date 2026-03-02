"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  TableProvider,
  TableHeader,
  TableHeaderGroup,
  TableHead,
  TableColumnHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/kibo-ui/table";
import type { Request, RequestStatus } from "@/lib/database.types";
import { RequestContextMenu } from "@/components/dashboard/request-context-menu";

const STATUS_LABELS: Record<RequestStatus, string> = {
  submitted: "Enviada", reviewing: "Em análise", quoted: "Orçada",
  approved: "Aprovada", rejected: "Rejeitada", in_progress: "Em progresso",
  delivered: "Concluído", cancelled: "Cancelada",
};

const STATUS_BADGE: Record<RequestStatus, string> = {
  submitted:   "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  reviewing:   "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  quoted:      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700",
  approved:    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
  rejected:    "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  delivered:   "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700",
  cancelled:   "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
};

const TYPE_LABELS: Record<string, string> = {
  feature: "Nova funcionalidade", bug_fix: "Correção de bug", integration: "Integração",
  maintenance: "Manutenção", redesign: "Redesign / UI", other: "Outro"
};

type RequestRow = Request & { clientName?: string };

function toRows(requests: Request[]): RequestRow[] {
  return requests.map((r) => ({
    ...r,
    clientName: (r.profiles as { full_name?: string; email?: string } | undefined)?.full_name
      ?? (r.profiles as { email?: string } | undefined)?.email
      ?? "—",
  }));
}

export function AdminRequestsTable({ requests: initialRequests }: { requests: Request[] }) {
  const router = useRouter();
  const [localRequests, setLocalRequests] = useState<Request[]>(initialRequests);

  useEffect(() => { setLocalRequests(initialRequests); }, [initialRequests]);

  const handleUpdated = useCallback((updated: Request) => {
    setLocalRequests((prev) => prev.map((r) => r.id === updated.id ? { ...r, ...updated } : r));
  }, []);

  const rows = toRows(localRequests);

  const columns: ColumnDef<RequestRow, unknown>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => <TableColumnHeader column={column} title="Título" />,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => <TableColumnHeader column={column} title="Propósito" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {TYPE_LABELS[row.original.type]}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <TableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[row.original.status]}`}>
          {STATUS_LABELS[row.original.status]}
        </span>
      ),
    },
    {
      accessorKey: "clientName",
      header: ({ column }) => <TableColumnHeader column={column} title="Cliente" />,
      cell: ({ row }) => (
        <span className="flex items-center gap-1.5 truncate">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-primary uppercase">
            {(row.original.clientName ?? "—").charAt(0)}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {row.original.clientName}
          </span>
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <TableColumnHeader column={column} title="Criada" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.created_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      accessorKey: "delivery_deadline",
      header: ({ column }) => <TableColumnHeader column={column} title="Entrega" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.delivery_deadline
            ? new Date(row.original.delivery_deadline).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      accessorKey: "budget",
      header: ({ column }) => <TableColumnHeader column={column} title="Orçamento" />,
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.budget ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="rounded-lg border overflow-hidden">
      <TableProvider columns={columns} data={rows}>
        <TableHeader>
          {({ headerGroup }) => (
            <TableHeaderGroup headerGroup={headerGroup}>
              {({ header }) => (
                <TableHead header={header} className="text-muted-foreground text-xs font-medium" />
              )}
            </TableHeaderGroup>
          )}
        </TableHeader>
        <TableBody>
          {({ row }) => {
            const req = (row.original as RequestRow);
            return (
              <RequestContextMenu request={req} onUpdated={handleUpdated}>
                <TableRow
                  row={row}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/dashboard/admin/requests/${req.id}`)}
                >
                  {({ cell }) => <TableCell cell={cell} />}
                </TableRow>
              </RequestContextMenu>
            );
          }}
        </TableBody>
      </TableProvider>
    </div>
  );
}

