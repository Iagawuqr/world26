import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const FROM = "Copa 2026 <onboarding@resend.dev>";

async function sendViaResend(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY ausente no servidor.");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Resend ${res.status}: ${txt}`);
  }
  return res.json();
}

function template(key: string, folderName?: string | null) {
  return `<!doctype html><html><body style="margin:0;background:#0b1220;font-family:Inter,Arial,sans-serif;color:#f5f7fb;padding:32px">
  <div style="max-width:560px;margin:0 auto;background:linear-gradient(180deg,#111a30,#0b1220);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:32px">
    <div style="font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:#facc15">Copa 2026</div>
    <h1 style="margin:12px 0 6px;font-size:24px">Sua chave de acesso</h1>
    <p style="color:#9aa4b2;margin:0 0 18px">Acesso${folderName ? ` à pasta <b style="color:#fff">${folderName}</b>` : ""} liberado. Use a chave abaixo na área "Resgatar chave".</p>
    <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:20px;letter-spacing:.18em;background:#0a1326;border:1px dashed rgba(255,255,255,.18);padding:18px;border-radius:14px;text-align:center;color:#a7f3d0">${key}</div>
    <p style="font-size:12px;color:#6b7280;margin-top:22px">Não compartilhe esta chave. Cada chave é de uso único.</p>
  </div></body></html>`;
}

export const sendKeyByEmail = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { keyId: string; recipient: string }) =>
    z
      .object({
        keyId: z.string().uuid(),
        recipient: z.string().email().max(255),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    // chave bruta não pode ser recuperada (armazenamos hash); enviamos um link de resgate
    // OU, se você usa chaves "claras" no momento da criação, passe-as via outra rota.
    // Aqui mandamos um aviso/instrução de resgate vinculado ao prefixo.
    const { data: keyRow } = await supabaseAdmin
      .from("download_keys")
      .select("id, key_prefix, folder_id")
      .eq("id", data.keyId)
      .maybeSingle();
    if (!keyRow) throw new Error("Chave não encontrada.");

    const { data: folder } = await supabaseAdmin
      .from("folders")
      .select("name")
      .eq("id", keyRow.folder_id)
      .maybeSingle();

    const subject = "Sua chave Copa 2026";
    const html = template(`${keyRow.key_prefix}••••••••`, folder?.name ?? null);

    const { error: logErr, data: log } = await supabaseAdmin
      .from("email_logs")
      .insert({ recipient: data.recipient, key_id: keyRow.id, status: "pending" })
      .select("id")
      .single();
    if (logErr) throw new Error("Falha ao registrar e-mail.");

    try {
      await sendViaResend(data.recipient, subject, html);
      await supabaseAdmin
        .from("email_logs")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", log!.id);
      return { ok: true };
    } catch (e) {
      await supabaseAdmin
        .from("email_logs")
        .update({ status: "failed", error: (e as Error).message })
        .eq("id", log!.id);
      throw e;
    }
  });

/** Envio direto com a chave em texto puro (use logo após gerar). */
export const sendPlainKeyByEmail = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { plainKey: string; recipient: string; folderName?: string }) =>
    z
      .object({
        plainKey: z.string().min(8).max(64),
        recipient: z.string().email().max(255),
        folderName: z.string().max(120).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await sendViaResend(
      data.recipient,
      "Sua chave Copa 2026",
      template(data.plainKey, data.folderName ?? null),
    );
    return { ok: true };
  });
