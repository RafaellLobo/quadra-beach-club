import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar alunos, turmas, pagamentos..."
          className="h-9 border-border bg-muted/40 pl-9"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="Notificações"
          className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  );
}
