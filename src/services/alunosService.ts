import type { Aluno } from "@/types";
import { simulateLatency, type ListParams } from "./apiClient";
import { mockDB } from "./mockData";

export const alunosService = {
  async list({ tenant_id }: ListParams): Promise<Aluno[]> {
    await simulateLatency();
    return mockDB.alunos.filter((a) => a.tenant_id === tenant_id);
  },

  async getById(id: string): Promise<Aluno | null> {
    await simulateLatency();
    return mockDB.alunos.find((a) => a.id === id) ?? null;
  },
};
