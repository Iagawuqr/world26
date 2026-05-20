import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ShieldAlert, EyeOff } from "lucide-react";
import { getSignedPreviewUrl } from "@/lib/files.functions";

export const Route = createFileRoute("/_authenticated/preview/$id")({
  head: () => ({
    meta: [
      { title: "Visualização segura — Copa 2026" },
      { name: "robots", content: "noindex,nofollow,noarchive,nosnippet" },
      { httpEquiv: "Content-Security-Policy", content: "frame-ancestors 'self'" },
      { httpEquiv: "X-Frame-Options", content: "SAMEORIGIN" },
      { httpEquiv: "Referrer-Policy", content: "no-referrer" },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  const { id } = Route.useParams();
  const fn = useServerFn(getSignedPreviewUrl);
  const [hidden, setHidden] = useState(false);
  const [devtools, setDevtools] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["preview", id],
    queryFn: () => fn({ data: { fileId: id } }),
    refetchInterval: 50_000,
    staleTime: 45_000,
  });

  // Bloqueios de atalhos, menu, drag, seleção e clipboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && ["s", "p", "u", "c", "x", "a", "j", "i"].includes(k)) e.preventDefault();
      if (ctrl && e.shiftKey && ["i", "j", "c", "s", "p"].includes(k)) e.preventDefault();
      if (["printscreen", "f12"].includes(k)) e.preventDefault();
    };
    const stop = (e: Event) => e.preventDefault();
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.clipboardData?.setData("text/plain", "");
    };
    const onVis = () => setHidden(document.visibilityState !== "visible");
    const onBlur = () => setHidden(true);
    const onFocus = () => setHidden(false);

    window.addEventListener("keydown", onKey);
    window.addEventListener("contextmenu", stop);
    window.addEventListener("dragstart", stop);
    document.addEventListener("selectstart", stop);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCopy);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    // Detecta devtools (heurística por diferença de tamanho)
    const dt = setInterval(() => {
      const threshold = 180;
      const open =
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold;
      setDevtools(open);
    }, 800);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("contextmenu", stop);
      window.removeEventListener("dragstart", stop);
      document.removeEventListener("selectstart", stop);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCopy);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      clearInterval(dt);
    };
  }, []);

  return (
    <div className="space-y-4 select-none no-select">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="inline-flex items-center gap-1.5 text-xs text-gold glass px-3 py-1.5 rounded-full">
          <ShieldAlert className="h-3 w-3" /> Visualização protegida · download e cópia desabilitados
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

        {(hidden || devtools) && (
          <div className="absolute inset-0 z-30 backdrop-blur-2xl bg-background/95 flex flex-col items-center justify-center gap-3 text-center p-8">
            <EyeOff className="h-10 w-10 text-gold" />
            <div className="font-display text-xl">Conteúdo ocultado</div>
            <p className="text-sm text-muted-foreground max-w-xs">
              {devtools
                ? "Feche as ferramentas de desenvolvedor para continuar visualizando."
                : "Retorne à janela para retomar a visualização."}
            </p>
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground/70 text-center">
        Todas as visualizações são registradas. Tentativas de captura ou redistribuição são auditadas.
      </p>
    </div>
  );
}

function ProtectedViewer({
  url,
  mimeType,
  watermark,
  name,
}: {
  url: string;
  mimeType: string;
  watermark: string;
  name: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isPdf = mimeType?.includes("pdf") || name?.toLowerCase().endsWith(".pdf");
  const isImage = mimeType?.startsWith("image/");
  const stamp = new Date().toLocaleString("pt-BR");

  return (
    <div className="relative bg-black" style={{ minHeight: "75vh" }}>
      {/* Watermark denso em grade diagonal */}
      <div
        className="pointer-events-none absolute inset-0 z-20 overflow-hidden opacity-[0.18] mix-blend-difference"
        aria-hidden
      >
        <div
          className="absolute inset-[-20%] grid"
          style={{
            gridTemplateColumns: "repeat(6, 1fr)",
            gridAutoRows: "120px",
            transform: "rotate(-22deg)",
          }}
        >
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center text-[10px] font-mono text-white whitespace-nowrap"
            >
              {watermark} · {stamp}
            </div>
          ))}
        </div>
      </div>

      {/* Camada anti-clique sobre PDF/Imagem (impede menu nativo dentro do iframe em alguns browsers) */}
      <div
        className="absolute inset-0 z-10"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{ pointerEvents: isPdf ? "none" : "auto" }}
        aria-hidden
      />

      {isPdf && (
        <iframe
          ref={iframeRef}
          src={`${url}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH`}
          title={name}
          className="w-full h-[78vh] bg-black"
          sandbox="allow-same-origin"
          referrerPolicy="no-referrer"
        />
      )}
      {isImage && (
        <img
          src={url}
          alt={name}
          className="w-full max-h-[80vh] object-contain bg-black pointer-events-none"
          draggable={false}
        />
      )}
      {!isPdf && !isImage && (
        <div className="p-10 text-center text-sm text-muted-foreground">
          Formato não suportado para preview seguro. Tipo: {mimeType}
        </div>
      )}
    </div>
  );
}
