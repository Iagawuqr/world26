import { Link } from "@tanstack/react-router";
import { Trophy, LayoutDashboard, LogIn, LogOut, ShieldCheck, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { user, role, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-3">
        <div className="glass-strong rounded-2xl shadow-elegant flex items-center justify-between px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Trophy className="h-6 w-6 text-gold transition-transform group-hover:rotate-12" />
              <div className="absolute inset-0 blur-md bg-gold/40 -z-10" />
            </div>
            <div className="leading-none">
              <div className="font-display text-base font-bold tracking-tight">COPA 2026</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Hub Oficial
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/">Início</NavLink>
            <NavLink to="/selecoes">Seleções</NavLink>
            <NavLink to="/estadios">Estádios</NavLink>
            {user && <NavLink to="/dashboard">Painel</NavLink>}
            {role === "admin" && <NavLink to="/admin">Admin</NavLink>}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {role === "admin" && (
                  <span className="hidden lg:inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-gold">
                    <ShieldCheck className="h-3 w-3" /> Admin
                  </span>
                )}
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-1" /> Sair
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="gradient-primary text-primary-foreground border-0 shadow-glow hover:opacity-95">
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-1" /> Entrar
                </Link>
              </Button>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {open && (
          <div className="md:hidden mt-2 glass-strong rounded-2xl p-3 flex flex-col gap-1">
            <NavLink to="/" mobile onClick={() => setOpen(false)}>Início</NavLink>
            <NavLink to="/selecoes" mobile onClick={() => setOpen(false)}>Seleções</NavLink>
            <NavLink to="/estadios" mobile onClick={() => setOpen(false)}>Estádios</NavLink>
            {user && <NavLink to="/dashboard" mobile onClick={() => setOpen(false)}>Painel</NavLink>}
            {role === "admin" && <NavLink to="/admin" mobile onClick={() => setOpen(false)}>Admin</NavLink>}
            {user ? (
              <Button variant="ghost" size="sm" onClick={() => { void signOut(); setOpen(false); }}>
                <LogOut className="h-4 w-4 mr-2" /> Sair
              </Button>
            ) : (
              <Button asChild size="sm" className="gradient-primary text-primary-foreground border-0">
                <Link to="/login" onClick={() => setOpen(false)}>
                  <LogIn className="h-4 w-4 mr-2" /> Entrar
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({
  to,
  children,
  mobile,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  mobile?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
        "text-muted-foreground hover:text-foreground hover:bg-white/5",
        mobile && "w-full"
      )}
      activeProps={{ className: "text-foreground bg-white/5" }}
      activeOptions={{ exact: to === "/" }}
    >
      {children}
    </Link>
  );
}
