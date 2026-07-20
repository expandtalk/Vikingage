-- Fas A / A4: viking_cities saknade write-policy → admin-spara/radera nekades tyst.
-- Applicerad via MCP mot fjärr-DB (db push trasig i detta repo) — denna fil är proveniens.
-- Lägg admin-write i linje med övriga innehållstabeller (public läser, admin skriver).
CREATE POLICY "Admins can modify viking_cities"
ON public.viking_cities FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
