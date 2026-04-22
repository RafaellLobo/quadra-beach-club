import { PageHeader } from "@/components/common/PageHeader";

export function TurmasPage() {
  return (
    <div>
      <PageHeader
        title="Turmas"
        description="Gestão das turmas do clube."
      />
      <div className="rounded-xl border border-border bg-card p-10 text-sm text-muted-foreground">
        Em breve: CRUD de turmas.
      </div>
    </div>
  );
}
