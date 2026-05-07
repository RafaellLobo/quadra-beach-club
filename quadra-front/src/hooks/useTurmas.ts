import { useCallback } from "react";
import { useAsync } from "./useAsync";
import { turmasService, type TurmaInput } from "@/services/turmasService";
import { useTenantId } from "@/context/TenantContext";
import type { Turma } from "@/types";

export interface UseTurmasResult {
  data: Turma[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  create: (input: Omit<TurmaInput, "tenant_id">) => Promise<Turma>;
  update: (id: string, input: Omit<TurmaInput, "tenant_id">) => Promise<Turma | null>;
  remove: (id: string) => Promise<boolean>;
}

/**
 * Reads use the shared useAsync contract; mutations are thin wrappers
 * that refetch on success to stay aligned with server truth (avoids the
 * stale-closure / ordering drift of manual setData patches).
 */
export function useTurmas(): UseTurmasResult {
  const tenantId = useTenantId();
  const { data, loading, error, refetch } = useAsync(
    () => turmasService.list({ tenant_id: tenantId }),
    [tenantId],
  );

  const create = useCallback(
    async (input: Omit<TurmaInput, "tenant_id">) => {
      const nova = await turmasService.create({ ...input, tenant_id: tenantId });
      await refetch();
      return nova;
    },
    [tenantId, refetch],
  );

  const update = useCallback(
    async (id: string, input: Omit<TurmaInput, "tenant_id">) => {
      const updated = await turmasService.update(id, input);
      await refetch();
      return updated;
    },
    [refetch],
  );

  const remove = useCallback(
    async (id: string) => {
      const ok = await turmasService.remove(id);
      if (ok) await refetch();
      return ok;
    },
    [refetch],
  );

  return { data, loading, error, refetch, create, update, remove };
}
