import { Trophy, Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-gold" />
          <span className="text-sm text-muted-foreground">
            Copa do Mundo FIFA 2026 · Hub não-oficial
          </span>
        </div>
        <div className="text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-1.5">
          Desenvolvido com <Heart className="h-3 w-3 text-primary fill-primary" /> por
          <span className="font-semibold text-foreground">Danilo Felix</span>
          <span className="opacity-40">·</span>
          <span className="font-mono text-[11px] tracking-wider px-2 py-0.5 rounded-full glass text-gold">
            by_wjs
          </span>
          <span className="opacity-50">— Todos os direitos reservados</span>
        </div>
      </div>
    </footer>
  );
}
