import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { LayoutGrid, Folder, Key, Users, ShieldCheck } from "lucide-react";
import { checkIsAdmin } from "@/lib/auth.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Copa 2026" }] }),
  component: AdminLayout,
});

const NAV: { to: string; label: string; icon: typeof LayoutGrid; exact?: boolean }[] = [
  { to: "/admin", label: "Visão geral", icon: LayoutGrid, exact: true },
  { to: "/admin/folders", label: "Pastas & arquivos", icon: Folder },
  { to: "/admin/keys", label: "Chaves", icon: Key },
  { to: "/admin/users", label: "Usuários", icon: Users },
];

function AdminLayout() {
  const { pathname } = useLocation();
  const fn = useServerFn(checkIsAdmin);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { isAdmin } = await fn();
        if (cancelled) return;
        if (!isAdmin) {
          window.location.href = "/dashboard";
        } else {
          setAllowed(true);
        }
      } catch {
        if (!cancelled) window.location.href = "/dashboard";
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fn]);

  // Sem flash: nada na tela até a verificação concluir
  if (allowed !== true) return <div className="min-h-[60vh]" aria-hidden />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-gold">
          <ShieldCheck className="h-3 w-3" /> Painel administrativo
        </div>
      </div>

      <nav className="glass rounded-2xl p-1.5 flex flex-wrap gap-1 overflow-x-auto">
        {NAV.map((n) => {
          const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={[
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all",
                active
                  ? "gradient-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5",
              ].join(" ")}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
