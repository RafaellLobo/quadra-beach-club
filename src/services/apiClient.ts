/**
 * Generic API client abstraction.
 *
 * Today services back onto an in-memory mock. Tomorrow swap the
 * implementation (REST, Supabase, tRPC) without touching hooks or UI.
 *
 * All operations accept tenant_id to stay multitenant-ready.
 */
export interface ListParams {
  tenant_id: string;
}

export type ApiResult<T> = Promise<T>;

export const simulateLatency = (ms = 120) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Dev-only fault injection. Toggle via `localStorage.setItem('mock:failRate', '0.5')`
 * (a value between 0 and 1) to exercise error states across the app.
 * Ignored in production builds.
 */
export function maybeFail(scope = "api"): void {
  if (typeof window === "undefined") return;
  if (import.meta.env.PROD) return;
  const raw = window.localStorage.getItem("mock:failRate");
  const rate = raw ? Number(raw) : 0;
  if (!Number.isFinite(rate) || rate <= 0) return;
  if (Math.random() < rate) {
    throw new Error(`[mock:${scope}] Falha simulada na API.`);
  }
}
