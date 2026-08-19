-- Sockenvy-berikning: nyckeltal per socken (yta, runstenar, kyrkor, fornlämningar, äldsta belägg).
-- Spatial räkning mot admin_boundaries (level='socken'). runic_inscriptions.coordinates = native point
-- (lng,lat). Källkritik: räknar bara det som HAR koordinat/geom — inga gissningar.
create or replace function public.socken_dossier(p_name text)
returns table(name text, area_km2 numeric, runestones integer, churches integer, heritage integer, earliest_year integer)
language sql stable as $$
  with s as (
    select geom, name from public.admin_boundaries
    where level='socken' and lower(name)=lower(p_name)
    order by ST_Area(geom) desc limit 1
  )
  select s.name,
    round((ST_Area(s.geom::geography)/1e6)::numeric, 1),
    (select count(*) from public.runic_inscriptions r where r.coordinates is not null
       and ST_Contains(s.geom, ST_SetSRID(ST_MakePoint((r.coordinates)[0], (r.coordinates)[1]), 4326)))::int,
    (select count(*) from public.ecclesiastical_sites e where e.geom is not null and ST_Contains(s.geom, e.geom))::int,
    (select count(*) from public.heritage_sites h where h.geom is not null and ST_Contains(s.geom, h.geom))::int,
    (select min(earliest_attestation_year) from public.place_names pn
       where lower(pn.name)=lower(p_name) and earliest_attestation_year is not null)::int
  from s;
$$;
