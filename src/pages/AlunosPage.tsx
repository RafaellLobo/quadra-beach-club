import { PageHeader } from "@/components/common/PageHeader";

export function AlunosPage() {
  return (
    <div>
      <PageHeader
        title="Alunos"
        description="Gestão de alunos do clube."
      />
      <div className="rounded-xl border border-border bg-card p-10 text-sm text-muted-foreground">
        Em breve: cadastro e listagem de alunos.
      </div>
    </div>
  );
}
