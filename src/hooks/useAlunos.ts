import { useAsync } from "./useAsync";
import { alunosService } from "@/services/alunosService";
import { DEFAULT_TENANT_ID } from "@/config/app";

export function useAlunos() {
  return useAsync(
    () => alunosService.list({ tenant_id: DEFAULT_TENANT_ID }),
    [],
  );
}
