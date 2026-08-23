-- #4: speed up the charter free-text (q=) path (was ~2.4s, a full seq scan of sdhk.letters_raw with a
-- per-row search_fold ILIKE). search_fold was STABLE only because it wrapped the 1-arg unaccent(text)
-- (which resolves its dictionary via search_path). Switch to the 2-arg unaccent('unaccent'::regdictionary,
-- text) form, which IS immutable, and mark the function IMMUTABLE. Output is byte-identical (verified:
-- 0 mismatches over 10007 real rows). This lets us build a functional GIN trigram index on the folded
-- charter blob (and makes every other search_fold ILIKE on the site indexable in future).
CREATE OR REPLACE FUNCTION public.search_fold(t text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public', 'extensions'
AS $function$
  select translate(
    extensions.unaccent('extensions.unaccent'::regdictionary,
      translate(lower(coalesce(t, '')), 'åäöøæ', E'\x01\x02\x03\x03\x02')),
    E'\x01\x02\x03', 'åäö')
$function$;

-- GIN trigram index on the exact folded expression medieval_charters_browse filters on.
CREATE INDEX IF NOT EXISTS idx_letters_raw_folded_trgm
  ON sdhk.letters_raw USING gin (
    public.search_fold(coalesce(summary,'')||' '||coalesce(place_raw,'')||' '||coalesce(author_raw,'')) gin_trgm_ops
  );

-- The trgm index makes the q= filter ~20x faster (2.4s->~120ms) with a literal pattern, but
-- medieval_charters_browse is a SECURITY DEFINER SQL function whose cached GENERIC plan can't exploit
-- the trigram pattern (unknown at plan time) and seq-scans. Force per-call custom plans so it uses the index.
ALTER FUNCTION public.medieval_charters_browse(text,text,text,integer,boolean,integer,integer,jsonb,integer,integer)
  SET plan_cache_mode TO 'force_custom_plan';
