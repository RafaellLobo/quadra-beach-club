import { Waves } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/config/app";

export function Brand() {
  return (
    <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Waves className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight">{APP_NAME}</div>
        <div className="text-[11px] text-muted-foreground">{APP_TAGLINE}</div>
      </div>
    </div>
  );
}
