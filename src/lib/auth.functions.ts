import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const syncMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email?: string | null; fullName?: string | null; avatarUrl?: string | null }) =>
    z
      .object({
        email: z.string().email().nullable().optional(),
        fullName: z.string().max(255).nullable().optional(),
        avatarUrl: z.string().url().nullable().optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { userId, claims } = context as { userId: string; claims?: Record<string, unknown> };
    const email = data.email ?? (typeof claims?.email === "string" ? claims.email : "");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      await supabaseAdmin.from("profiles").insert({
        id: userId,
        email,
        full_name: data.fullName ?? null,
        avatar_url: data.avatarUrl ?? null,
      });
    }

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (!roles?.length) {
      const { count } = await supabaseAdmin
        .from("user_roles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      const role = count === 0 ? "admin" : "user";
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role });
      return { role };
    }

    return { role: roles.some((r) => r.role === "admin") ? "admin" : "user" };
  });

/** Checagem silenciosa de admin no backend (sem flash de UI). */
export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { userId } = context as { userId: string };
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) {
      console.error("Admin permission check failed", { userId, message: error.message });
      return { isAdmin: false, error: "permission_check_failed" };
    }
    return { isAdmin: !!data };
  });
