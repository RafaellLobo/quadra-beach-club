import { useMemo } from "react";
import { Users, CalendarRange, TrendingUp, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlunos } from "@/hooks/useAlunos";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useTurmas } from "@/hooks/useTurmas";
import { formatCurrency, monthLabel } from "@/lib/format";
import type { Pagamento } from "@/types";

export function DashboardPage() {
  const alunos = useAlunos();
  const turmas = useTurmas();
  const pagamentos = usePagamentos();

  const loading = alunos.loading || turmas.loading || pagamentos.loading;
  const error = alunos.error ?? turmas.error ?? pagamentos.error;
  const pags = pagamentos.data ?? [];

  const retryAll = async () => {
    await Promise.all([alunos.refetch(), turmas.refetch(), pagamentos.refetch()]);
  };

  const { receitaPrevista, receitaRecebida, receitaPendente, receitaAtrasada } =
    useMemo(() => {
      let prevista = 0;
      let recebida = 0;
      let pendente = 0;
      let atrasada = 0;
      for (const p of pags) {
        prevista += p.valor;
        if (p.status === "pago") recebida += p.valor;
        else if (p.status === "pendente") pendente += p.valor;
        else if (p.status === "atrasado") atrasada += p.valor;
      }
      return {
        receitaPrevista: prevista,
        receitaRecebida: recebida,
        receitaPendente: pendente,
        receitaAtrasada: atrasada,
      };
    }, [pags]);

  const chartData = useMemo(() => buildMonthlyChart(pags), [pags]);

  const taxaRecebimento =
    receitaPrevista > 0 ? Math.round((receitaRecebida / receitaPrevista) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral do desempenho do seu clube."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Total de Alunos"
          value={alunos.data?.length ?? 0}
          hint="Alunos ativos cadastrados"
          loading={loading}
        />
        <MetricCard
          icon={CalendarRange}
          label="Turmas Ativas"
          value={turmas.data?.length ?? 0}
          hint="Turmas em operação"
          loading={loading}
        />
        <MetricCard
          icon={TrendingUp}
          label="Receita Prevista"
          value={formatCurrency(receitaPrevista)}
          hint="Total faturável no período"
          loading={loading}
        />
        <MetricCard
          icon={Wallet}
          label="Receita Recebida"
          value={formatCurrency(receitaRecebida)}
          hint={`${taxaRecebimento}% do previsto`}
          trend={{
            value: `${taxaRecebimento}% taxa de recebimento`,
            direction: taxaRecebimento >= 70 ? "up" : taxaRecebimento >= 40 ? "neutral" : "down",
          }}
          loading={loading}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-1 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Receita por mês</CardTitle>
            <CardDescription>
              Comparativo entre valores recebidos, pendentes e atrasados.
            </CardDescription>
          </div>
          <ChartLegend />
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="h-72 w-full animate-pulse rounded-md bg-muted/60" />
          ) : chartData.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
              Sem pagamentos registrados ainda.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={6} barCategoryGap={24}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${v}`
                    }
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "var(--popover-foreground)",
                    }}
                    formatter={(value, name) => [
                      formatCurrency(Number(value ?? 0)),
                      labelForKey(String(name)),
                    ]}
                  />
                  <Bar dataKey="recebido" fill="var(--success)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pendente" fill="var(--warning)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="atrasado" fill="var(--destructive)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryRow
          label="Recebido"
          value={receitaRecebida}
          accent="var(--success)"
        />
        <SummaryRow
          label="Pendente"
          value={receitaPendente}
          accent="var(--warning)"
        />
        <SummaryRow
          label="Atrasado"
          value={receitaAtrasada}
          accent="var(--destructive)"
        />
      </div>
    </div>
  );
}

function labelForKey(key: string) {
  if (key === "recebido") return "Recebido";
  if (key === "pendente") return "Pendente";
  if (key === "atrasado") return "Atrasado";
  return key;
}

function ChartLegend() {
  const items = [
    { label: "Recebido", color: "var(--success)" },
    { label: "Pendente", color: "var(--warning)" },
    { label: "Atrasado", color: "var(--destructive)" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-4">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: i.color }}
          />
          {i.label}
        </div>
      ))}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <span className="h-8 w-1 rounded-full" style={{ backgroundColor: accent }} />
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{formatCurrency(value)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function buildMonthlyChart(pagamentos: Pagamento[]) {
  // Build 6 month buckets ending at current month
  const now = new Date();
  const buckets: { key: string; date: Date; month: string; recebido: number; pendente: number; atrasado: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      date: d,
      month: monthLabel(d.toISOString()).replace(".", ""),
      recebido: 0,
      pendente: 0,
      atrasado: 0,
    });
  }

  for (const p of pagamentos) {
    const ref = new Date(p.data_vencimento);
    const key = `${ref.getFullYear()}-${ref.getMonth()}`;
    const bucket = buckets.find((b) => b.key === key);
    if (!bucket) continue;
    if (p.status === "pago") bucket.recebido += p.valor;
    else if (p.status === "pendente") bucket.pendente += p.valor;
    else if (p.status === "atrasado") bucket.atrasado += p.valor;
  }

  return buckets;
}
