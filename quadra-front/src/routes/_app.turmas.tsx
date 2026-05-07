import { createFileRoute } from "@tanstack/react-router";
import { TurmasPage } from "@/pages/TurmasPage";

export const Route = createFileRoute("/_app/turmas")({
  component: TurmasPage,
});
