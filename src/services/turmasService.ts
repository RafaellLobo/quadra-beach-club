import type { Turma } from "@/types";
import { simulateLatency, type ListParams } from "./apiClient";
import { mockDB } from "./mockData";

export const turmasService = {
  async list({ tenant_id }: ListParams): Promise<Turma[]> {
    await simulateLatency();
    return mockDB.turmas.filter((t) => t.tenant_id === tenant_id);
  },
};
