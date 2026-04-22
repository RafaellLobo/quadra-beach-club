import { useMemo, useState } from "react";
import {
  useAlunos,
  usePagamentos,
  createPagamento,
  marcarComoPago,
} from "@/services/store";
import type { PagamentoStatus, PagamentoTipo } from "@/types";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Plus, CheckCircle2, Wallet } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";

export function FinanceiroPage() {
  const alunos = useAlunos();
  const pagamentos = usePagamentos();

  const [status, setStatus] = useState<string>("todos");
  const [tipo, setTipo] = useState<string>("todos");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const alunoNome = (id: string) =>
    alunos.find((a) => a.id === id)?.nome ?? "—";

  const filtered = useMemo(() => {
    return pagamentos
      .filter((p) => (status === "todos" ? true : p.status === status))
      .filter((p) => (tipo === "todos" ? true : p.tipo === tipo))
      .filter((p) =>
        query.trim()
          ? alunoNome(p.aluno_id)
              .toLowerCase()
              .includes(query.toLowerCase())
          : true,
      )
      .sort(
        (a, b) =>
          new Date(b.data_vencimento).getTime() -
          new Date(a.data_vencimento).getTime(),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagamentos, status, tipo, query, alunos]);

  const totals = useMemo(() => {
    const pago = filtered
      .filter((p) => p.status === "pago")
      .reduce((a, p) => a + p.valor, 0);
    const pendente = filtered
      .filter((p) => p.status === "pendente")
      .reduce((a, p) => a + p.valor, 0);
    const atrasado = filtered
      .filter((p) => p.status === "atrasado")
      .reduce((a, p) => a + p.valor, 0);
    return { pago, pendente, atrasado };
  }, [filtered]);

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Acompanhe mensalidades e registre pagamentos."
        actions={
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Registrar pagamento
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard label="Recebido (filtro)" value={totals.pago} tone="success" />
        <SummaryCard label="Pendente" value={totals.pendente} tone="warning" />
        <SummaryCard
          label="Atrasado"
          value={totals.atrasado}
          tone="destructive"
        />
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          placeholder="Buscar por aluno..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="mensalidade">Mensalidade</SelectItem>
            <SelectItem value="avulso">Avulso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Wallet}
              title="Nenhum pagamento encontrado"
              description="Ajuste os filtros ou registre um novo pagamento."
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Aluno</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Vencimento</th>
                <th className="px-4 py-3 font-medium">Pagamento</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Valor</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3 font-medium">
                    {alunoNome(p.aluno_id)}
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {p.tipo}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(p.data_vencimento)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.data_pagamento ? formatDate(p.data_pagamento) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">
                    {formatCurrency(p.valor)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.status !== "pago" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5"
                        onClick={() => marcarComoPago(p.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Marcar pago
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <RegistrarPagamentoDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "destructive";
}) {
  const map = {
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  } as const;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-2 text-2xl font-semibold tabular-nums ${map[tone]}`}>
        {formatCurrency(value)}
      </div>
    </div>
  );
}

function RegistrarPagamentoDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const alunos = useAlunos();
  const [alunoId, setAlunoId] = useState<string>("");
  const [tipo, setTipo] = useState<PagamentoTipo>("mensalidade");
  const [valor, setValor] = useState<string>("");
  const [vencimento, setVencimento] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [status, setStatus] = useState<PagamentoStatus>("pago");

  const save = () => {
    if (!alunoId || !valor) return;
    createPagamento({
      aluno_id: alunoId,
      tipo,
      valor: Number(valor),
      status,
      data_vencimento: new Date(vencimento).toISOString(),
      data_pagamento:
        status === "pago" ? new Date().toISOString() : undefined,
    });
    onOpenChange(false);
    setAlunoId("");
    setValor("");
    setTipo("mensalidade");
    setStatus("pago");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Aluno</Label>
            <Select value={alunoId} onValueChange={setAlunoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um aluno" />
              </SelectTrigger>
              <SelectContent>
                {alunos.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Tipo</Label>
              <Select
                value={tipo}
                onValueChange={(v) => setTipo(v as PagamentoTipo)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensalidade">Mensalidade</SelectItem>
                  <SelectItem value="avulso">Avulso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as PagamentoStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Vencimento</Label>
              <Input
                type="date"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={!alunoId || !valor}>
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
