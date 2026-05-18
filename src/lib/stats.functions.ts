import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/admin-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const myDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    const { data: keys } = await supabaseAdmin
      .from("download_keys")
      .select("folder_id")
      .eq("used_by", userId)
      .eq("revoked", false);
    const folderIds = Array.from(new Set((keys ?? []).map((k) => k.folder_id)));

    let filesCount = 0;
    if (folderIds.length) {
      const { count } = await supabaseAdmin
        .from("files")
        .select("id", { count: "exact", head: true })
        .in("folder_id", folderIds);
      filesCount = count ?? 0;
    }

    const { count: downloadsCount } = await supabaseAdmin
      .from("download_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    return {
      keysRedeemed: keys?.length ?? 0,
      filesAvailable: filesCount,
      downloads: downloadsCount ?? 0,
    };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const [users, folders, files, keys, redeemed, downloads] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("folders").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("files").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("download_keys").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("download_keys")
        .select("id", { count: "exact", head: true })
        .not("used_by", "is", null),
      supabaseAdmin.from("download_logs").select("id", { count: "exact", head: true }),
    ]);

    // últimos 7 dias de downloads
    const since = new Date(Date.now() - 6 * 86400 * 1000);
    since.setHours(0, 0, 0, 0);
    const { data: recent } = await supabaseAdmin
      .from("download_logs")
      .select("created_at")
      .gte("created_at", since.toISOString());

    const series: { date: string; downloads: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(since.getTime() + i * 86400 * 1000);
      const key = d.toISOString().slice(0, 10);
      series.push({ date: key, downloads: 0 });
    }
    (recent ?? []).forEach((r) => {
      const key = r.created_at.slice(0, 10);
      const slot = series.find((s) => s.date === key);
      if (slot) slot.downloads++;
    });

    return {
      totals: {
        users: users.count ?? 0,
        folders: folders.count ?? 0,
        files: files.count ?? 0,
        keys: keys.count ?? 0,
        redeemed: redeemed.count ?? 0,
        downloads: downloads.count ?? 0,
      },
      series,
    };
  });
