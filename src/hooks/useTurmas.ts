import { useCallback, useEffect, useState } from "react";
import { turmasService, type TurmaInput } from "@/services/turmasService";
import { DEFAULT_TENANT_ID } from "@/config/app";
import type { Turma } from "@/types";

export interface UseTurmasResult {
  data: Turma[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  create: (input: Omit<TurmaInput, "tenant_id">) => Promise<Turma>;
  update: (
    id: string,
    input: Omit<TurmaInput, "tenant_id">,
  ) => Promise<Turma | null>;
  remove: (id: string) => Promise<boolean>;
}

export function useTurmas(): UseTurmasResult {
  const [data, setData] = useState<Turma[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await turmasService.list({ tenant_id: DEFAULT_TENANT_ID });
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

  const create = useCallback(
    async (input: Omit<TurmaInput, "tenant_id">) => {
      const nova = await turmasService.create({
        ...input,
        tenant_id: DEFAULT_TENANT_ID,
      });
      setData((prev) => (prev ? [...prev, nova] : [nova]));
      return nova;
    },
    [],
  );

  const update = useCallback(
    async (id: string, input: Omit<TurmaInput, "tenant_id">) => {
      const updated = await turmasService.update(id, input);
      if (updated) {
        setData((prev) =>
          prev ? prev.map((t) => (t.id === id ? updated : t)) : prev,
        );
      }
      return updated;
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    const ok = await turmasService.remove(id);
    if (ok) {
      setData((prev) => (prev ? prev.filter((t) => t.id !== id) : prev));
    }
    return ok;
  }, []);

  return { data, loading, error, refetch: load, create, update, remove };
}
