import { Spinner } from "./Spinner";
import { cn } from "@/lib/utils";

interface Props {
  label?: string;
  className?: string;
  /** Renders a centered block with vertical padding suitable for sections. */
  variant?: "section" | "inline";
}

/**
 * Standardized loading affordance for sections without table/skeleton coverage.
 * Use inside Cards or wrappers when there is no skeleton variant available.
 */
export function LoadingState({
  label = "Carregando...",
  className,
  variant = "section",
}: Props) {
  if (variant === "inline") {
    return <Spinner className={className} label={label} size="sm" />;
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/70 bg-card/40 py-12 px-6 text-center",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
