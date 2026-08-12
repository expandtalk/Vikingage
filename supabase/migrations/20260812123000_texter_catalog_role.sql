-- /texter (RPC source_catalog) visade HELA historical_sources ofiltrerat → ~77 citat-/bibliografi-
-- poster (RAÄ/Fornsök, Google Places API, VERIFY-stubbar, webb, modern forskning) hamnade i
-- "Övriga källor" och fick sidan att se ut som en databasdump. historical_sources gör dubbeltjänst:
--   (a) läsbara VERK (Edda, lagar, sagor, krönikor) — hör hemma i /texter,
--   (b) modern FORSKNING — hör egentligen till forskarlagret (sources + research_scholars, /researchers),
--   (c) ren PROVENIENS (webb/arkiv/API/stub) — citat för claim-liggaren, hör till entiteternas källförteckningar.
-- catalog_role delar upp dem. /texter visar bara 'work'. 'scholarship' rekoncilieras till forskarlagret
-- i ett separat, granskat steg (drag 2). Reversibelt: byt bara catalog_role om något är felklassat.

ALTER TABLE public.historical_sources
  ADD COLUMN IF NOT EXISTS catalog_role text NOT NULL DEFAULT 'work';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'historical_sources_catalog_role_chk') THEN
    ALTER TABLE public.historical_sources
      ADD CONSTRAINT historical_sources_catalog_role_chk
      CHECK (catalog_role IN ('work','scholarship','provenance'));
  END IF;
END $$;

-- Regelbaserad backfill. Ordning: WORK (primärkälla) → PROVENIENS (webb/arkiv/API/stub) → resten = SCHOLARSHIP.
UPDATE public.historical_sources hs SET catalog_role = sub.role
FROM (
  SELECT c.id,
    CASE
      WHEN c.n_text > 0 THEN 'work'
      WHEN c.work_type IN ('edda_poem','saga','krönika','annaler','lag','landskapslag','landslag','stadslag','stadga','epos','hagiografi','biografi','historisk biografi','itinerarium','reseskildring','traktat') THEN 'work'
      WHEN c.written_year IS NOT NULL AND c.written_year < 1700 THEN 'work'
      WHEN c.author ILIKE 'Snorri%' OR (c.title ILIKE '%saga%' AND c.author ILIKE 'ed.%') OR c.title ILIKE '%Gesta Wulinensis%'
        OR c.author ILIKE 'Prokopios%' OR c.author ILIKE 'Rimbert%' OR c.author ILIKE 'Saxo%'
        OR c.author ILIKE 'Adam av Bremen%' OR c.author ILIKE 'Nestor%' THEN 'work'
      WHEN c.title ILIKE 'VERIFY%' OR c.author ILIKE 'VERIFY%' OR c.author ILIKE '%wikipedia%'
        OR c.author ILIKE '%.se' OR c.author ILIKE '%.com' OR c.author ILIKE '%.dk' OR c.author ILIKE '%.org'
        OR c.author ILIKE 'Riksantikvarie%' OR c.title ILIKE '%API%' OR c.author ILIKE '%museum%'
        OR c.author ILIKE '%Länsstyrelse%' OR c.author ILIKE '%fastighetsverk%' OR c.author ILIKE '%Sprog- og Litteratur%'
        OR c.title ILIKE '%Diplomatarium%' OR c.author ILIKE 'Nordisk familjebok%' OR c.author ILIKE '%Societas Heraldica%'
        OR c.title ILIKE '%Adelsvapen-Wiki%' OR c.title ILIKE 'Eddukvæði%' OR c.author ILIKE '%myntverkst%'
        OR c.author ILIKE '%Kievrus%' OR c.author ILIKE 'Numismatisk standard%' OR c.author ILIKE 'Olika %' THEN 'provenance'
      ELSE 'scholarship'
    END AS role
  FROM (
    SELECT h.id, h.title, h.author, h.work_type, h.written_year,
      (SELECT count(*) FROM public.source_texts st WHERE st.source_id = h.id) AS n_text
    FROM public.historical_sources h
  ) c
) sub
WHERE sub.id = hs.id;

-- source_catalog: visa bara läsbara verk i /texter.
CREATE OR REPLACE FUNCTION public.source_catalog()
 RETURNS TABLE(id uuid, title text, title_en text, author text, work_type text, collection text, meter text, reliability text, stanza_count bigint)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT hs.id, hs.title, hs.title_en, hs.author, hs.work_type, hs.collection, hs.meter, hs.reliability::text,
    (SELECT count(*) FROM source_texts st WHERE st.source_id = hs.id)
  FROM historical_sources hs
  WHERE hs.catalog_role = 'work'
  ORDER BY hs.title
$function$;
