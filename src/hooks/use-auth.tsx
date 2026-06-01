import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { syncMyAccount } from "@/lib/auth.functions";

type Role = "admin" | "user" | null;

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: Role;
  loading: boolean;
  roleLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const syncAccount = useServerFn(syncMyAccount);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    // 1. Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setRoleLoading(true);
        // defer DB call
        setTimeout(() => {
          void fetchRole(newSession.user.id);
        }, 0);
      } else {
        setRole(null);
        setRoleLoading(false);
      }
    });

    // 2. Then check existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        void fetchRole(data.session.user.id);
      } else {
        setRole(null);
        setRoleLoading(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchRole(userId: string) {
    setRoleLoading(true);
    const currentUser = user?.id === userId ? user : null;
    if (currentUser) {
      try {
        await syncAccount({
          data: {
            email: currentUser.email ?? null,
            fullName:
              currentUser.user_metadata?.full_name ?? currentUser.user_metadata?.name ?? null,
            avatarUrl: currentUser.user_metadata?.avatar_url ?? null,
          },
        });
      } catch {
        // Continua para tentar ler o cargo existente.
      }
    }
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .order("role", { ascending: true }); // admin < user alphabetically

    if (error) {
      setRole(null);
      setRoleLoading(false);
      return;
    }

    if (data && data.length > 0) {
      const isAdmin = data.some((r) => r.role === "admin");
      setRole(isAdmin ? "admin" : "user");
    } else {
      setRole("user");
    }
    setRoleLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setRole(null);
    setRoleLoading(false);
  }

  return (
    <AuthContext.Provider value={{ user, session, role, loading, roleLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
