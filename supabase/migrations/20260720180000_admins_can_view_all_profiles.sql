-- Fas A / A3: admins behöver se alla användare för rollhantering.
-- Applicerad via MCP mot fjärr-DB (db push trasig i detta repo) — denna fil är proveniens.
-- Permissiv policy (OR:as med self-view) — icke-admins ser fortfarande bara sin egen rad.
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin());
