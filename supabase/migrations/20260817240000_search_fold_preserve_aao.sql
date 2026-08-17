-- Sture: söket skiljer inte A/Ä/Å — "vala" matchar "väla"/"våla". Orsak: search_fold() kör
-- unaccent() som fäller å/ä/ö → a. I svenskan är å/ä/ö EGNA bokstäver, inte accenttecken.
-- Fix: skydda å/ä/ö (och Å/Ä/Ö) före unaccent med sentinel-tecken, unaccenta ÖVRIGA diakriter
-- (é→e, ü→u, à→a …), återställ sedan. ø→ö och æ→ä normaliseras fortfarande (nordiska varianter).
-- search_fold används bara i search_v1:s runtime-matchning (label_has_q + scoring); tsvektorerna
-- (swedish/simple) skiljer redan å/ä/ö → inget behöver byggas om.

create or replace function public.search_fold(t text)
returns text
language sql
stable
set search_path to 'public', 'extensions'
as $function$
  select translate(
    extensions.unaccent(
      -- Skydda de svenska bokstäverna: å→\x01 ä→\x02 ö→\x03 (ø→ö-sentinel, æ→ä-sentinel).
      translate(lower(coalesce(t, '')), 'åäöøæ', E'\x01\x02\x03\x03\x02')
    ),
    -- Återställ sentinels → å/ä/ö.
    E'\x01\x02\x03', 'åäö'
  )
$function$;
