import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

/**
 * Inline spinner for buttons, inline actions and small loading affordances.
 * For full-section loading prefer LoadingState or Skeletons inside DataTable.
 */
export function Spinner({ className, size = "md", label }: Props) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-2 text-muted-foreground", className)}
    >
      <Loader2 className={cn("animate-spin", sizeMap[size])} aria-hidden="true" />
      {label && <span className="text-sm">{label}</span>}
      <span className="sr-only">{label ?? "Carregando"}</span>
    </span>
  );
}
