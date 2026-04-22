import type { Pagamento } from "@/types";
import { simulateLatency, type ListParams } from "./apiClient";
import { mockDB } from "./mockData";

export const pagamentosService = {
  async list({ tenant_id }: ListParams): Promise<Pagamento[]> {
    await simulateLatency();
    return mockDB.pagamentos.filter((p) => p.tenant_id === tenant_id);
  },
};
