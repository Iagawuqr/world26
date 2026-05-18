import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, Pause, Play, Power, PowerOff } from "lucide-react";
import { adminListUsers, toggleUserActive, pauseUserDownloads, setUserRole } from "@/lib/users.functions";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const list = useServerFn(adminListUsers);
  const toggle = useServerFn(toggleUserActive);
  const pause = useServerFn(pauseUserDownloads);
  const role = useServerFn(setUserRole);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => list() });

  async function action(fn: () => Promise<any>, msg: string) {
    try {
      await fn();
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-white/5">
          <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="p-4">Usuário</th>
            <th className="p-4 hidden md:table-cell">Cadastro</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {isLoading && (
            <tr>
              <td colSpan={4} className="p-5 text-muted-foreground">
                Carregando...
              </td>
            </tr>
          )}
          {data?.users?.map((u: any) => {
            const isAdmin = u.roles.includes("admin");
            return (
              <tr key={u.id} className="hover:bg-white/[0.02]">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                    ) : (
                      <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {(u.full_name || u.email)[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-medium truncate">{u.full_name || "—"}</div>
                      <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1.5">
                    {isAdmin && (
                      <span className="text-[10px] uppercase tracking-wider bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                        admin
                      </span>
                    )}
                    {!u.is_active && (
                      <span className="text-[10px] uppercase tracking-wider bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
                        desativado
                      </span>
                    )}
                    {u.downloads_paused && (
                      <span className="text-[10px] uppercase tracking-wider bg-muted px-2 py-0.5 rounded-full">
                        downloads pausados
                      </span>
                    )}
                    {u.is_active && !u.downloads_paused && (
                      <span className="text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        ativo
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      title={u.is_active ? "Desativar" : "Ativar"}
                      onClick={() =>
                        action(
                          () => toggle({ data: { userId: u.id, active: !u.is_active } }),
                          u.is_active ? "Usuário desativado" : "Usuário ativado",
                        )
                      }
                      className="p-2 rounded-md hover:bg-white/5 text-muted-foreground hover:text-foreground"
                    >
                      {u.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </button>
                    <button
                      title={u.downloads_paused ? "Retomar downloads" : "Pausar downloads"}
                      onClick={() =>
                        action(
                          () => pause({ data: { userId: u.id, paused: !u.downloads_paused } }),
                          u.downloads_paused ? "Downloads retomados" : "Downloads pausados",
                        )
                      }
                      className="p-2 rounded-md hover:bg-white/5 text-muted-foreground hover:text-foreground"
                    >
                      {u.downloads_paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </button>
                    <button
                      title={isAdmin ? "Remover admin" : "Tornar admin"}
                      onClick={() =>
                        action(
                          () => role({ data: { userId: u.id, makeAdmin: !isAdmin } }),
                          isAdmin ? "Admin removido" : "Promovido a admin",
                        )
                      }
                      className="p-2 rounded-md hover:bg-white/5 text-muted-foreground hover:text-gold"
                    >
                      {isAdmin ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
