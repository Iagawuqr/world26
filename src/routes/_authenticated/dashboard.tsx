import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Key, Download, FileText, ShieldCheck, Folder as FolderIcon, ArrowRight, Eye } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { myDashboardStats } from "@/lib/stats.functions";
import { listMyFolders } from "@/lib/folders.functions";
import { listFolderFiles } from "@/lib/files.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Painel — Copa 2026" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, role } = useAuth();
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;
  const avatar = user?.user_metadata?.avatar_url;
  const statsFn = useServerFn(myDashboardStats);
  const foldersFn = useServerFn(listMyFolders);
  const stats = useQuery({ queryKey: ["my-stats"], queryFn: () => statsFn() });
  const folders = useQuery({ queryKey: ["my-folders"], queryFn: () => foldersFn() });
  const [openFolder, setOpenFolder] = useState<string | null>(null);

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
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Bem-vindo</div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">{name}</h1>
        </div>
        {role === "admin" && (
          <Link
            to="/admin"
            className="ml-auto inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-95"
          >
            <ShieldCheck className="h-4 w-4" /> Entrar no Admin
          </Link>
        )}
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={Key} label="Chaves resgatadas" value={stats.data?.keysRedeemed ?? 0} />
        <StatCard icon={FileText} label="Arquivos disponíveis" value={stats.data?.filesAvailable ?? 0} />
        <StatCard icon={Download} label="Downloads realizados" value={stats.data?.downloads ?? 0} />
      </div>

      <Link to="/redeem" className="block glass-strong rounded-3xl p-6 sm:p-8 shadow-elegant group hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Key className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-display font-bold">Resgatar chave de acesso</h2>
            <p className="text-sm text-muted-foreground mt-1">Insira a chave de 16 caracteres para desbloquear conteúdo.</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      <div>
        <h2 className="text-lg font-display font-bold mb-3">Minhas pastas</h2>
        {folders.data?.folders?.length === 0 && (
          <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
            Nenhuma pasta desbloqueada ainda. Resgate uma chave acima.
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          {folders.data?.folders?.map((f: any) => (
            <button
              key={f.id}
              onClick={() => setOpenFolder(openFolder === f.id ? null : f.id)}
              className="text-left glass rounded-2xl p-5 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                  <FolderIcon className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{f.name}</div>
                  {f.description && (
                    <div className="text-xs text-muted-foreground truncate">{f.description}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        {openFolder && <FolderContents folderId={openFolder} />}
      </div>
    </div>
  );
}

function FolderContents({ folderId }: { folderId: string }) {
  const fn = useServerFn(listFolderFiles);
  const { data, isLoading } = useQuery({
    queryKey: ["folder-files", folderId],
    queryFn: () => fn({ data: { folderId } }),
  });
  return (
    <div className="mt-4 glass rounded-2xl divide-y divide-white/5">
      {isLoading && <div className="p-5 text-sm text-muted-foreground">Carregando...</div>}
      {data?.files?.map((f: any) => (
        <div key={f.id} className="flex items-center gap-3 p-3">
          <FileText className="h-4 w-4 text-primary" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{f.name}</div>
            <div className="text-xs text-muted-foreground">{(f.size_bytes / 1024).toFixed(0)} KB</div>
          </div>
          <Link
            to="/preview/$id"
            params={{ id: f.id }}
            className="inline-flex items-center gap-1.5 text-xs glass px-3 py-1.5 rounded-md hover:bg-white/5"
          >
            <Eye className="h-3 w-3" /> Visualizar
          </Link>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Key; label: string; value: number }) {
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
