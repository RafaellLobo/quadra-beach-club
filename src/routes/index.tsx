import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/DashboardPage";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/")({
  component: () => (
    <AppShell>
      <DashboardPage />
    </AppShell>
  ),
});
