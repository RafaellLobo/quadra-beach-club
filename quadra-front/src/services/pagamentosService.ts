import type { Pagamento, PagamentoStatus, PagamentoTipo } from "@/types";
import { maybeFail, simulateLatency, type ListParams } from "./apiClient";
import { mockDB } from "./mockData";

export interface RegistrarPagamentoInput {
  aluno_id: string;
  tipo: PagamentoTipo;
  valor: number;
  data_vencimento: string;
  status: PagamentoStatus;
  tenant_id: string;
}

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

export const pagamentosService = {
  async list({ tenant_id }: ListParams): Promise<Pagamento[]> {
    await simulateLatency();
    maybeFail("pagamentos.list");
    return mockDB.pagamentos.filter((p) => p.tenant_id === tenant_id);
  },

  async registrar(input: RegistrarPagamentoInput): Promise<Pagamento> {
    await simulateLatency();
    const novo: Pagamento = {
      id: uid("pag"),
      aluno_id: input.aluno_id,
      tipo: input.tipo,
      valor: input.valor,
      status: input.status,
      data_vencimento: input.data_vencimento,
      data_pagamento: input.status === "pago" ? new Date().toISOString() : undefined,
      tenant_id: input.tenant_id,
      created_at: new Date().toISOString(),
    };
    mockDB.pagamentos.unshift(novo);
    return novo;
  },

  async marcarComoPago(id: string): Promise<Pagamento | null> {
    await simulateLatency();
    const p = mockDB.pagamentos.find((x) => x.id === id);
    if (!p) return null;
    p.status = "pago";
    p.data_pagamento = new Date().toISOString();
    return p;
  },
};
