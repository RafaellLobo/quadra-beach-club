import { PageHeader } from "@/components/common/PageHeader";
import { useAlunos } from "@/hooks/useAlunos";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useTurmas } from "@/hooks/useTurmas";
import { Users, Wallet, CalendarRange } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function DashboardPage() {
  const alunos = useAlunos();
  const turmas = useTurmas();
  const pagamentos = usePagamentos();

  const loading = alunos.loading || turmas.loading || pagamentos.loading;

  const receitaMes = (pagamentos.data ?? [])
    .filter((p) => p.status === "pago")
    .reduce((acc, p) => acc + p.valor, 0);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu clube."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          icon={Users}
          label="Alunos"
          value={loading ? "—" : String(alunos.data?.length ?? 0)}
        />
        <MetricCard
          icon={CalendarRange}
          label="Turmas"
          value={loading ? "—" : String(turmas.data?.length ?? 0)}
        />
        <MetricCard
          icon={Wallet}
          label="Receita (pagos)"
          value={loading ? "—" : `R$ ${receitaMes.toFixed(0)}`}
        />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-4 text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
