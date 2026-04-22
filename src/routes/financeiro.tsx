import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { FinanceiroPage } from "@/features/financeiro/FinanceiroPage";

export const Route = createFileRoute("/financeiro")({
  component: () => (
    <AppShell>
      <FinanceiroPage />
    </AppShell>
  ),
});
