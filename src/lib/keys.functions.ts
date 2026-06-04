import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash, randomBytes } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/admin-middleware";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem 0/O/1/I
function genKey(len = 16): string {
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}
function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
function normalize(key: string): string {
  return key.replace(/[\s-]/g, "").toUpperCase();
}

/* ============ USER: resgatar chave ============ */
export const redeemKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { key: string }) =>
    z.object({ key: z.string().min(8).max(64) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { userId } = context as { userId: string };
    const clean = normalize(data.key);
    if (clean.length !== 16) throw new Error("A chave deve ter 16 caracteres.");
    const hash = hashKey(clean);

    // checar perfil ativo / pause
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_active, downloads_paused")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.is_active) throw new Error("Sua conta está desativada. Fale com o administrador.");

    const { data: keyRow, error } = await supabaseAdmin
      .from("download_keys")
      .select("id, folder_id, used_by, used_at, expires_at, revoked")
      .eq("key_hash", hash)
      .maybeSingle();
    if (error) throw new Error("Erro ao validar chave.");
    if (!keyRow) throw new Error("Chave inválida.");
    if (keyRow.revoked) throw new Error("Chave revogada.");
    if (keyRow.expires_at && new Date(keyRow.expires_at) < new Date()) throw new Error("Chave expirada.");
    if (keyRow.used_by && keyRow.used_by !== userId) throw new Error("Chave já utilizada por outra conta.");

    if (!keyRow.used_by) {
      await supabaseAdmin
        .from("download_keys")
        .update({ used_by: userId, used_at: new Date().toISOString() })
        .eq("id", keyRow.id);
    }

    await supabaseAdmin.from("activity_logs").insert({
      actor_id: userId,
      action: "redeem_key",
      target_type: "key",
      target_id: keyRow.id,
      metadata: { folder_id: keyRow.folder_id },
    });

    return { folderId: keyRow.folder_id };
  });

/* ============ ADMIN: gerar chaves ============ */
export const generateKeys = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { folderId: string; count: number; expiresInDays?: number | null }) =>
    z
      .object({
        folderId: z.string().uuid(),
        count: z.number().int().min(1).max(500),
        expiresInDays: z.number().int().min(1).max(365).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { userId } = context as { userId: string };
    const expiresAt = data.expiresInDays
      ? new Date(Date.now() + data.expiresInDays * 86400 * 1000).toISOString()
      : null;
    const generated: string[] = [];
    const rows = Array.from({ length: data.count }, () => {
      const k = genKey(16);
      generated.push(k);
      return {
        folder_id: data.folderId,
        created_by: userId,
        key_hash: hashKey(k),
        key_prefix: k.slice(0, 4),
        expires_at: expiresAt,
      };
    });
    const { error } = await supabaseAdmin.from("download_keys").insert(rows);
    if (error) throw new Error("Falha ao gerar chaves.");

    await supabaseAdmin.from("activity_logs").insert({
      actor_id: userId,
      action: "generate_keys",
      target_type: "folder",
      target_id: data.folderId,
      metadata: { count: data.count, expires_at: expiresAt },
    });

    return { keys: generated };
  });

/* ============ ADMIN: listar chaves ============ */
export const listKeys = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .inputValidator((input: { folderId?: string }) =>
    z.object({ folderId: z.string().uuid().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("download_keys")
      .select("id, key_prefix, folder_id, used_by, used_at, expires_at, revoked, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.folderId) q = q.eq("folder_id", data.folderId);
    const { data: rows, error } = await q;
    if (error) throw new Error("Falha ao listar chaves.");
    return { keys: rows ?? [] };
  });

/* ============ ADMIN: revogar chave ============ */
export const revokeKey = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { keyId: string }) => z.object({ keyId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { userId } = context as { userId: string };
    const { error } = await supabaseAdmin
      .from("download_keys")
      .update({ revoked: true })
      .eq("id", data.keyId);
    if (error) throw new Error("Falha ao revogar.");
    await supabaseAdmin.from("activity_logs").insert({
      actor_id: userId,
      action: "revoke_key",
      target_type: "key",
      target_id: data.keyId,
    });
    return { ok: true };
  });
