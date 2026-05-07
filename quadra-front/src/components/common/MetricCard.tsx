import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  trend?: { value: string; direction: "up" | "down" | "neutral" };
  loading?: boolean;
  className?: string;
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  loading,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              {loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
              ) : (
                <span className="text-2xl font-semibold tracking-tight text-foreground">
                  {value}
                </span>
              )}
            </div>
            {hint && !loading && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
            {trend && !loading && (
              <p
                className={cn(
                  "mt-2 text-xs font-medium",
                  trend.direction === "up" && "text-[color:var(--success)]",
                  trend.direction === "down" && "text-[color:var(--destructive)]",
                  trend.direction === "neutral" && "text-muted-foreground",
                )}
              >
                {trend.value}
              </p>
            )}
          </div>
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
