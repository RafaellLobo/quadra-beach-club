import { useMemo } from "react";
import { useAlunos, usePagamentos, useTurmas } from "@/services/store";
import { PageHeader } from "@/components/common/PageHeader";
import { formatCurrency } from "@/lib/format";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatusBadge } from "@/components/common/StatusBadge";

export function DashboardPage() {
  const alunos = useAlunos();
  const pagamentos = usePagamentos();
  const turmas = useTurmas();

  const { metrics, chartData, ultimos } = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const mesAtual = pagamentos.filter((p) => {
      const d = new Date(p.data_vencimento);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const receitaMes = mesAtual
      .filter((p) => p.status === "pago")
      .reduce((acc, p) => acc + p.valor, 0);

    const inadimplentes = pagamentos.filter(
      (p) => p.status === "atrasado",
    ).length;

    const pendente = pagamentos
      .filter((p) => p.status === "pendente" || p.status === "atrasado")
      .reduce((acc, p) => acc + p.valor, 0);

    // Chart: últimos 6 meses de receita paga
    const months: { label: string; receita: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const ref = new Date(thisYear, thisMonth - i, 1);
      const label = ref
        .toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", "");
      const total = pagamentos
        .filter((p) => {
          const d = new Date(p.data_vencimento);
          return (
            p.status === "pago" &&
            d.getMonth() === ref.getMonth() &&
            d.getFullYear() === ref.getFullYear()
          );
        })
        .reduce((acc, p) => acc + p.valor, 0);
      months.push({ label, receita: total });
    }

    const ultimosPagamentos = [...pagamentos]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 6);

    return {
      metrics: {
        alunos: alunos.length,
        turmas: turmas.length,
        receitaMes,
        inadimplentes,
        pendente,
      },
      chartData: months,
      ultimos: ultimosPagamentos,
    };
  }, [alunos, pagamentos, turmas]);

  const alunoNome = (id: string) =>
    alunos.find((a) => a.id === id)?.nome ?? "—";

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu clube em tempo real."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Alunos ativos"
          value={String(metrics.alunos)}
          delta="+3 este mês"
          positive
        />
        <MetricCard
          icon={Wallet}
          label="Receita do mês"
          value={formatCurrency(metrics.receitaMes)}
          delta="+12,4% vs. mês anterior"
          positive
        />
        <MetricCard
          icon={AlertTriangle}
          label="Inadimplentes"
          value={String(metrics.inadimplentes)}
          delta={`${formatCurrency(metrics.pendente)} em aberto`}
        />
        <MetricCard
          icon={TrendingUp}
          label="Turmas ativas"
          value={String(metrics.turmas)}
          delta="Todas operando"
          positive
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Receita (últimos 6 meses)</h3>
              <p className="text-xs text-muted-foreground">
                Mensalidades e avulsos pagos
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--primary)"
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
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
                  tickFormatter={(v) => `R$${Math.round(Number(v) / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--muted-foreground)" }}
                  formatter={(v: number) => [formatCurrency(v), "Receita"]}
                />
                <Area
                  type="monotone"
                  dataKey="receita"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Pagamentos recentes</h3>
          <p className="text-xs text-muted-foreground">Últimas movimentações</p>
          <ul className="mt-4 divide-y divide-border">
            {ultimos.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {alunoNome(p.aluno_id)}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {p.tipo}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-sm font-medium tabular-nums">
                    {formatCurrency(p.valor)}
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface MetricProps {
  icon: typeof Users;
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}
function MetricCard({ icon: Icon, label, value, delta, positive }: MetricProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        {delta && (
          <span
            className={`inline-flex items-center gap-1 text-xs ${
              positive ? "text-success" : "text-muted-foreground"
            }`}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
          </span>
        )}
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
      {delta && (
        <div className="mt-3 text-[11px] text-muted-foreground">{delta}</div>
      )}
    </div>
  );
}
