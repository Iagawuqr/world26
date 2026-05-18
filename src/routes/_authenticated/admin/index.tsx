import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminStats } from "@/lib/stats.functions";
import { Users, Folder, FileText, Key, Download, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const fn = useServerFn(adminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn() });

  const items = [
    { icon: Users, label: "Usuários", value: data?.totals.users },
    { icon: Folder, label: "Pastas", value: data?.totals.folders },
    { icon: FileText, label: "Arquivos", value: data?.totals.files },
    { icon: Key, label: "Chaves geradas", value: data?.totals.keys },
    { icon: CheckCheck, label: "Chaves resgatadas", value: data?.totals.redeemed },
    { icon: Download, label: "Downloads", value: data?.totals.downloads },
  ];

  const max = Math.max(1, ...((data?.series ?? []).map((s) => s.downloads)));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((it) => (
          <div key={it.label} className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <it.icon className="h-3.5 w-3.5" />
              <span className="text-[10px] uppercase tracking-wider">{it.label}</span>
            </div>
            <div className="mt-2 text-2xl font-display font-bold gradient-text">
              {isLoading ? "·" : it.value ?? 0}
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold">Downloads — últimos 7 dias</h3>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            em tempo real
          </span>
        </div>
        <div className="flex items-end gap-2 h-40">
          {(data?.series ?? Array.from({ length: 7 })).map((s: any, i) => {
            const v = s?.downloads ?? 0;
            const h = (v / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md gradient-primary shadow-glow transition-all"
                  style={{ height: `${Math.max(4, h)}%` }}
                  title={`${v} downloads`}
                />
                <div className="text-[10px] text-muted-foreground">
                  {s?.date?.slice(5) ?? ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
