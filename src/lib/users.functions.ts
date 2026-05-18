import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, avatar_url, is_active, downloads_paused, created_at")
      .order("created_at", { ascending: false });
    const ids = (profiles ?? []).map((p) => p.id);
    let rolesMap: Record<string, string[]> = {};
    if (ids.length) {
      const { data: roles } = await supabaseAdmin
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", ids);
      rolesMap = (roles ?? []).reduce<Record<string, string[]>>((acc, r) => {
        (acc[r.user_id] ||= []).push(r.role);
        return acc;
      }, {});
    }
    return {
      users: (profiles ?? []).map((p) => ({ ...p, roles: rolesMap[p.id] ?? [] })),
    };
  });

export const toggleUserActive = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { userId: string; active: boolean }) =>
    z.object({ userId: z.string().uuid(), active: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId: actor } = context as { userId: string };
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_active: data.active })
      .eq("id", data.userId);
    if (error) throw new Error("Falha ao atualizar.");
    await supabaseAdmin.from("activity_logs").insert({
      actor_id: actor,
      action: data.active ? "activate_user" : "deactivate_user",
      target_type: "user",
      target_id: data.userId,
    });
    return { ok: true };
  });

export const pauseUserDownloads = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { userId: string; paused: boolean }) =>
    z.object({ userId: z.string().uuid(), paused: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId: actor } = context as { userId: string };
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ downloads_paused: data.paused })
      .eq("id", data.userId);
    if (error) throw new Error("Falha ao atualizar.");
    await supabaseAdmin.from("activity_logs").insert({
      actor_id: actor,
      action: data.paused ? "pause_downloads" : "resume_downloads",
      target_type: "user",
      target_id: data.userId,
    });
    return { ok: true };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { userId: string; makeAdmin: boolean }) =>
    z.object({ userId: z.string().uuid(), makeAdmin: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId: actor } = context as { userId: string };
    if (data.makeAdmin) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: "admin" }, { onConflict: "user_id,role" });
      if (error) throw new Error("Falha ao adicionar admin.");
    } else {
      if (data.userId === actor) throw new Error("Você não pode remover o próprio admin.");
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", "admin");
      if (error) throw new Error("Falha ao remover admin.");
    }
    return { ok: true };
  });
