import { createContext, useContext, useMemo, type ReactNode } from "react";
import { DEFAULT_TENANT_ID } from "@/config/app";

/**
 * Single source of truth for the current tenant_id.
 *
 * Today we resolve to DEFAULT_TENANT_ID; once auth lands, the provider
 * derives tenant from the session (JWT claim, profile lookup, etc.) and
 * no consumer needs to change.
 *
 * Hooks/services should read tenant via useTenantId() instead of
 * importing DEFAULT_TENANT_ID directly.
 */
interface TenantContextValue {
  tenantId: string;
}

const TenantContext = createContext<TenantContextValue | null>(null);

interface TenantProviderProps {
  children: ReactNode;
  tenantId?: string;
}

export function TenantProvider({ children, tenantId }: TenantProviderProps) {
  const value = useMemo<TenantContextValue>(
    () => ({ tenantId: tenantId ?? DEFAULT_TENANT_ID }),
    [tenantId],
  );
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenantId(): string {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    // Fail-soft: keep app rendering even if a route is mounted outside the
    // provider during early bootstrap. Logged so it's caught in dev.
    if (typeof console !== "undefined") {
      console.warn(
        "[TenantContext] useTenantId() called outside TenantProvider — falling back to default.",
      );
    }
    return DEFAULT_TENANT_ID;
  }
  return ctx.tenantId;
}
