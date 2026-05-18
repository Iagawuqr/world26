import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { KeyRound, Sparkles, ArrowRight } from "lucide-react";
import { redeemKey } from "@/lib/keys.functions";

export const Route = createFileRoute("/_authenticated/redeem")({
  head: () => ({ meta: [{ title: "Resgatar chave — Copa 2026" }] }),
  component: RedeemPage,
});

function RedeemPage() {
  const redeem = useServerFn(redeemKey);
  const navigate = useNavigate();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await redeem({ data: { key } });
      toast.success("Pasta desbloqueada!");
      navigate({ to: "/dashboard", search: { folder: res.folderId } as any });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-8 sm:p-10 shadow-elegant"
      >
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold mb-4">
          <Sparkles className="h-3 w-3" /> Acesso exclusivo
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold">
          Resgatar <span className="gradient-text">chave</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cole sua chave de 16 caracteres. A separação por hífens é opcional.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-background/40 border border-white/10 focus:border-primary/60 focus:shadow-glow outline-none font-mono text-lg tracking-[0.3em] text-center transition-all"
              maxLength={24}
            />
          </div>
          <button
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 gradient-primary text-primary-foreground rounded-2xl py-4 font-semibold shadow-glow disabled:opacity-50"
          >
            {loading ? "Validando..." : "Desbloquear"} <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
