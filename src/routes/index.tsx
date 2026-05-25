import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Trophy, Sparkles, Shield, Zap, ArrowRight, MapPin, Users, FileText, Printer, Lock } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { TEAMS, STADIUMS, GROUPS, teamsByGroup } from "@/lib/copa-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Copa 2026 — Hub Oficial" },
      { name: "description", content: "48 seleções, 16 estádios, 3 países. A maior Copa do Mundo da história." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
              <Sparkles className="h-3 w-3 text-gold" />
              FIFA World Cup · 11 jun – 19 jul 2026
            </div>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[0.95]">
              A <span className="gradient-text">Copa</span> que vai
              <br /> reescrever a história.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              48 seleções. 16 estádios em 3 países. Uma plataforma única para acompanhar
              tudo — e o conteúdo exclusivo só com sua chave de acesso.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="gradient-primary text-primary-foreground border-0 shadow-glow h-12 px-7">
                <Link to="/login">
                  Acessar plataforma <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-7 glass border-white/15 hover:bg-white/5">
                <a href="#selecoes">Ver seleções</a>
              </Button>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto">
              {[
                { v: "48", l: "Seleções" },
                { v: "16", l: "Estádios" },
                { v: "104", l: "Partidas" },
              ].map((s, i) => (
                <motion.div
                  key={s.l}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="glass rounded-2xl p-5"
                >
                  <div className="text-4xl font-display font-bold gradient-text">{s.v}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-3 gap-5">
          {[
            { icon: Shield, t: "Acesso protegido", d: "Conteúdo liberado apenas com chave de uso único. Criptografia ponta-a-ponta." },
            { icon: Zap, t: "Performance premium", d: "Carregamento instantâneo, animações fluidas, otimizado para qualquer tela." },
            { icon: Trophy, t: "Curadoria oficial", d: "48 seleções, 16 estádios, estatísticas em tempo real e materiais exclusivos." },
          ].map((f, i) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 hover:shadow-glow transition-shadow"
            >
              <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SELECOES */}
      <section id="selecoes" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-gold mb-2 flex items-center gap-2">
                <Users className="h-3 w-3" /> 48 seleções classificadas
              </div>
              <h2 className="text-4xl sm:text-5xl font-display font-bold">Grupos A — L</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {GROUPS.map((g, i) => (
              <motion.div
                key={g}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="glass rounded-2xl p-5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-baseline justify-between mb-3">
                  <span className="font-display text-xl font-bold gradient-text">Grupo {g}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {teamsByGroup(g).length} times
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {teamsByGroup(g).map((t) => (
                    <li key={t.code} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{t.flag}</span>
                        <span>{t.name}</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground">#{t.fifaRank}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ESTADIOS */}
      <section id="estadios" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10">
            <div className="text-xs uppercase tracking-[0.2em] text-gold mb-2 flex items-center gap-2">
              <MapPin className="h-3 w-3" /> 16 estádios · 3 países
            </div>
            <h2 className="text-4xl sm:text-5xl font-display font-bold">Onde a história acontece</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STADIUMS.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-5 relative overflow-hidden group"
              >
                {s.highlight && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-gold text-gold-foreground">
                    {s.highlight}
                  </span>
                )}
                <div className="text-xs text-muted-foreground">
                  {s.country === "USA" ? "🇺🇸 EUA" : s.country === "MEX" ? "🇲🇽 México" : "🇨🇦 Canadá"}
                </div>
                <h3 className="mt-2 font-semibold text-base leading-tight">{s.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.city}</p>
                <div className="mt-3 text-xs text-foreground/80 font-medium">
                  {s.capacity.toLocaleString("pt-BR")} lugares
                </div>
                <div className="absolute inset-x-0 bottom-0 h-0.5 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="glass-strong rounded-3xl p-10 sm:p-14 text-center shadow-elegant relative overflow-hidden">
            <div className="absolute inset-0 gradient-primary opacity-10" />
            <div className="relative">
              <h2 className="text-3xl sm:text-5xl font-display font-bold">
                Tem uma <span className="gradient-text">chave de acesso?</span>
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Entre com sua conta Google, insira a chave recebida por email e desbloqueie
                seu conteúdo exclusivo da Copa 2026.
              </p>
              <Button asChild size="lg" className="mt-8 gradient-primary text-primary-foreground border-0 shadow-glow h-12 px-8">
                <Link to="/login">Entrar agora <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// Also export the teams list for convenience
export { TEAMS };
