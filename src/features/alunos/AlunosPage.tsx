import { useMemo, useState } from "react";
import {
  useAlunos,
  useTurmas,
  createAluno,
  updateAluno,
  deleteAluno,
} from "@/services/store";
import type { Aluno } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate } from "@/lib/format";

export function AlunosPage() {
  const alunos = useAlunos();
  const turmas = useTurmas();

  const [query, setQuery] = useState("");
  const [turmaFilter, setTurmaFilter] = useState<string>("todas");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Aluno | null>(null);

  const filtered = useMemo(() => {
    return alunos.filter((a) => {
      const matchQ = a.nome.toLowerCase().includes(query.toLowerCase().trim());
      const matchT =
        turmaFilter === "todas"
          ? true
          : turmaFilter === "sem"
            ? a.turma_id === null
            : a.turma_id === turmaFilter;
      return matchQ && matchT;
    });
  }, [alunos, query, turmaFilter]);

  const turmaNome = (id: string | null) =>
    id ? turmas.find((t) => t.id === id)?.nome ?? "—" : "Sem turma";

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (a: Aluno) => {
    setEditing(a);
    setOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Alunos"
        description="Gerencie os alunos do seu clube."
        actions={
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo aluno
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          placeholder="Buscar por nome..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={turmaFilter} onValueChange={setTurmaFilter}>
          <SelectTrigger className="w-full md:w-56">
            <SelectValue placeholder="Filtrar por turma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as turmas</SelectItem>
            <SelectItem value="sem">Sem turma</SelectItem>
            {turmas.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto text-xs text-muted-foreground">
          {filtered.length} de {alunos.length} alunos
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Users}
              title="Nenhum aluno encontrado"
              description="Ajuste os filtros ou cadastre um novo aluno."
              action={
                <Button onClick={openNew} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> Cadastrar aluno
                </Button>
              }
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Turma</th>
                <th className="px-4 py-3 font-medium">Desde</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase">
                        {a.nome
                          .split(" ")
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div className="font-medium">{a.nome}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div>{a.email ?? "—"}</div>
                    <div className="text-xs">{a.telefone ?? ""}</div>
                  </td>
                  <td className="px-4 py-3">
                    {a.turma_id ? (
                      <span className="inline-flex rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs">
                        {turmaNome(a.turma_id)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Sem turma
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(a.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(a)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Remover ${a.nome}?`)) deleteAluno(a.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AlunoDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        turmas={turmas}
      />
    </div>
  );
}

interface DialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Aluno | null;
  turmas: ReturnType<typeof useTurmas>;
}

function AlunoDialog({ open, onOpenChange, editing, turmas }: DialogProps) {
  const [nome, setNome] = useState(editing?.nome ?? "");
  const [email, setEmail] = useState(editing?.email ?? "");
  const [telefone, setTelefone] = useState(editing?.telefone ?? "");
  const [turmaId, setTurmaId] = useState<string>(editing?.turma_id ?? "none");

  // Reset fields when dialog opens
  useMemo(() => {
    if (open) {
      setNome(editing?.nome ?? "");
      setEmail(editing?.email ?? "");
      setTelefone(editing?.telefone ?? "");
      setTurmaId(editing?.turma_id ?? "none");
    }
  }, [open, editing]);

  const save = () => {
    if (!nome.trim()) return;
    const payload = {
      nome: nome.trim(),
      email: email.trim() || undefined,
      telefone: telefone.trim() || undefined,
      turma_id: turmaId === "none" ? null : turmaId,
    };
    if (editing) {
      updateAluno(editing.id, payload);
    } else {
      createAluno(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar aluno" : "Novo aluno"}</DialogTitle>
          <DialogDescription>
            Preencha os dados do aluno. O tenant é aplicado automaticamente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Nome completo</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Telefone</Label>
              <Input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Turma</Label>
            <Select value={turmaId} onValueChange={setTurmaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem turma</SelectItem>
                {turmas.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome} — {t.horario}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save}>
            {editing ? "Salvar alterações" : "Criar aluno"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
