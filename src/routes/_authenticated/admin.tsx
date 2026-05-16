import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Folder, Key, Users, Mail, BarChart3, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Copa 2026" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { role, loading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (role !== "admin") {
        window.location.href = "/dashboard";
      } else {
        setReady(true);
      }
    }
  }, [role, loading]);

  if (!ready) return <div className="text-sm text-muted-foreground">Verificando permissões...</div>;

  const modules = [
    { icon: Folder, t: "Pastas & Arquivos", d: "Upload, organização e remoção." },
    { icon: Key, t: "Chaves de Acesso", d: "Gerar, listar e revogar chaves." },
    { icon: Mail, t: "Envio de Emails", d: "Disparo em massa com keys." },
    { icon: Users, t: "Usuários", d: "Ativar, pausar, gerenciar." },
    { icon: ShieldCheck, t: "Admins", d: "Adicionar outros administradores." },
    { icon: BarChart3, t: "Estatísticas", d: "Dashboard com gráficos em tempo real." },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-gold mb-2 inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3" /> Painel administrativo
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold">Controle total da plataforma</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Módulos administrativos para gerenciar conteúdo, chaves de acesso e usuários.
          As funcionalidades serão entregues nas próximas etapas.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m) => (
          <div key={m.t} className="glass rounded-2xl p-5 hover:bg-white/5 transition-colors">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <m.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="mt-4 font-semibold">{m.t}</h3>
            <p className="text-sm text-muted-foreground mt-1">{m.d}</p>
            <span className="mt-3 inline-block text-[10px] uppercase tracking-wider text-gold">Em construção</span>
          </div>
        ))}
      </div>

      <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground inline-block">
        ← Voltar ao painel do usuário
      </Link>
    </div>
  );
}
