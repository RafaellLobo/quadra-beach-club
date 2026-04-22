import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { FinanceiroPage } from "@/pages/FinanceiroPage";

export const Route = createFileRoute("/financeiro")({
  component: () => (
    <AppShell>
      <FinanceiroPage />
    </AppShell>
  ),
});
