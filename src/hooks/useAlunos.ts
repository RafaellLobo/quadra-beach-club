import { useAsync } from "./useAsync";
import { alunosService } from "@/services/alunosService";
import { useTenantId } from "@/context/TenantContext";

export function useAlunos() {
  const tenantId = useTenantId();
  return useAsync(() => alunosService.list({ tenant_id: tenantId }), [tenantId]);
}
