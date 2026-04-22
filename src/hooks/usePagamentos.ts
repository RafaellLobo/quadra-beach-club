import { useAsync } from "./useAsync";
import { pagamentosService } from "@/services/pagamentosService";
import { DEFAULT_TENANT_ID } from "@/config/app";

export function usePagamentos() {
  return useAsync(
    () => pagamentosService.list({ tenant_id: DEFAULT_TENANT_ID }),
    [],
  );
}
