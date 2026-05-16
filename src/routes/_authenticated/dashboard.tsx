import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Key, Download, FileText, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Painel — Copa 2026" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, role } = useAuth();
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;
  const avatar = user?.user_metadata?.avatar_url;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        {avatar ? (
          <img src={avatar} alt="" className="h-14 w-14 rounded-full ring-2 ring-primary/30" />
        ) : (
          <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
            {(name || "U")[0].toUpperCase()}
          </div>
        )}
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Bem-vindo de volta</div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">{name}</h1>
        </div>
        {role === "admin" && (
          <Link to="/admin" className="ml-auto inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-gold glass px-3 py-1.5 rounded-full">
            <ShieldCheck className="h-3 w-3" /> Modo admin
          </Link>
        )}
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={Key} label="Chaves resgatadas" value="0" />
        <StatCard icon={FileText} label="Arquivos disponíveis" value="0" />
        <StatCard icon={Download} label="Downloads realizados" value="0" />
      </div>

      <div className="glass-strong rounded-3xl p-8 shadow-elegant">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Key className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-display font-bold">Resgatar chave de acesso</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Insira a chave de 16 caracteres recebida por email para desbloquear seu conteúdo exclusivo.
            </p>
            <div className="mt-5">
              <p className="text-sm text-muted-foreground italic">
                Em breve: campo de resgate de chave + listagem de pastas desbloqueadas + preview seguro de PDF.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Key; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
      <div className="mt-3 text-3xl font-display font-bold gradient-text">{value}</div>
    </div>
  );
}
