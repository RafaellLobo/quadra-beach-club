import type { PagamentoStatus } from "@/types";

const map: Record<
  PagamentoStatus,
  { label: string; className: string }
> = {
  pago: {
    label: "Pago",
    className:
      "bg-success/15 text-success border border-success/25",
  },
  pendente: {
    label: "Pendente",
    className:
      "bg-warning/15 text-warning border border-warning/25",
  },
  atrasado: {
    label: "Atrasado",
    className:
      "bg-destructive/15 text-destructive border border-destructive/25",
  },
};

export function StatusBadge({ status }: { status: PagamentoStatus }) {
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}
