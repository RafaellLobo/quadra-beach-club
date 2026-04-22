import { useMemo, useState } from "react";
import {
  CircleDollarSign,
  Clock,
  AlertTriangle,
  Wallet,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { FilterSelect } from "@/components/common/FilterSelect";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAlunos } from "@/hooks/useAlunos";
import { usePagamentos } from "@/hooks/usePagamentos";
import { formatCurrency, formatDate } from "@/lib/format";
import type {
  Aluno,
  Pagamento,
  PagamentoStatus,
  PagamentoTipo,
} from "@/types";

interface PagamentoRow extends Pagamento {
  alunoNome: string;
}

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function FinanceiroPage() {
  const alunos = useAlunos();
  const pagamentos = usePagamentos();

  const now = new Date();
  const [mes, setMes] = useState<string>(String(now.getMonth()));
  const [ano, setAno] = useState<string>(String(now.getFullYear()));
  const [tipo, setTipo] = useState<string>("todos");
  const [modalOpen, setModalOpen] = useState(false);

  const loading = alunos.loading || pagamentos.loading;

  const alunosById = useMemo(() => {
    const map = new Map<string, Aluno>();
    (alunos.data ?? []).forEach((a) => map.set(a.id, a));
    return map;
  }, [alunos.data]);

  const anosDisponiveis = useMemo(() => {
    const set = new Set<number>([now.getFullYear()]);
    (pagamentos.data ?? []).forEach((p) =>
      set.add(new Date(p.data_vencimento).getFullYear()),
    );
    return Array.from(set).sort((a, b) => b - a);
  }, [pagamentos.data, now]);

  const rows: PagamentoRow[] = useMemo(() => {
    const mesNum = mes === "todos" ? null : Number(mes);
    const anoNum = Number(ano);
    return (pagamentos.data ?? [])
      .filter((p) => {
        const d = new Date(p.data_vencimento);
        if (d.getFullYear() !== anoNum) return false;
        if (mesNum !== null && d.getMonth() !== mesNum) return false;
        if (tipo !== "todos" && p.tipo !== tipo) return false;
        return true;
      })
      .map((p) => ({
        ...p,
        alunoNome: alunosById.get(p.aluno_id)?.nome ?? "—",
      }))
      .sort(
        (a, b) =>
          new Date(b.data_vencimento).getTime() -
          new Date(a.data_vencimento).getTime(),
      );
  }, [pagamentos.data, alunosById, mes, ano, tipo]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, p) => {
        acc.total += p.valor;
        if (p.status === "pago") acc.recebido += p.valor;
        else if (p.status === "pendente") acc.pendente += p.valor;
        else if (p.status === "atrasado") acc.atrasado += p.valor;
        return acc;
      },
      { total: 0, recebido: 0, pendente: 0, atrasado: 0 },
    );
  }, [rows]);

  const mesOptions = [
    { value: "todos", label: "Todos os meses" },
    ...MESES.map((label, i) => ({ value: String(i), label })),
  ];
  const anoOptions = anosDisponiveis.map((y) => ({
    value: String(y),
    label: String(y),
  }));
  const tipoOptions = [
    { value: "todos", label: "Todos os tipos" },
    { value: "mensalidade", label: "Mensalidade" },
    { value: "avulso", label: "Avulso" },
  ];

  const columns: DataTableColumn<PagamentoRow>[] = [
    {
      key: "aluno",
      header: "Aluno",
      cell: (row) => (
        <span className="font-medium text-foreground">{row.alunoNome}</span>
      ),
    },
    {
      key: "tipo",
      header: "Tipo",
      cell: (row) => (
        <span className="capitalize text-muted-foreground">{row.tipo}</span>
      ),
    },
    {
      key: "vencimento",
      header: "Vencimento",
      cell: (row) => (
        <span className="text-muted-foreground">
          {formatDate(row.data_vencimento)}
        </span>
      ),
    },
    {
      key: "valor",
      header: "Valor",
      align: "right",
      cell: (row) => (
        <span className="font-medium tabular-nums">
          {formatCurrency(row.valor)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      cell: (row) => (
        <div className="flex justify-center">
          <StatusBadge status={row.status} />
        </div>
      ),
    },
    {
      key: "acoes",
      header: "",
      align: "right",
      cell: (row) =>
        row.status === "pago" ? (
          <span className="text-xs text-muted-foreground">
            {row.data_pagamento ? formatDate(row.data_pagamento) : "—"}
          </span>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 text-xs"
            onClick={async () => {
              await pagamentos.marcarComoPago(row.id);
              toast.success("Pagamento registrado como pago.");
            }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Dar baixa
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Financeiro"
        description="Acompanhe mensalidades, pagamentos avulsos e totais por período."
        actions={
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Registrar Pagamento
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total no Período"
          value={formatCurrency(totals.total)}
          icon={Wallet}
          loading={loading}
        />
        <MetricCard
          label="Recebido"
          value={formatCurrency(totals.recebido)}
          icon={CircleDollarSign}
          loading={loading}
        />
        <MetricCard
          label="Pendente"
          value={formatCurrency(totals.pendente)}
          icon={Clock}
          loading={loading}
        />
        <MetricCard
          label="Atrasado"
          value={formatCurrency(totals.atrasado)}
          icon={AlertTriangle}
          loading={loading}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-end">
        <FilterSelect
          value={mes}
          onChange={setMes}
          options={mesOptions}
          label="Mês"
          triggerClassName="min-w-[170px]"
        />
        <FilterSelect
          value={ano}
          onChange={setAno}
          options={anoOptions}
          label="Ano"
          triggerClassName="min-w-[120px]"
        />
        <FilterSelect
          value={tipo}
          onChange={setTipo}
          options={tipoOptions}
          label="Tipo"
          triggerClassName="min-w-[170px]"
        />
        <div className="ml-auto text-xs text-muted-foreground">
          {loading
            ? "Carregando..."
            : `${rows.length} ${rows.length === 1 ? "registro" : "registros"}`}
        </div>
      </div>

      <DataTable<PagamentoRow>
        columns={columns}
        data={rows}
        rowKey={(r) => r.id}
        loading={loading}
        emptyState="Nenhum pagamento para o período selecionado."
      />

      <RegistrarPagamentoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        alunos={alunos.data ?? []}
        onSubmit={async (payload) => {
          await pagamentos.registrar(payload);
          toast.success("Pagamento registrado com sucesso.");
        }}
      />
    </div>
  );
}

interface RegistrarPagamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alunos: Aluno[];
  onSubmit: (input: {
    aluno_id: string;
    tipo: PagamentoTipo;
    valor: number;
    data_vencimento: string;
    status: PagamentoStatus;
  }) => Promise<void>;
}

function RegistrarPagamentoModal({
  open,
  onOpenChange,
  alunos,
  onSubmit,
}: RegistrarPagamentoModalProps) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const [alunoId, setAlunoId] = useState("");
  const [tipo, setTipo] = useState<PagamentoTipo>("mensalidade");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState(todayIso);
  const [status, setStatus] = useState<PagamentoStatus>("pago");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setAlunoId("");
    setTipo("mensalidade");
    setValor("");
    setVencimento(todayIso);
    setStatus("pago");
  };

  const handleSubmit = async () => {
    if (!alunoId) {
      toast.error("Selecione um aluno.");
      return;
    }
    const valorNum = Number(valor);
    if (!valorNum || valorNum <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        aluno_id: alunoId,
        tipo,
        valor: valorNum,
        data_vencimento: new Date(vencimento).toISOString(),
        status,
      });
      reset();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
      title="Registrar Pagamento"
      description="Adicione um novo lançamento financeiro ao período."
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Salvando..." : "Salvar"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="aluno">Aluno</Label>
          <Select value={alunoId} onValueChange={setAlunoId}>
            <SelectTrigger id="aluno">
              <SelectValue placeholder="Selecione o aluno" />
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
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={tipo}
              onValueChange={(v) => setTipo(v as PagamentoTipo)}
            >
              <SelectTrigger id="tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensalidade">Mensalidade</SelectItem>
                <SelectItem value="avulso">Avulso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as PagamentoStatus)}
            >
              <SelectTrigger id="status">
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
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="vencimento">Vencimento</Label>
            <Input
              id="vencimento"
              type="date"
              value={vencimento}
              onChange={(e) => setVencimento(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
