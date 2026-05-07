interface TenantBadgeProps {
  name: string;
  plan?: string;
}

export function TenantBadge({ name, plan = "Plano Pro" }: TenantBadgeProps) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="border-t border-sidebar-border p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold">
          {initials}
        </div>
        <div className="leading-tight">
          <div className="text-sm font-medium">{name}</div>
          <div className="text-[11px] text-muted-foreground">{plan}</div>
        </div>
      </div>
    </div>
  );
}
