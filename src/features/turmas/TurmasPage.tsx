import { useMemo, useState, useEffect } from "react";
import {
  useTurmas,
  useAlunos,
  createTurma,
  updateTurma,
  deleteTurma,
} from "@/services/store";
import type { Turma } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, CalendarRange, Users } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { formatCurrency } from "@/lib/format";

export function TurmasPage() {
  const turmas = useTurmas();
  const alunos = useAlunos();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Turma | null>(null);

  const alunosByTurma = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of alunos) {
      if (a.turma_id) map[a.turma_id] = (map[a.turma_id] ?? 0) + 1;
    }
    return map;
  }, [alunos]);

  return (
    <div>
      <PageHeader
        title="Turmas"
        description="Crie e gerencie as turmas do clube."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova turma
          </Button>
        }
      />

      {turmas.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="Nenhuma turma criada"
          description="Cadastre sua primeira turma para começar a organizar os alunos."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Criar turma
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {turmas.map((t) => (
            <div
              key={t.id}
              className="group relative rounded-xl border border-border bg-card p-5 transition hover:border-primary/40"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarRange className="h-5 w-5" />
                </div>
                <div className="flex opacity-0 transition group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditing(t);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Remover a turma "${t.nome}"?`))
                        deleteTurma(t.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <h3 className="mt-4 text-base font-semibold">{t.nome}</h3>
              <p className="text-xs text-muted-foreground">{t.horario}</p>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {alunosByTurma[t.id] ?? 0} alunos
                </div>
                <div className="text-sm font-semibold tabular-nums">
                  {formatCurrency(t.valor_mensalidade)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    /mês
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TurmaDialog open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function TurmaDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Turma | null;
}) {
  const [nome, setNome] = useState("");
  const [horario, setHorario] = useState("");
  const [valor, setValor] = useState("");

  useEffect(() => {
    if (open) {
      setNome(editing?.nome ?? "");
      setHorario(editing?.horario ?? "");
      setValor(editing ? String(editing.valor_mensalidade) : "");
    }
  }, [open, editing]);

  const save = () => {
    if (!nome.trim() || !horario.trim() || !valor) return;
    const payload = {
      nome: nome.trim(),
      horario: horario.trim(),
      valor_mensalidade: Number(valor),
    };
    if (editing) {
      updateTurma(editing.id, payload);
    } else {
      createTurma(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar turma" : "Nova turma"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Nome da turma</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Iniciante Manhã"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Horário</Label>
            <Input
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              placeholder="Ex: Seg/Qua 07h-08h"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Valor da mensalidade (R$)</Label>
            <Input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save}>
            {editing ? "Salvar alterações" : "Criar turma"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
