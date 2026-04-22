import { PageHeader } from "@/components/common/PageHeader";

export function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu clube."
      />
      <div className="rounded-xl border border-border bg-card p-10 text-sm text-muted-foreground">
        Em breve: métricas e gráficos.
      </div>
    </div>
  );
}
