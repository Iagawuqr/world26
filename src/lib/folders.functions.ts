import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/admin-middleware";

/* ============ USER: pastas que eu desbloquei ============ */
export const listMyFolders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { userId } = context as { userId: string };
    const { data: keys } = await supabaseAdmin
      .from("download_keys")
      .select("folder_id, used_at")
      .eq("used_by", userId)
      .eq("revoked", false);
    const ids = Array.from(new Set((keys ?? []).map((k) => k.folder_id).filter(Boolean)));
    if (ids.length === 0) return { folders: [] };
    const { data: folders } = await supabaseAdmin
      .from("folders")
      .select("id, name, description, created_at")
      .in("id", ids)
      .order("created_at", { ascending: false });
    return { folders: folders ?? [] };
  });

/* ============ ADMIN ============ */
export const adminListFolders = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("folders")
      .select("id, name, description, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Falha ao listar pastas.");
    // contar arquivos
    const ids = (data ?? []).map((f) => f.id);
    let counts: Record<string, number> = {};
    if (ids.length) {
      const { data: files } = await supabaseAdmin
        .from("files")
        .select("folder_id")
        .in("folder_id", ids);
      counts = (files ?? []).reduce<Record<string, number>>((acc, f) => {
        acc[f.folder_id] = (acc[f.folder_id] ?? 0) + 1;
        return acc;
      }, {});
    }
    return { folders: (data ?? []).map((f) => ({ ...f, fileCount: counts[f.id] ?? 0 })) };
  });

export const createFolder = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { name: string; description?: string }) =>
    z
      .object({
        name: z.string().min(1).max(120),
        description: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { userId } = context as { userId: string };
    const { data: row, error } = await supabaseAdmin
      .from("folders")
      .insert({ name: data.name, description: data.description ?? null, created_by: userId })
      .select("id")
      .single();
    if (error) throw new Error("Falha ao criar pasta.");
    return { folderId: row.id };
  });

export const deleteFolder = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { folderId: string }) =>
    z.object({ folderId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // apaga arquivos do storage
    const { data: files } = await supabaseAdmin
      .from("files")
      .select("storage_path")
      .eq("folder_id", data.folderId);
    if (files && files.length) {
      await supabaseAdmin.storage
        .from("secure-files")
        .remove(files.map((f) => f.storage_path));
    }
    await supabaseAdmin.from("files").delete().eq("folder_id", data.folderId);
    await supabaseAdmin.from("download_keys").delete().eq("folder_id", data.folderId);
    const { error } = await supabaseAdmin.from("folders").delete().eq("id", data.folderId);
    if (error) throw new Error("Falha ao excluir pasta.");
    return { ok: true };
  });
