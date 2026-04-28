import { useCallback } from "react";
import { useAsync } from "./useAsync";
import { pagamentosService, type RegistrarPagamentoInput } from "@/services/pagamentosService";
import { useTenantId } from "@/context/TenantContext";
import type { Pagamento } from "@/types";

export interface UsePagamentosResult {
  data: Pagamento[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  registrar: (input: Omit<RegistrarPagamentoInput, "tenant_id">) => Promise<Pagamento>;
  marcarComoPago: (id: string) => Promise<void>;
}

/**
 * Reads use the shared useAsync contract; mutations refetch on success
 * so local state stays consistent with server ordering and derived fields.
 */
export function usePagamentos(): UsePagamentosResult {
  const tenantId = useTenantId();
  const { data, loading, error, refetch } = useAsync(
    () => pagamentosService.list({ tenant_id: tenantId }),
    [tenantId],
  );

  const registrar = useCallback(
    async (input: Omit<RegistrarPagamentoInput, "tenant_id">) => {
      const novo = await pagamentosService.registrar({
        ...input,
        tenant_id: tenantId,
      });
      await refetch();
      return novo;
    },
    [tenantId, refetch],
  );

  const marcarComoPago = useCallback(
    async (id: string) => {
      await pagamentosService.marcarComoPago(id);
      await refetch();
    },
    [refetch],
  );

  return { data, loading, error, refetch, registrar, marcarComoPago };
}
