import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { useAlunos } from "@/hooks/useAlunos";
import { Users } from "lucide-react";

export function AlunosPage() {
  const { data, loading, error } = useAlunos();

  return (
    <div>
      <PageHeader title="Alunos" description="Gestão de alunos do clube." />

      {loading && (
        <div className="rounded-xl border border-border bg-card p-10 text-sm text-muted-foreground">
          Carregando alunos...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          Erro ao carregar alunos: {error.message}
        </div>
      )}

      {!loading && !error && (data?.length ?? 0) === 0 && (
        <EmptyState
          icon={Users}
          title="Nenhum aluno cadastrado"
          description="Os alunos cadastrados aparecerão aqui."
        />
      )}

      {!loading && !error && (data?.length ?? 0) > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {data!.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3 font-medium">{a.nome}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a.email ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
