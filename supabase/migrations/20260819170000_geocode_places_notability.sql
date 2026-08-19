-- Fix: geocode_places (släktforskning/bygd-dossier) valde godtycklig homonym → "Kalmar" hamnade i
-- Jämtland i st.f. staden i Småland. Nu tiebreak på wikidata_sitelinks desc (samma notabilitets-
-- princip som resolve_place), så mest kända orten vinner. Jfr memory place-notability-homonym-resolution.
CREATE OR REPLACE FUNCTION public.geocode_places(names text[])
 RETURNS TABLE(name text, lat double precision, lng double precision)
 LANGUAGE sql STABLE
AS $function$
  select distinct on (lower(p.name)) p.name,
         ST_Y(ST_Centroid(p.geom))::double precision,
         ST_X(ST_Centroid(p.geom))::double precision
  from place_names p
  where lower(p.name) = any(select lower(unnest(names))) and p.geom is not null
  order by lower(p.name), coalesce(p.wikidata_sitelinks,0) desc, p.name;
$function$;
