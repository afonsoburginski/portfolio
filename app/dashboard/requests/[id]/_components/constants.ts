import type { RequestStatus } from "@/lib/database.types";

export const STATUS_COLORS: Record<RequestStatus, string> = {
  submitted:   "bg-blue-500/15 text-blue-400 border-blue-500/20",
  reviewing:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  quoted:      "bg-purple-500/15 text-purple-400 border-purple-500/20",
  approved:    "bg-green-500/15 text-green-400 border-green-500/20",
  rejected:    "bg-red-500/15 text-red-400 border-red-500/20",
  in_progress: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  delivered:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  cancelled:   "bg-neutral-500/15 text-neutral-400 border-neutral-500/20",
};

export const STATUS_LABELS: Record<RequestStatus, string> = {
  submitted:   "Enviado",
  reviewing:   "Em análise",
  quoted:      "Orçamento pronto",
  approved:    "Aprovado",
  rejected:    "Recusado",
  in_progress: "Em produção",
  delivered:   "Concluído",
  cancelled:   "Cancelado",
};

export const TYPE_LABELS: Record<string, string> = {
  feature:     "Nova funcionalidade",
  bug_fix:     "Correção de bug",
  integration: "Integração",
  maintenance: "Manutenção",
  redesign:    "Redesign / UI",
  other:       "Outro",
};

export const QUOTE_STATUSES = ["quoted", "approved", "in_progress", "delivered"] as const;
