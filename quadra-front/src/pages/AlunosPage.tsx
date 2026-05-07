import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { StatusBadge, type StudentStatus } from "@/components/common/StatusBadge";
import { FilterSelect } from "@/components/common/FilterSelect";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAlunos } from "@/hooks/useAlunos";
import { useTurmas } from "@/hooks/useTurmas";
import { usePagamentos } from "@/hooks/usePagamentos";
import type { Aluno, Pagamento, Turma } from "@/types";

interface AlunoRow extends Aluno {
  turmaNome: string;
  status: StudentStatus;
}

function computeStatus(pagamentos: Pagamento[]): StudentStatus {
  if (pagamentos.length === 0) return "em_dia";
  if (pagamentos.some((p) => p.status === "atrasado")) return "atrasado";
  if (pagamentos.some((p) => p.status === "pendente")) return "pendente";
  return "em_dia";
}

export function AlunosPage() {
  const alunos = useAlunos();
  const turmas = useTurmas();
  const pagamentos = usePagamentos();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [turmaFilter, setTurmaFilter] = useState<string>("todos");

  const loading = alunos.loading || turmas.loading || pagamentos.loading;
  const error = alunos.error ?? turmas.error ?? pagamentos.error;

  const rows: AlunoRow[] = useMemo(() => {
    const turmasById = new Map<string, Turma>((turmas.data ?? []).map((t) => [t.id, t]));
    const pagsByAluno = new Map<string, Pagamento[]>();
    for (const p of pagamentos.data ?? []) {
      const arr = pagsByAluno.get(p.aluno_id) ?? [];
      arr.push(p);
      pagsByAluno.set(p.aluno_id, arr);
    }
    return (alunos.data ?? []).map((a) => ({
      ...a,
      turmaNome: a.turma_id ? (turmasById.get(a.turma_id)?.nome ?? "—") : "Avulso",
      status: computeStatus(pagsByAluno.get(a.id) ?? []),
    }));
  }, [alunos.data, turmas.data, pagamentos.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !r.nome.toLowerCase().includes(q) && !(r.email ?? "").toLowerCase().includes(q)) {
        return false;
      }
      if (statusFilter !== "todos" && r.status !== statusFilter) return false;
      if (turmaFilter !== "todos") {
        if (turmaFilter === "avulso" && r.turma_id) return false;
        if (turmaFilter !== "avulso" && r.turma_id !== turmaFilter) return false;
      }
      return true;
    });
  }, [rows, search, statusFilter, turmaFilter]);

  const turmaOptions = useMemo(
    () => [
      { value: "todos", label: "Todas as turmas" },
      { value: "avulso", label: "Avulso" },
      ...(turmas.data ?? []).map((t) => ({ value: t.id, label: t.nome })),
    ],
    [turmas.data],
  );

  const statusOptions = [
    { value: "todos", label: "Todos os status" },
    { value: "em_dia", label: "Em Dia" },
    { value: "pendente", label: "Pendente" },
    { value: "atrasado", label: "Atrasado" },
  ];

  const columns: DataTableColumn<AlunoRow>[] = [
    {
      key: "nome",
      header: "Nome",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.nome}</span>
          {row.email && <span className="text-xs text-muted-foreground">{row.email}</span>}
        </div>
      ),
    },
    {
      key: "turma",
      header: "Turma",
      cell: (row) =>
        row.turma_id ? (
          <span className="text-foreground">{row.turmaNome}</span>
        ) : (
          <Badge variant="outline" className="border-border/70 text-muted-foreground">
            Avulso
          </Badge>
        ),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (row) => (
        <div className="flex justify-end">
          <StatusBadge status={row.status} />
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="space-y-5">
        <PageHeader title="Alunos" description="Gestão de alunos do clube." />
        <ErrorState
          title="Não foi possível carregar os alunos"
          description={error.message}
          onRetry={async () => {
            await Promise.all([alunos.refetch(), turmas.refetch(), pagamentos.refetch()]);
          }}
        />
      </div>
    );
  }

  const isEmpty = !loading && rows.length === 0;

  return (
    <div className="space-y-5">
      <PageHeader title="Alunos" description="Gerencie os alunos, turmas e status de pagamento." />

      {isEmpty ? (
        <EmptyState
          icon={Users}
          title="Nenhum aluno cadastrado"
          description="Os alunos cadastrados aparecerão aqui."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-end">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="h-9 pl-9"
              />
            </div>
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              label="Status"
              triggerClassName="min-w-[160px]"
            />
            <FilterSelect
              value={turmaFilter}
              onChange={setTurmaFilter}
              options={turmaOptions}
              label="Turma"
              triggerClassName="min-w-[180px]"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {loading
                ? "Carregando..."
                : `${filtered.length} ${filtered.length === 1 ? "aluno" : "alunos"} encontrados`}
            </span>
          </div>

          <DataTable<AlunoRow>
            columns={columns}
            data={filtered}
            rowKey={(r) => r.id}
            loading={loading}
            emptyState="Nenhum aluno corresponde aos filtros."
          />
        </>
      )}
    </div>
  );
}
