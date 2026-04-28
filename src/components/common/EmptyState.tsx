import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 py-14 px-6 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-sm font-medium">{title}</div>
      {description && (
        <div className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
