-- Normalisera fiskesäsong → season_months smallint[] (hanterar fler-intervall vår+höst, t.ex.
-- 'mar-maj, okt-nov' → {3,4,5,10,11}). Lär nearby_experiences honorera season_months + ny param
-- p_ignore_season (platsforskning visar allt året runt med säsong i popup) + returnera subtype/season.
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS season_months smallint[];
COMMENT ON COLUMN public.experiences.season_months IS 'Normaliserade säsongsmånader (1-12), hanterar fler-intervall (vår+höst). Härledd ur facts.season för fiske.';

UPDATE public.experiences SET season_months = CASE facts->>'season'
  WHEN 'mar-sep' THEN ARRAY[3,4,5,6,7,8,9]
  WHEN 'mar-okt' THEN ARRAY[3,4,5,6,7,8,9,10]
  WHEN 'mar-maj, okt-nov' THEN ARRAY[3,4,5,10,11]
  WHEN 'mar-apr, okt-nov' THEN ARRAY[3,4,10,11]
  WHEN 'apr-maj, sep-nov' THEN ARRAY[4,5,9,10,11]
  WHEN 'dec-apr' THEN ARRAY[12,1,2,3,4]
  WHEN 'året runt, bäst okt-apr' THEN ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]
  WHEN 'apr-okt' THEN ARRAY[4,5,6,7,8,9,10]
  WHEN 'jun-aug' THEN ARRAY[6,7,8]
  WHEN 'jun-sep' THEN ARRAY[6,7,8,9]
  WHEN 'mar-maj, okt-dec' THEN ARRAY[3,4,5,10,11,12]
  WHEN 'apr-jun' THEN ARRAY[4,5,6]
  WHEN 'jun-sep gös' THEN ARRAY[6,7,8,9]
  WHEN 'året runt, bäst maj-sep lax' THEN ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]
  WHEN 'öring mar-maj, makrill jun-sep' THEN ARRAY[3,4,5,6,7,8,9]
  WHEN 'jun-sep makrill' THEN ARRAY[6,7,8,9]
  ELSE season_months
END::smallint[]
WHERE category='fiske';

DROP FUNCTION IF EXISTS public.nearby_experiences(double precision, double precision, double precision, integer);

CREATE OR REPLACE FUNCTION public.nearby_experiences(
  p_lat double precision, p_lng double precision, p_radius_km double precision,
  p_limit integer DEFAULT 200, p_ignore_season boolean DEFAULT false)
RETURNS TABLE(feature_type text, feature_id text, label text, lat double precision, lng double precision,
  distance_km double precision, parish text, source_uri text, subtype text, season text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  with cur as (select extract(month from now())::int as m)
  select e.category, e.id::text, e.name, e.lat, e.lng,
    (6371*acos(least(1,greatest(-1,
       cos(radians(p_lat))*cos(radians(e.lat))*cos(radians(e.lng)-radians(p_lng))
       + sin(radians(p_lat))*sin(radians(e.lat)))))) as distance_km,
    e.municipality, e.source_uri, e.subtype, (e.facts->>'season')
  from experiences e, cur
  where e.lat is not null and e.lng is not null
    and (
      p_ignore_season
      or (e.season_months is not null and cur.m = any(e.season_months))
      or (e.season_months is null and (
           e.season_from_month is null or e.season_to_month is null
           or (e.season_from_month <= e.season_to_month and cur.m between e.season_from_month and e.season_to_month)
           or (e.season_from_month >  e.season_to_month and (cur.m >= e.season_from_month or cur.m <= e.season_to_month))))
    )
    and (6371*acos(least(1,greatest(-1,
       cos(radians(p_lat))*cos(radians(e.lat))*cos(radians(e.lng)-radians(p_lng))
       + sin(radians(p_lat))*sin(radians(e.lat)))))) <= p_radius_km
  order by distance_km limit p_limit;
$function$;

GRANT EXECUTE ON FUNCTION public.nearby_experiences(double precision, double precision, double precision, integer, boolean) TO anon, authenticated;
