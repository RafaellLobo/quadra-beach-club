import { LayoutDashboard, Users, Wallet, CalendarRange, type LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const mainNavigation: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/alunos", label: "Alunos", icon: Users },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/turmas", label: "Turmas", icon: CalendarRange },
];
