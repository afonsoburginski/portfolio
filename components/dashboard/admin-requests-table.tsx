"use client";

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

const STATUS_LABELS: Record<RequestStatus, string> = {
  submitted: "Enviada", reviewing: "Em análise", quoted: "Orçada",
  approved: "Aprovada", rejected: "Rejeitada", in_progress: "Em progresso",
  delivered: "Entregue", cancelled: "Cancelada",
};

const TYPE_LABELS: Record<string, string> = {
  feature: "Nova funcionalidade", bug_fix: "Correção de bug",
  integration: "Integração", consulting: "Consultoria técnica",
};

type RequestRow = Request & { clientName?: string };

export function AdminRequestsTable({ requests }: { requests: Request[] }) {
  const router = useRouter();
  const rows: RequestRow[] = requests.map((r) => ({
    ...r,
    clientName: (r.profiles as { full_name?: string; email?: string } | undefined)?.full_name
      ?? (r.profiles as { email?: string } | undefined)?.email
      ?? "—",
  }));

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
        <span className="text-xs font-medium text-muted-foreground">
          {STATUS_LABELS[row.original.status]}
        </span>
      ),
    },
    {
      accessorKey: "clientName",
      header: ({ column }) => <TableColumnHeader column={column} title="Cliente" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground truncate max-w-[120px] block">
          {row.original.clientName}
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
          {({ row }) => (
            <TableRow
              row={row}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => router.push(`/dashboard/admin/requests/${(row.original as RequestRow).id}`)}
            >
              {({ cell }) => <TableCell cell={cell} />}
            </TableRow>
          )}
        </TableBody>
      </TableProvider>
    </div>
  );
}
