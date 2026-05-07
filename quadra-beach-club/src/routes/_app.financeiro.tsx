import { createFileRoute } from "@tanstack/react-router";
import { FinanceiroPage } from "@/pages/FinanceiroPage";

export const Route = createFileRoute("/_app/financeiro")({
  component: FinanceiroPage,
});
