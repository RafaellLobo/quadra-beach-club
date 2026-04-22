import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { AlunosPage } from "@/pages/AlunosPage";

export const Route = createFileRoute("/alunos")({
  component: () => (
    <AppShell>
      <AlunosPage />
    </AppShell>
  ),
});
