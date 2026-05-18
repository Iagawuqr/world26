import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { getSignedPreviewUrl } from "@/lib/files.functions";

export const Route = createFileRoute("/_authenticated/preview/$id")({
  head: () => ({ meta: [{ title: "Visualização segura — Copa 2026" }] }),
  component: PreviewPage,
});

function PreviewPage() {
  const { id } = Route.useParams();
  const fn = useServerFn(getSignedPreviewUrl);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["preview", id],
    queryFn: () => fn({ data: { fileId: id } }),
    refetchInterval: 50_000, // renova a URL antes de expirar (60s)
  });

  // Bloqueio de atalhos comuns (Ctrl+S, Ctrl+P, Ctrl+Shift+S, PrintScreen)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["s", "p", "u"].includes(k)) {
        e.preventDefault();
      }
      if (k === "printscreen") e.preventDefault();
    };
    const onCtx = (e: MouseEvent) => e.preventDefault();
    const onDrag = (e: DragEvent) => e.preventDefault();
    const onSel = (e: Event) => e.preventDefault();
    window.addEventListener("keydown", onKey);
    window.addEventListener("contextmenu", onCtx);
    window.addEventListener("dragstart", onDrag);
    document.addEventListener("selectstart", onSel);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("contextmenu", onCtx);
      window.removeEventListener("dragstart", onDrag);
      document.removeEventListener("selectstart", onSel);
    };
  }, []);

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="inline-flex items-center gap-1.5 text-xs text-gold glass px-3 py-1.5 rounded-full">
          <ShieldAlert className="h-3 w-3" /> Visualização protegida · download desabilitado
        </div>
      </div>

      <div className="glass-strong rounded-2xl overflow-hidden shadow-elegant relative">
        {isLoading && <div className="p-10 text-sm text-muted-foreground">Carregando...</div>}
        {error && (
          <div className="p-10 text-sm text-destructive">
            {(error as Error).message}
            <button onClick={() => refetch()} className="block mt-3 text-primary underline text-xs">
              Tentar novamente
            </button>
          </div>
        )}
        {data && (
          <ProtectedViewer
            url={data.url}
            mimeType={data.mimeType ?? ""}
            name={data.name}
            watermark={data.watermark}
          />
        )}
      </div>
    </div>
  );
}

function ProtectedViewer({ url, mimeType, watermark, name }: { url: string; mimeType: string; watermark: string; name: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isPdf = mimeType?.includes("pdf") || name?.toLowerCase().endsWith(".pdf");
  const isImage = mimeType?.startsWith("image/");

  return (
    <div className="relative" style={{ minHeight: "70vh" }}>
      {/* Watermark overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-25 mix-blend-difference"
        aria-hidden
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-[11px] font-mono text-white whitespace-nowrap"
            style={{
              top: `${(i * 11) % 100}%`,
              left: `${(i * 17) % 100}%`,
              transform: "rotate(-25deg)",
            }}
          >
            {watermark} · {new Date().toLocaleString("pt-BR")}
          </div>
        ))}
      </div>

      {isPdf && (
        <iframe
          ref={iframeRef}
          src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
          title={name}
          className="w-full h-[70vh] bg-black"
          sandbox="allow-same-origin allow-scripts"
        />
      )}
      {isImage && (
        <img src={url} alt={name} className="w-full max-h-[80vh] object-contain bg-black" draggable={false} />
      )}
      {!isPdf && !isImage && (
        <div className="p-10 text-center text-sm text-muted-foreground">
          Formato não suportado para preview seguro. Tipo: {mimeType}
        </div>
      )}
    </div>
  );
}
