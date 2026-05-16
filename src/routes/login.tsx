import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Copa 2026" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      void navigate({ to: "/dashboard" });
    }
  }, [user, loading, navigate]);

  async function handleGoogle() {
    setSigningIn(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/dashboard",
      });
      if (result.error) {
        toast.error("Falha no login: " + result.error.message);
        setSigningIn(false);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro inesperado");
      setSigningIn(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="absolute top-6 left-6 text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Início
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-strong rounded-3xl p-10 max-w-md w-full shadow-elegant"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <Trophy className="h-12 w-12 text-gold" />
            <div className="absolute inset-0 blur-2xl bg-gold/50 -z-10" />
          </div>
        </div>
        <h1 className="text-3xl font-display font-bold text-center">
          Bem-vindo à <span className="gradient-text">Copa 2026</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          Entre com sua conta Google para acessar a plataforma e usar sua chave de conteúdo.
        </p>

        <Button
          onClick={handleGoogle}
          disabled={signingIn}
          size="lg"
          className="mt-8 w-full h-12 gradient-primary text-primary-foreground border-0 shadow-glow text-base font-semibold"
        >
          {signingIn ? "Conectando..." : "Continuar com Google"}
        </Button>

        <p className="mt-6 text-xs text-center text-muted-foreground">
          Ao continuar você concorda com nossos termos. Seu email é usado apenas para identificação.
        </p>
      </motion.div>
    </div>
  );
}
