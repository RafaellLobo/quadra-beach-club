import { Link, useRouterState } from "@tanstack/react-router";
import { Brand } from "./Brand";
import { TenantBadge } from "./TenantBadge";
import { mainNavigation } from "@/config/navigation";

export function Sidebar() {
  const { location } = useRouterState();
  const path = location.pathname;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <Brand />

      <nav className="flex-1 space-y-1 p-3">
        {mainNavigation.map((item) => {
          const active = item.exact
            ? path === item.to
            : path.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to as "/"}
              className={[
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <TenantBadge name="Arena Rio" />
    </aside>
  );
}
