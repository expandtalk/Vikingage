-- Backfill place_names.province + socken via spatial point-in-polygon mot admin_boundaries.
-- Bakgrund: 88% av place_names (358k) saknade admin-attribut → homonymer (Backa/Berg/Almby) gick
-- ej att peka ut vid namnmatchning (t.ex. SOL-belägg-ingest). admin_boundaries har socken:2341 +
-- landskap:25 polygoner. Point-in-polygon (Backa→Bohuslän, Almby→Närke) bevisat.
-- Fyller ENDAST där null (bevarar de ~42k redan satta/kurerade). Punkt ur lat/lng (WGS84, SRID 4326).
create index if not exists admin_boundaries_geom_gix on public.admin_boundaries using gist (geom);

update public.place_names p set province = ab.name, updated_at = now()
from public.admin_boundaries ab
where ab.level = 'landskap' and ab.geom is not null
  and p.province is null and p.lat is not null and p.lng is not null
  and ST_Contains(ab.geom, ST_SetSRID(ST_MakePoint(p.lng, p.lat), 4326));

update public.place_names p set socken = ab.name, updated_at = now()
from public.admin_boundaries ab
where ab.level = 'socken' and ab.geom is not null
  and p.socken is null and p.lat is not null and p.lng is not null
  and ST_Contains(ab.geom, ST_SetSRID(ST_MakePoint(p.lng, p.lat), 4326));
