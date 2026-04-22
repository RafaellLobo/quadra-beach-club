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
