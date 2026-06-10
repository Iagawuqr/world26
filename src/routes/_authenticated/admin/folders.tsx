import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Folder as FolderIcon, Plus, Trash2, UploadCloud, FileText, X } from "lucide-react";
import { adminListFolders, createFolder, deleteFolder } from "@/lib/folders.functions";
import { adminListFiles, registerFile, deleteFile } from "@/lib/files.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/folders")({
  component: AdminFolders,
});

function AdminFolders() {
  const list = useServerFn(adminListFolders);
  const create = useServerFn(createFolder);
  const del = useServerFn(deleteFolder);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-folders"],
    queryFn: () => list(),
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await create({ data: { name: name.trim(), description: description.trim() || undefined } });
      setName("");
      setDescription("");
      toast.success("Pasta criada");
      qc.invalidateQueries({ queryKey: ["admin-folders"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Excluir a pasta, todos os arquivos e chaves associadas?")) return;
    try {
      await del({ data: { folderId: id } });
      toast.success("Pasta excluída");
      if (selected === id) setSelected(null);
      qc.invalidateQueries({ queryKey: ["admin-folders"] });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5">
      <div className="space-y-5">
        <form onSubmit={onCreate} className="glass rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-semibold">Nova pasta</h3>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da pasta"
            className="w-full px-3 py-2 rounded-lg bg-background/40 border border-white/10 focus:border-primary/60 outline-none text-sm"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição (opcional)"
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-background/40 border border-white/10 focus:border-primary/60 outline-none text-sm resize-none"
          />
          <button className="w-full inline-flex items-center justify-center gap-2 gradient-primary text-primary-foreground rounded-lg py-2 text-sm font-medium shadow-glow">
            <Plus className="h-4 w-4" /> Criar
          </button>
        </form>

        <div className="glass rounded-2xl divide-y divide-white/5">
          {isLoading && <div className="p-5 text-sm text-muted-foreground">Carregando...</div>}
          {data?.folders?.length === 0 && (
            <div className="p-5 text-sm text-muted-foreground">Nenhuma pasta criada.</div>
          )}
          {data?.folders?.map((f: any) => (
            <button
              key={f.id}
              onClick={() => setSelected(f.id)}
              className={[
                "w-full text-left p-4 flex items-center gap-3 transition-colors",
                selected === f.id ? "bg-white/5" : "hover:bg-white/5",
              ].join(" ")}
            >
              <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
                <FolderIcon className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{f.name}</div>
                <div className="text-xs text-muted-foreground">{f.fileCount} arquivos</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(f.id);
                }}
                className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-white/5"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </button>
          ))}
        </div>
      </div>

      <div>
        {selected ? (
          <FolderFiles folderId={selected} />
        ) : (
          <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
            Selecione uma pasta para gerenciar seus arquivos.
          </div>
        )}
      </div>
    </div>
  );
}

function FolderFiles({ folderId }: { folderId: string }) {
  const list = useServerFn(adminListFiles);
  const register = useServerFn(registerFile);
  const remove = useServerFn(deleteFile);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-files", folderId],
    queryFn: () => list({ data: { folderId } }),
  });
  const [uploading, setUploading] = useState<string[]>([]);

  const onDrop = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
        const path = `${folderId}/${crypto.randomUUID()}.${ext || "bin"}`;
        const contentType = file.type && file.type.length > 0 ? file.type : "application/octet-stream";
        setUploading((p) => [...p, file.name]);
        try {
          const { error: upErr } = await supabase.storage
            .from("secure-files")
            .upload(path, file, { contentType, upsert: false, cacheControl: "3600" });
          if (upErr) throw new Error(upErr.message || "Falha no upload (verifique se você é admin).");
          await register({
            data: {
              folderId,
              name: file.name,
              storagePath: path,
              mimeType: contentType,
              sizeBytes: file.size,
            },
          });
          toast.success(`${file.name} enviado`);
        } catch (err: any) {
          console.error("Upload failed", { name: file.name, error: err });
          toast.error(`Falha no upload de ${file.name}: ${err.message ?? "erro desconhecido"}`);
        } finally {

          setUploading((p) => p.filter((n) => n !== file.name));
          qc.invalidateQueries({ queryKey: ["admin-files", folderId] });
          qc.invalidateQueries({ queryKey: ["admin-folders"] });
        }
      }
    },
    [folderId, register, qc],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  async function onDeleteFile(id: string) {
    if (!confirm("Excluir este arquivo?")) return;
    try {
      await remove({ data: { fileId: id } });
      toast.success("Arquivo excluído");
      qc.invalidateQueries({ queryKey: ["admin-files", folderId] });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={[
          "glass rounded-2xl p-8 border-2 border-dashed transition-all cursor-pointer text-center",
          isDragActive
            ? "border-primary bg-primary/5 shadow-glow"
            : "border-white/10 hover:border-white/30",
        ].join(" ")}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-8 w-8 mx-auto text-primary" />
        <p className="mt-3 text-sm font-medium">
          {isDragActive ? "Solte para enviar" : "Arraste arquivos ou clique para selecionar"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">PDFs, imagens, vídeos — tudo aceito.</p>
      </div>

      {uploading.length > 0 && (
        <div className="glass rounded-2xl p-4 space-y-2">
          {uploading.map((n) => (
            <div key={n} className="flex items-center gap-3 text-sm">
              <div className="h-2 flex-1 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full w-1/2 gradient-primary animate-pulse" />
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">{n}</span>
            </div>
          ))}
        </div>
      )}

      <div className="glass rounded-2xl divide-y divide-white/5">
        {isLoading && <div className="p-5 text-sm text-muted-foreground">Carregando...</div>}
        {data?.files?.length === 0 && (
          <div className="p-5 text-sm text-muted-foreground">Nenhum arquivo nesta pasta.</div>
        )}
        {data?.files?.map((f: any) => (
          <div key={f.id} className="flex items-center gap-3 p-3">
            <div className="h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{f.name}</div>
              <div className="text-xs text-muted-foreground">
                {(f.size_bytes / 1024).toFixed(0)} KB · {f.mime_type}
              </div>
            </div>
            <button
              onClick={() => onDeleteFile(f.id)}
              className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
