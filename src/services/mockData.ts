import type { Aluno, Pagamento, Turma } from "@/types";

const TENANT: string = "tenant_demo_01";

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
const now = () => new Date().toISOString();

export const seedTurmas: Turma[] = [
  {
    id: "turma_01",
    nome: "Iniciante Manhã",
    horario: "Seg/Qua 07h-08h",
    valor_mensalidade: 280,
    tenant_id: TENANT,
    created_at: now(),
  },
  {
    id: "turma_02",
    nome: "Intermediário Noite",
    horario: "Ter/Qui 19h-20h",
    valor_mensalidade: 340,
    tenant_id: TENANT,
    created_at: now(),
  },
  {
    id: "turma_03",
    nome: "Avançado Fim de Semana",
    horario: "Sáb 09h-11h",
    valor_mensalidade: 420,
    tenant_id: TENANT,
    created_at: now(),
  },
  {
    id: "turma_04",
    nome: "Kids",
    horario: "Qua/Sex 17h-18h",
    valor_mensalidade: 220,
    tenant_id: TENANT,
    created_at: now(),
  },
];

const nomes = [
  "Ana Martins",
  "Bruno Carvalho",
  "Carla Souza",
  "Diego Ribeiro",
  "Eduarda Lima",
  "Felipe Andrade",
  "Gabriela Nunes",
  "Henrique Alves",
  "Isabela Rocha",
  "João Pereira",
  "Karen Silva",
  "Lucas Mendes",
  "Mariana Costa",
  "Nicolas Teixeira",
  "Olívia Braga",
  "Paulo Henrique",
  "Queila Duarte",
  "Rafael Moreira",
  "Sofia Castro",
  "Tiago Almeida",
];

export const seedAlunos: Aluno[] = nomes.map((nome, i) => ({
  id: uid("aln"),
  nome,
  email: `${nome.toLowerCase().replace(/\s+/g, ".")}@email.com`,
  telefone: `(11) 9${Math.floor(1000 + Math.random() * 8999)}-${Math.floor(1000 + Math.random() * 8999)}`,
  turma_id:
    i % 7 === 0 ? null : seedTurmas[i % seedTurmas.length]?.id ?? null,
  tenant_id: TENANT,
  created_at: new Date(Date.now() - i * 86400000 * 3).toISOString(),
}));

const buildPagamentos = (): Pagamento[] => {
  const out: Pagamento[] = [];
  const today = new Date();
  seedAlunos.forEach((aluno, idx) => {
    const turma = seedTurmas.find((t) => t.id === aluno.turma_id);
    const valor = turma?.valor_mensalidade ?? 300;

    for (let m = 5; m >= 0; m--) {
      const venc = new Date(today.getFullYear(), today.getMonth() - m, 10);
      let status: Pagamento["status"] = "pago";
      let data_pagamento: string | undefined = new Date(
        venc.getTime() - 2 * 86400000,
      ).toISOString();

      if (m === 0) {
        const r = (idx + m) % 5;
        if (r === 0) {
          status = "pendente";
          data_pagamento = undefined;
        } else if (r === 1) {
          status = "atrasado";
          data_pagamento = undefined;
        }
      }

      out.push({
        id: uid("pag"),
        aluno_id: aluno.id,
        tipo: "mensalidade",
        valor,
        status,
        data_vencimento: venc.toISOString(),
        data_pagamento,
        tenant_id: TENANT,
        created_at: venc.toISOString(),
      });
    }

    if (idx % 4 === 0) {
      out.push({
        id: uid("pag"),
        aluno_id: aluno.id,
        tipo: "avulso",
        valor: 60,
        status: "pago",
        data_vencimento: new Date(
          today.getFullYear(),
          today.getMonth(),
          5,
        ).toISOString(),
        data_pagamento: new Date(
          today.getFullYear(),
          today.getMonth(),
          5,
        ).toISOString(),
        tenant_id: TENANT,
        created_at: now(),
      });
    }
  });
  return out;
};

export const seedPagamentos: Pagamento[] = buildPagamentos();

export const CURRENT_TENANT: string = TENANT;
