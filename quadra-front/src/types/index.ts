export type TenantId = string;

export interface Aluno {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  turma_id: string | null;
  tenant_id: TenantId;
  created_at: string;
}

export interface Turma {
  id: string;
  nome: string;
  horario: string;
  valor_mensalidade: number;
  tenant_id: TenantId;
  created_at: string;
}

export type PagamentoTipo = "mensalidade" | "avulso";
export type PagamentoStatus = "pago" | "pendente" | "atrasado";

export interface Pagamento {
  id: string;
  aluno_id: string;
  tipo: PagamentoTipo;
  valor: number;
  status: PagamentoStatus;
  data_vencimento: string;
  data_pagamento?: string;
  tenant_id: TenantId;
  created_at: string;
}
