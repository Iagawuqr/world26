import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Ban, KeyRound, Sparkles, Mail } from "lucide-react";
import { generateKeys, listKeys, revokeKey } from "@/lib/keys.functions";
import { adminListFolders } from "@/lib/folders.functions";
import { sendPlainKeyByEmail } from "@/lib/email.functions";

export const Route = createFileRoute("/_authenticated/admin/keys")({
  component: AdminKeys,
});

function AdminKeys() {
  const list = useServerFn(listKeys);
  const gen = useServerFn(generateKeys);
  const rev = useServerFn(revokeKey);
  const folders = useServerFn(adminListFolders);
  const sendMail = useServerFn(sendPlainKeyByEmail);
  const qc = useQueryClient();
  const [folderId, setFolderId] = useState("");
  const [count, setCount] = useState(1);
  const [days, setDays] = useState<string>("");
  const [generated, setGenerated] = useState<string[]>([]);
  const [mailTo, setMailTo] = useState("");

  const foldersQ = useQuery({ queryKey: ["admin-folders"], queryFn: () => folders() });
  const keysQ = useQuery({ queryKey: ["admin-keys"], queryFn: () => list({ data: {} }) });

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!folderId) return toast.error("Selecione uma pasta");
    try {
      const res = await gen({
        data: { folderId, count, expiresInDays: days ? parseInt(days) : null },
      });
      setGenerated(res.keys);
      toast.success(`${res.keys.length} chave(s) gerada(s)`);
      qc.invalidateQueries({ queryKey: ["admin-keys"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function onRevoke(id: string) {
    if (!confirm("Revogar esta chave?")) return;
    try {
      await rev({ data: { keyId: id } });
      toast.success("Chave revogada");
      qc.invalidateQueries({ queryKey: ["admin-keys"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function copyAll() {
    navigator.clipboard.writeText(generated.join("\n"));
    toast.success("Copiado");
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1.3fr] gap-5">
      <div className="space-y-5">
        <form onSubmit={onGenerate} className="glass rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" /> Gerar chaves
          </h3>
          <select
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background/40 border border-white/10 outline-none text-sm"
          >
            <option value="">Selecione a pasta</option>
            {foldersQ.data?.folders?.map((f: any) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-muted-foreground">
              Quantidade
              <input
                type="number"
                min={1}
                max={500}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-background/40 border border-white/10 outline-none text-sm"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Expira em (dias)
              <input
                type="number"
                min={1}
                placeholder="sem expirar"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-background/40 border border-white/10 outline-none text-sm"
              />
            </label>
          </div>
          <button className="w-full gradient-primary text-primary-foreground rounded-lg py-2 text-sm font-medium shadow-glow">
            Gerar
          </button>
        </form>

        {generated.length > 0 && (
          <div className="glass-strong rounded-2xl p-5 space-y-3 shadow-elegant">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Chaves geradas</h3>
              <button
                onClick={copyAll}
                className="inline-flex items-center gap-1.5 text-xs glass px-3 py-1.5 rounded-md hover:bg-white/5"
              >
                <Copy className="h-3 w-3" /> Copiar tudo
              </button>
            </div>
            <p className="text-xs text-gold">
              Salve agora — não será possível visualizá-las depois.
            </p>
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {generated.map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <code
                    onClick={() => {
                      navigator.clipboard.writeText(k);
                      toast.success("Copiada");
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-background/60 font-mono text-sm tracking-wider cursor-pointer hover:bg-background"
                  >
                    {k.match(/.{1,4}/g)?.join("-")}
                  </code>
                  <button
                    onClick={async () => {
                      const to = prompt("Enviar para qual e-mail?", mailTo);
                      if (!to) return;
                      setMailTo(to);
                      try {
                        const folderName = foldersQ.data?.folders?.find(
                          (f: any) => f.id === folderId,
                        )?.name;
                        await sendMail({ data: { plainKey: k, recipient: to, folderName } });
                        toast.success(`Enviada para ${to}`);
                      } catch (e: any) {
                        toast.error(e.message ?? "Falha no envio");
                      }
                    }}
                    className="p-2 rounded-md glass hover:bg-white/5"
                    title="Enviar por e-mail"
                  >
                    <Mail className="h-4 w-4 text-gold" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="glass rounded-2xl divide-y divide-white/5">
        <div className="p-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" /> Últimas chaves
          </h3>
          <span className="text-xs text-muted-foreground">{keysQ.data?.keys?.length ?? 0}</span>
        </div>
        {keysQ.data?.keys?.map((k: any) => {
          const expired = k.expires_at && new Date(k.expires_at) < new Date();
          const status = k.revoked
            ? { t: "Revogada", c: "text-destructive" }
            : expired
              ? { t: "Expirada", c: "text-muted-foreground" }
              : k.used_by
                ? { t: "Usada", c: "text-gold" }
                : { t: "Disponível", c: "text-primary" };
          return (
            <div key={k.id} className="p-3 flex items-center gap-3 text-sm">
              <code className="font-mono text-xs px-2 py-1 rounded bg-white/5">
                {k.key_prefix}…
              </code>
              <span className={`text-xs ${status.c}`}>{status.t}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(k.created_at).toLocaleDateString("pt-BR")}
              </span>
              {!k.revoked && (
                <button
                  onClick={() => onRevoke(k.id)}
                  className="text-muted-foreground hover:text-destructive p-1.5 rounded hover:bg-white/5"
                  title="Revogar"
                >
                  <Ban className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
        {keysQ.data?.keys?.length === 0 && (
          <div className="p-5 text-sm text-muted-foreground">Nenhuma chave gerada ainda.</div>
        )}
      </div>
    </div>
  );
}
