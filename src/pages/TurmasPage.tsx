import { useMemo, useState } from "react";
import { GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTurmas } from "@/hooks/useTurmas";
import { formatCurrency } from "@/lib/format";
import type { Turma } from "@/types";

interface FormState {
  nome: string;
  horario: string;
  valor_mensalidade: string;
}

const EMPTY_FORM: FormState = { nome: "", horario: "", valor_mensalidade: "" };

export function TurmasPage() {
  const { data, loading, error, create, update, remove } = useTurmas();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Turma | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [toDelete, setToDelete] = useState<Turma | null>(null);
  const [deleting, setDeleting] = useState(false);

  const turmas = useMemo(() => data ?? [], [data]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(turma: Turma) {
    setEditing(turma);
    setForm({
      nome: turma.nome,
      horario: turma.horario,
      valor_mensalidade: String(turma.valor_mensalidade),
    });
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nome = form.nome.trim();
    const horario = form.horario.trim();
    const valor = Number(form.valor_mensalidade.replace(",", "."));

    if (!nome || !horario) {
      toast.error("Preencha nome e horário.");
      return;
    }
    if (!Number.isFinite(valor) || valor <= 0) {
      toast.error("Informe um valor de mensalidade válido.");
      return;
    }

    setSubmitting(true);
    try {
      if (editing) {
        await update(editing.id, { nome, horario, valor_mensalidade: valor });
        toast.success("Turma atualizada com sucesso.");
      } else {
        await create({ nome, horario, valor_mensalidade: valor });
        toast.success("Turma criada com sucesso.");
      }
      setFormOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar turma.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await remove(toDelete.id);
      toast.success(`Turma "${toDelete.nome}" excluída.`);
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir.");
    } finally {
      setDeleting(false);
    }
  }

  const columns: DataTableColumn<Turma>[] = [
    {
      key: "nome",
      header: "Nome",
      cell: (row) => (
        <span className="font-medium text-foreground">{row.nome}</span>
      ),
    },
    {
      key: "horario",
      header: "Horário",
      cell: (row) => <span className="text-foreground">{row.horario}</span>,
    },
    {
      key: "valor",
      header: "Mensalidade",
      align: "right",
      cell: (row) => (
        <span className="font-medium text-foreground">
          {formatCurrency(row.valor_mensalidade)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => openEdit(row)}
            aria-label={`Editar ${row.nome}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => setToDelete(row)}
            aria-label={`Excluir ${row.nome}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div>
        <PageHeader title="Turmas" description="Gestão das turmas do clube." />
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          Erro ao carregar turmas: {error.message}
        </div>
      </div>
    );
  }

  const isEmpty = !loading && turmas.length === 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Turmas"
        description="Gerencie as turmas oferecidas pelo clube."
        actions={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Turma
          </Button>
        }
      />

      {isEmpty ? (
        <EmptyState
          icon={GraduationCap}
          title="Nenhuma turma cadastrada"
          description="Crie sua primeira turma para começar a organizar o clube."
          action={
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Turma
            </Button>
          }
        />
      ) : (
        <DataTable<Turma>
          columns={columns}
          data={turmas}
          rowKey={(r) => r.id}
          loading={loading}
          emptyState="Nenhuma turma cadastrada."
        />
      )}

      <Modal
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) {
            setEditing(null);
            setForm(EMPTY_FORM);
          }
        }}
        title={editing ? "Editar Turma" : "Nova Turma"}
        description={
          editing
            ? "Atualize as informações da turma."
            : "Cadastre uma nova turma no clube."
        }
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="turma-form"
              disabled={submitting}
            >
              {submitting
                ? "Salvando..."
                : editing
                  ? "Salvar alterações"
                  : "Criar turma"}
            </Button>
          </>
        }
      >
        <form
          id="turma-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="turma-nome">Nome</Label>
            <Input
              id="turma-nome"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex.: Iniciante Manhã"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="turma-horario">Horário</Label>
            <Input
              id="turma-horario"
              value={form.horario}
              onChange={(e) =>
                setForm((f) => ({ ...f, horario: e.target.value }))
              }
              placeholder="Ex.: Seg/Qua 07h-08h"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="turma-valor">Valor da mensalidade (R$)</Label>
            <Input
              id="turma-valor"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.valor_mensalidade}
              onChange={(e) =>
                setForm((f) => ({ ...f, valor_mensalidade: e.target.value }))
              }
              placeholder="0,00"
            />
          </div>
        </form>
      </Modal>

      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir turma?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete
                ? `A turma "${toDelete.nome}" será removida. Esta ação não pode ser desfeita.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
