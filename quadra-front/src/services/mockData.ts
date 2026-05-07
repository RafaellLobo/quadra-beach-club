import type { Aluno, Pagamento, Turma } from "@/types";
import { DEFAULT_TENANT_ID } from "@/config/app";

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
const now = () => new Date().toISOString();

const turmas: Turma[] = [
  {
    id: "turma_01",
    nome: "Iniciante Manhã",
    horario: "Seg/Qua 07h-08h",
    valor_mensalidade: 280,
    tenant_id: DEFAULT_TENANT_ID,
    created_at: now(),
  },
  {
    id: "turma_02",
    nome: "Intermediário Noite",
    horario: "Ter/Qui 19h-20h",
    valor_mensalidade: 340,
    tenant_id: DEFAULT_TENANT_ID,
    created_at: now(),
  },
  {
    id: "turma_03",
    nome: "Avançado Fim de Semana",
    horario: "Sáb 09h-11h",
    valor_mensalidade: 420,
    tenant_id: DEFAULT_TENANT_ID,
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
];

const alunos: Aluno[] = nomes.map((nome, i) => ({
  id: uid("aln"),
  nome,
  email: `${nome.toLowerCase().replace(/\s+/g, ".")}@email.com`,
  turma_id: turmas[i % turmas.length]?.id ?? null,
  tenant_id: DEFAULT_TENANT_ID,
  created_at: new Date(Date.now() - i * 86400000 * 3).toISOString(),
}));

const pagamentos: Pagamento[] = alunos.flatMap((aluno, idx) => {
  const turma = turmas.find((t) => t.id === aluno.turma_id);
  const valor = turma?.valor_mensalidade ?? 300;
  const status: Pagamento["status"] =
    idx % 4 === 0 ? "atrasado" : idx % 3 === 0 ? "pendente" : "pago";
  return [
    {
      id: uid("pag"),
      aluno_id: aluno.id,
      tipo: "mensalidade",
      valor,
      status,
      data_vencimento: new Date().toISOString(),
      data_pagamento: status === "pago" ? new Date().toISOString() : undefined,
      tenant_id: DEFAULT_TENANT_ID,
      created_at: now(),
    },
  ];
});

export const mockDB = { alunos, turmas, pagamentos };
