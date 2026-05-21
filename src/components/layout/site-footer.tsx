import { Trophy, Heart, Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-gold" />
          <span className="text-sm text-muted-foreground">
            Copa do Mundo FIFA 2026 · Hub não-oficial
          </span>
        </div>

        {/* Bloco de créditos em destaque */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/40 via-gold/40 to-primary/40 blur-lg opacity-60" />
          <div className="relative glass-strong rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-primary fill-primary" />
              <span className="text-muted-foreground">Desenvolvido por</span>
              <span className="font-display font-bold text-foreground">Danilo Felix</span>
            </div>
            <span className="hidden sm:block h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="font-mono text-base font-bold tracking-[0.25em] bg-gradient-to-r from-gold via-primary to-gold bg-clip-text text-transparent">
                by_wjs
              </span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/60 tracking-wider uppercase">
          © 2026 · Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
