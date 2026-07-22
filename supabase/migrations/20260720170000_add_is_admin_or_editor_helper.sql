-- Fas A / A2: hjälpfunktion admin-eller-editor. Används av Fas B för RLS-skrivrättigheter.
-- Applicerad via MCP mot fjärr-DB (db push trasig i detta repo) — denna fil är proveniens.
-- role::text-jämförelse undviker enum-literal-beroende. Pinnad search_path.
CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::text IN ('admin', 'editor')
  );
$$;

COMMENT ON FUNCTION public.is_admin_or_editor() IS
  'True om inloggad användare är admin eller editor. För RLS-skrivpolicies (Fas B).';
