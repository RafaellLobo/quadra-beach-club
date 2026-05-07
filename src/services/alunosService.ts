import type { Aluno } from "@/types";
import { maybeFail, simulateLatency, type ListParams } from "./apiClient";
import { mockDB } from "./mockData";

export const alunosService = {
  async list({ tenant_id }: ListParams): Promise<Aluno[]> {
    await simulateLatency();
    maybeFail("alunos.list");
    return mockDB.alunos.filter((a) => a.tenant_id === tenant_id);
  },

  async getById(id: string): Promise<Aluno | null> {
    await simulateLatency();
    maybeFail("alunos.getById");
    return mockDB.alunos.find((a) => a.id === id) ?? null;
  },
};
