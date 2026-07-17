-- Steg 1: koordinat-konsolidering (2026-07-18)
-- Gör EN kanonisk koordinat per inskrift av den fungerande signum-modellen
-- (runic_inscriptions.coordinates + additional_coordinates), bär med källa/
-- konfidens, och rensar testdata. Ändrar INTE den orphanade legacy-`coordinates`-
-- tabellen (7166, olänkbar) och rör inte gap-fillen (~1215 saknar; kommer separat
-- från Uppsala-rundata via signum).
-- Kör i SQL-editorn; sedan: supabase migration repair --status applied 20260718120000
-- Reversibelt: de nya kolumnerna kan droppas; inga rader raderas utom DEMO-testdata.

begin;

-- 1. Spårbarhet: varifrån koordinaten kommer + hur säker den är.
alter table public.runic_inscriptions
  add column if not exists coord_source text,
  add column if not exists coord_confidence text;

-- 2. Rensa testdata (1 rad: DEMO_001, "Vimose, Fyn").
delete from public.runic_inscriptions where signum ilike 'DEMO\_%' escape '\';

-- 3. Märk befintliga egna koordinater (proveniens okänd → 'unknown').
update public.runic_inscriptions
set coord_source = 'original_field', coord_confidence = 'unknown'
where coordinates is not null and coord_source is null;

-- 4. Backfyll saknade koordinater från bästa additional_coordinates per signum.
--    Prioritet: konfidens high>medium>low, och icke-nominatim före nominatim.
update public.runic_inscriptions ri
set coordinates = point(ac.longitude, ac.latitude),
    coord_source = ac.source,
    coord_confidence = ac.confidence
from (
  select distinct on (signum)
         signum, latitude, longitude, source, confidence
  from public.additional_coordinates
  where latitude is not null and longitude is not null
  order by signum,
           case confidence when 'high' then 1 when 'medium' then 2 else 3 end,
           (source ilike '%nominatim%')::int   -- false(0) före true(1)
) ac
where ri.coordinates is null and ri.signum = ac.signum;

commit;

-- Verifiering (kör separat):
-- select
--   count(*) total,
--   count(coordinates) has_coord,
--   count(*) filter (where coord_confidence = 'low') as low_conf,
--   count(*) filter (where coordinates is null) as still_missing
-- from public.runic_inscriptions;
