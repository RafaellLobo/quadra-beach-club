import { createFileRoute } from "@tanstack/react-router";
import { AlunosPage } from "@/pages/AlunosPage";

export const Route = createFileRoute("/_app/alunos")({
  component: AlunosPage,
});
