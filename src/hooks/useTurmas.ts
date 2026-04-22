import { useAsync } from "./useAsync";
import { turmasService } from "@/services/turmasService";
import { DEFAULT_TENANT_ID } from "@/config/app";

export function useTurmas() {
  return useAsync(
    () => turmasService.list({ tenant_id: DEFAULT_TENANT_ID }),
    [],
  );
}
