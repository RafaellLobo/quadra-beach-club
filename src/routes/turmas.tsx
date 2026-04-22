import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { TurmasPage } from "@/pages/TurmasPage";

export const Route = createFileRoute("/turmas")({
  component: () => (
    <AppShell>
      <TurmasPage />
    </AppShell>
  ),
});
