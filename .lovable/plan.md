
# Plano — Sistema Copa 2026 (Admin + Usuário)

Build único, completo. Stack: TanStack Start + Supabase (Lovable Cloud) + Tailwind + shadcn + Framer Motion + Lovable Emails + Lovable AI gateway não necessário aqui.

## 1. Infra (Lovable Cloud)

Habilitar Cloud. Configurar:
- Google OAuth provider
- Lovable Emails (vai pedir setup de domínio — diálogo aparece na primeira ação de email)

## 2. Schema do banco

Tabelas (todas com RLS):
- `profiles` (id=auth.users, email, full_name, avatar_url, is_active, downloads_remaining, created_at)
- `user_roles` (user_id, role enum: 'admin'|'user') — separada, com `has_role()` SECURITY DEFINER
- `folders` (id, name, description, created_by, created_at)
- `files` (id, folder_id, name, storage_path, mime_type, size_bytes, created_at)
- `download_keys` (id, key_hash, folder_id, used_by, used_at, expires_at, created_by, created_at) — chave 16 chars, armazenada com hash bcrypt-equivalent (pgcrypto)
- `email_logs` (id, recipient, key_id, status, error, sent_at)
- `download_logs` (id, user_id, file_id, key_id, created_at) — para stats
- `activity_logs` (id, actor_id, action, target_type, target_id, metadata, created_at)

Storage buckets:
- `secure-files` (privado) — PDFs/arquivos. Acesso só via signed URLs server-side após validação de key.

**Bootstrap admin**: trigger `handle_new_user()` insere em `profiles` + checa se é primeiro usuário; se sim, insere role 'admin' em `user_roles`.

## 3. Server functions (`createServerFn`)

**Usuário:**
- `redeemKey({ key })` — valida hash, marca usada, retorna folder_id + lista de arquivos
- `getMyDashboard()` — stats pessoais
- `getSignedPreviewUrl({ fileId })` — valida que usuário tem acesso via key resgatada, retorna URL assinada curta (60s) só para preview

**Admin (middleware `requireAdmin`):**
- `createFolder`, `uploadFile` (signed upload URL), `deleteFile/Folder`
- `generateKeys({ folderId, count, expiresInDays })` — retorna chaves em texto plano UMA vez
- `listKeys`, `revokeKey`
- `listUsers`, `toggleUserActive`, `pauseUserDownloads`
- `addAdmin({ userId })`
- `sendKeysByEmail({ recipients[], folderId })` — gera key por destinatário, enfileira email
- `getAdminStats()` — agregados para gráficos

## 4. Rotas (file-based)

```
/                            Landing Copa 2026
/login                       Google OAuth
/_authenticated/dashboard    Área usuário
/_authenticated/redeem       Inserir key → desbloqueia folder
/_authenticated/preview/$id  PDF viewer protegido
/_authenticated/_admin/      (layout, exige role admin)
  ├ index                    Stats + gráficos
  ├ folders                  Upload drag&drop
  ├ keys                     Gerar/listar/revogar
  ├ users                    Gerenciar
  ├ admins                   Adicionar admins
  └ emails                   Envio em massa + logs
/api/public/email-webhook    Webhook bounces/complaints (assinatura HMAC)
*                            404 custom
```

## 5. PDF viewer "proteção máxima"

- Server function renderiza cada página do PDF como imagem (pdfjs server-side ou converter no upload e cachear em bucket privado)
- Client recebe imagens via signed URLs de 60s, uma por vez (lazy)
- Overlay com watermark do email do usuário + timestamp em cada página
- Bloqueio de menu contexto, atalhos (Ctrl+S/P/Shift+S), drag, selection
- CSP headers restritivos

Aviso honesto ao usuário no chat: screenshots físicos sempre são possíveis; isso é mitigação forte, não bloqueio absoluto.

## 6. Email (Lovable Emails)

Template React Email premium com tema Copa 2026, contendo: nome, key destacada, URL do site, instruções passo a passo. Fila via infra padrão do Lovable Emails (auto-setup). Logs em `email_logs`.

Primeira ação de email vai disparar diálogo de setup de domínio — usuário precisa configurar `notify.dominio.com`.

## 7. Design system

Tema escuro premium, tokens em `src/styles.css`:
- Paleta: verde-bandeira → dourado (gradientes), background deep navy, glass surfaces
- Tipografia: Inter + display font (Space Grotesk)
- Tokens semânticos para glass, glow, gradient-primary, shadow-elegant
- Framer Motion: page transitions, card hover 3D sutil, parallax na landing
- Skeleton loaders, toasts custom, scrollbar estilizada
- Componentes shadcn customizados com variants premium

Landing inclui: hero animado com bandeiras flutuantes, 48 seleções por grupo (A–L), 16 estádios em card grid com hover 3D, footer com créditos "Danilo Felix".

## 8. Segurança

- RLS em todas tabelas, policies via `has_role()`
- Keys: armazenar apenas hash (pgcrypto `crypt`), comparação constant-time
- JWT/sessão: gerenciado pelo Supabase Auth
- Validação Zod em todo `inputValidator`
- Headers CSP/XSS via meta no `__root.tsx`
- Storage: bucket privado, acesso só por signed URL server-emitida após validação
- Webhooks: verificação HMAC

Nota: rate limiting não será implementado (backend não tem primitivas; ver política).

## 9. Detalhes técnicos

- `src/integrations/supabase/auth-attacher` registrado em `src/start.ts`
- Cache invalidation em `onAuthStateChange` no `__root.tsx`
- `_authenticated` layout com `beforeLoad` redirect → /login
- `_admin` layout com `beforeLoad` checando `has_role('admin')`
- 404 e errorComponent customizados tema Copa

## 10. Ordem de execução

1. Habilitar Cloud + Google OAuth
2. Migration do schema + RLS + trigger de bootstrap admin + storage bucket
3. Design tokens + layout root + auth-attacher
4. Landing + páginas públicas + 404
5. Auth flow (login Google) + dashboard usuário + redeem key
6. PDF viewer protegido (com conversão para imagens)
7. Admin: folders/upload, keys, users, admins, stats
8. Setup de email domain (diálogo) + template + envio em massa
9. Polish: animações, micro-interações, QA responsivo

## Pontos de atenção que vão exigir ação sua

- **Setup de domínio de email**: vai aparecer um botão para configurar `notify.seudominio.com` — sem isso, envio de keys por email não funciona (mas o resto do sistema sim)
- **Primeiro login = admin**: o primeiro Google que logar vira admin automaticamente. Logue você primeiro
- **PDF como imagens** é mais pesado/lento que iframe — confirmação implícita pela escolha "proteção máxima"
