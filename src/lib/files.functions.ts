import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/admin-middleware";

const BUCKET = "secure-files";

async function userHasFolderAccess(userId: string, folderId: string): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: adminRow } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (adminRow) return true;
  const { data } = await supabaseAdmin
    .from("download_keys")
    .select("id")
    .eq("used_by", userId)
    .eq("folder_id", folderId)
    .eq("revoked", false)
    .limit(1)
    .maybeSingle();
  return !!data;
}

/* ============ USER: arquivos de uma pasta liberada ============ */
export const listFolderFiles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { folderId: string }) =>
    z.object({ folderId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { userId } = context as { userId: string };
    if (!(await userHasFolderAccess(userId, data.folderId))) {
      throw new Error("Você não tem acesso a esta pasta.");
    }
    const { data: folder } = await supabaseAdmin
      .from("folders")
      .select("id, name, description")
      .eq("id", data.folderId)
      .single();
    const { data: files } = await supabaseAdmin
      .from("files")
      .select("id, name, mime_type, size_bytes, created_at")
      .eq("folder_id", data.folderId)
      .order("created_at", { ascending: false });
    return { folder, files: files ?? [] };
  });

/* ============ USER: URL assinada curta para preview ============ */
export const getSignedPreviewUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { fileId: string }) =>
    z.object({ fileId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { userId } = context as { userId: string };
    const { data: file } = await supabaseAdmin
      .from("files")
      .select("id, folder_id, storage_path, mime_type, name")
      .eq("id", data.fileId)
      .single();
    if (!file) throw new Error("Arquivo não encontrado.");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_active, downloads_paused, email")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.is_active) throw new Error("Conta desativada.");
    if (profile.downloads_paused) throw new Error("Downloads pausados pelo administrador.");

    if (!(await userHasFolderAccess(userId, file.folder_id))) {
      throw new Error("Acesso negado a este arquivo.");
    }

    const { data: signed, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(file.storage_path, 60);
    if (error || !signed) throw new Error("Falha ao gerar URL.");

    await supabaseAdmin.from("download_logs").insert({ user_id: userId, file_id: file.id });

    return {
      url: signed.signedUrl,
      mimeType: file.mime_type,
      name: file.name,
      watermark: profile.email,
    };
  });

/* ============ ADMIN: registrar upload (chamado após upload via client) ============ */
export const registerFile = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: {
    folderId: string;
    name: string;
    storagePath: string;
    mimeType: string;
    sizeBytes: number;
  }) =>
    z
      .object({
        folderId: z.string().uuid(),
        name: z.string().min(1).max(255),
        storagePath: z.string().min(1).max(500),
        mimeType: z.string().max(120),
        sizeBytes: z.number().int().min(0),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("files").insert({
      folder_id: data.folderId,
      name: data.name,
      storage_path: data.storagePath,
      mime_type: data.mimeType,
      size_bytes: data.sizeBytes,
    });
    if (error) throw new Error("Falha ao registrar arquivo.");
    return { ok: true };
  });

export const deleteFile = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { fileId: string }) =>
    z.object({ fileId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: file } = await supabaseAdmin
      .from("files")
      .select("storage_path")
      .eq("id", data.fileId)
      .maybeSingle();
    if (file) {
      await supabaseAdmin.storage.from(BUCKET).remove([file.storage_path]);
    }
    await supabaseAdmin.from("files").delete().eq("id", data.fileId);
    return { ok: true };
  });

export const adminListFiles = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { folderId: string }) =>
    z.object({ folderId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: files } = await supabaseAdmin
      .from("files")
      .select("id, name, mime_type, size_bytes, created_at, storage_path")
      .eq("folder_id", data.folderId)
      .order("created_at", { ascending: false });
    return { files: files ?? [] };
  });
