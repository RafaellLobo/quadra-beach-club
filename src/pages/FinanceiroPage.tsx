import { PageHeader } from "@/components/common/PageHeader";

export function FinanceiroPage() {
  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Mensalidades e pagamentos."
      />
      <div className="rounded-xl border border-border bg-card p-10 text-sm text-muted-foreground">
        Em breve: controle financeiro.
      </div>
    </div>
  );
}
