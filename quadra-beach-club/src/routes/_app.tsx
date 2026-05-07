import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { TenantProvider } from "@/context/TenantContext";

/**
 * Pathless layout route: wraps every child route with the AppShell
 * so individual pages no longer need to import or render the shell.
 *
 * TenantProvider is mounted here so every authenticated page resolves
 * tenant via useTenantId() instead of importing DEFAULT_TENANT_ID.
 */
export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <TenantProvider>
      <AppShell>
        <Outlet />
      </AppShell>
      <Toaster />
    </TenantProvider>
  );
}
