import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "@/components/ui/sonner";

/**
 * Pathless layout route: wraps every child route with the AppShell
 * so individual pages no longer need to import or render the shell.
 */
export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      <Toaster />
    </>
  );
}
