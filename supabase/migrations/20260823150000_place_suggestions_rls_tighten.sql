-- SÄKERHET: place_suggestions hade en bred 'authenticated ALL'-policy → alla inloggade kunde läsa
-- ALLA förslag inkl. submitter_email (PII). Trace visar att enda LÄSAREN i koden är admin-
-- modereringskön; DiscussionThread + SuggestPlaceForm bara INSERTar. Tighta läs/ändra till is_admin();
-- behåll den publika INSERT-policyn (bryggan + föreslå-plats-formuläret) — permissiva policies OR:as,
-- så icke-admins kan fortfarande skapa förslag men inte längre läsa dem. Idempotent.

DROP POLICY IF EXISTS place_suggestions_admin_all ON public.place_suggestions;

DROP POLICY IF EXISTS place_suggestions_admin ON public.place_suggestions;
CREATE POLICY place_suggestions_admin ON public.place_suggestions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
