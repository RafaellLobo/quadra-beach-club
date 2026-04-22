import { useCallback, useEffect, useState } from "react";
import {
  pagamentosService,
  type RegistrarPagamentoInput,
} from "@/services/pagamentosService";
import { DEFAULT_TENANT_ID } from "@/config/app";
import type { Pagamento } from "@/types";

export interface UsePagamentosResult {
  data: Pagamento[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  registrar: (
    input: Omit<RegistrarPagamentoInput, "tenant_id">,
  ) => Promise<Pagamento>;
  marcarComoPago: (id: string) => Promise<void>;
}

export function usePagamentos(): UsePagamentosResult {
  const [data, setData] = useState<Pagamento[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await pagamentosService.list({
        tenant_id: DEFAULT_TENANT_ID,
      });
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const registrar = useCallback(
    async (input: Omit<RegistrarPagamentoInput, "tenant_id">) => {
      const novo = await pagamentosService.registrar({
        ...input,
        tenant_id: DEFAULT_TENANT_ID,
      });
      setData((prev) => (prev ? [novo, ...prev] : [novo]));
      return novo;
    },
    [],
  );

  const marcarComoPago = useCallback(async (id: string) => {
    const updated = await pagamentosService.marcarComoPago(id);
    if (updated) {
      setData((prev) =>
        prev ? prev.map((p) => (p.id === id ? updated : p)) : prev,
      );
    }
  }, []);

  return { data, loading, error, refetch: load, registrar, marcarComoPago };
}
