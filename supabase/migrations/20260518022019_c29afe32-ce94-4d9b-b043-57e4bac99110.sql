-- Helper: usuário tem acesso à pasta se resgatou chave válida não revogada
CREATE OR REPLACE FUNCTION public.has_folder_access(_user_id uuid, _folder_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.download_keys
    WHERE used_by = _user_id
      AND folder_id = _folder_id
      AND revoked = false
  );
$$;

-- Apertar policy de files: usuário comum só vê arquivos de pastas que resgatou
DROP POLICY IF EXISTS files_select_auth ON public.files;
CREATE POLICY files_select_access ON public.files
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_folder_access(auth.uid(), folder_id)
  );

-- Idem folders: usuário só vê pastas que resgatou
DROP POLICY IF EXISTS folders_select_auth ON public.folders;
CREATE POLICY folders_select_access ON public.folders
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_folder_access(auth.uid(), id)
  );

-- Trigger updated_at para folders
DROP TRIGGER IF EXISTS folders_updated_at ON public.folders;
CREATE TRIGGER folders_updated_at
  BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger updated_at para profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Política de storage: secure-files (privado) — leitura via service role apenas (default).
-- Admins podem fazer upload direto via authenticated quando role=admin.
CREATE POLICY "secure_files_admin_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'secure-files'
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "secure_files_admin_all" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'secure-files'
    AND public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    bucket_id = 'secure-files'
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );