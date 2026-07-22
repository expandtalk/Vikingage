-- Fas A / A5: säkerhetshärdning (admin-backend-modernisering).
-- Applicerad via MCP mot fjärr-DB (db push trasig i detta repo) — denna fil är proveniens.
--
-- 1) Konvertera 6 SECURITY DEFINER-vyer till security_invoker.
--    Verifierat säkert: underliggande tabeller (relationship, entity_registry,
--    rel_predicates, runic_inscriptions, additional_coordinates, parishes) har publik
--    SELECT-policy (qual=true) + SELECT-grant för anon/authenticated, så publika
--    läsningar bevaras. INSTEAD OF-triggrarna på kompat-vyerna påverkas inte av flippen.
ALTER VIEW public.runic_with_coordinates   SET (security_invoker = on);
ALTER VIEW public.v_parish_unresolved      SET (security_invoker = on);
ALTER VIEW public.theme_links              SET (security_invoker = on);
ALTER VIEW public.king_inscription_links   SET (security_invoker = on);
ALTER VIEW public.source_inscription_links SET (security_invoker = on);
ALTER VIEW public.carver_inscription       SET (security_invoker = on);

-- 2) Pinna search_path på 12 funktioner (injektionshärdning).
--    public + extensions täcker pg_trgm/vector/postgis (public) samt pgcrypto/uuid-ossp (extensions).
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure::text AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'validate_role_change','extract_primary_signum','log_security_event',
        'get_entity_v1','neighbors_v1','search_v1','match_search_docs',
        'get_artefact_inscriptions','artefact_types_v1','named_stones_v1',
        'get_inscription_page','runestone_stats_v1')
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, extensions', r.sig);
  END LOOP;
END $$;
