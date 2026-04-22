import type { Turma } from "@/types";
import { maybeFail, simulateLatency, type ListParams } from "./apiClient";
import { mockDB } from "./mockData";

export interface TurmaInput {
  nome: string;
  horario: string;
  valor_mensalidade: number;
  tenant_id: string;
}

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

export const turmasService = {
  async list({ tenant_id }: ListParams): Promise<Turma[]> {
    await simulateLatency();
    maybeFail("turmas.list");
    return mockDB.turmas.filter((t) => t.tenant_id === tenant_id);
  },

  async create(input: TurmaInput): Promise<Turma> {
    await simulateLatency();
    const nova: Turma = {
      id: uid("turma"),
      nome: input.nome,
      horario: input.horario,
      valor_mensalidade: input.valor_mensalidade,
      tenant_id: input.tenant_id,
      created_at: new Date().toISOString(),
    };
    mockDB.turmas.push(nova);
    return nova;
  },

  async update(
    id: string,
    input: Omit<TurmaInput, "tenant_id">,
  ): Promise<Turma | null> {
    await simulateLatency();
    const t = mockDB.turmas.find((x) => x.id === id);
    if (!t) return null;
    t.nome = input.nome;
    t.horario = input.horario;
    t.valor_mensalidade = input.valor_mensalidade;
    return t;
  },

  async remove(id: string): Promise<boolean> {
    await simulateLatency();
    const idx = mockDB.turmas.findIndex((x) => x.id === id);
    if (idx === -1) return false;
    mockDB.turmas.splice(idx, 1);
    return true;
  },
};
