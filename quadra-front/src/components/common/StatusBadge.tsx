import * as React from "react";
import { cn } from "@/lib/utils";

export type PaymentStatus = "pago" | "pendente" | "atrasado";
export type StudentStatus = "em_dia" | "pendente" | "atrasado";
export type StatusKind = PaymentStatus | StudentStatus | "ativo" | "inativo";

const STATUS_MAP: Record<StatusKind, { label: string; className: string; dot: string }> = {
  pago: {
    label: "Pago",
    className:
      "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
    dot: "bg-[color:var(--success)]",
  },
  em_dia: {
    label: "Em Dia",
    className:
      "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
    dot: "bg-[color:var(--success)]",
  },
  pendente: {
    label: "Pendente",
    className:
      "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-[color:var(--warning)]/30",
    dot: "bg-[color:var(--warning)]",
  },
  atrasado: {
    label: "Atrasado",
    className: "bg-destructive/15 text-destructive border-destructive/30",
    dot: "bg-destructive",
  },
  ativo: {
    label: "Ativo",
    className: "bg-primary/15 text-primary border-primary/30",
    dot: "bg-primary",
  },
  inativo: {
    label: "Inativo",
    className: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
};

export interface StatusBadgeProps {
  status: StatusKind;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const config = STATUS_MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />}
      {config.label}
    </span>
  );
}
