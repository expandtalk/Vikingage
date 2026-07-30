-- Finare paleo-strandmodell: METRISK relativ-havsnivå (RSL) per punkt vid VALFRITT år,
-- baserad på observerade landhöjningstakter i strandkontroll (11 kalibreringspunkter).
-- Går bortom polygonmodellens 950-tak → kan validera t.ex. Valdemars segelled ~1300.
-- Modell: RSL_höjd(år) ≈ landhöjning(mm/år) × (2000 − år) / 1000  (linjär förstaordning).
-- OBS: strandkontroll.geom är EPSG:3006 → vi mäter avstånd via wgs84-kolumnerna.
create or replace function paleo_rsl(p_lng double precision, p_lat double precision, p_year integer)
returns table(rsl_rise_m numeric, uplift_mmyr numeric, region text, dist_km numeric, confidence text)
language sql stable as $$
  with pt as (select ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography g)
  select round((k.landhojn_mmyr * (2000 - p_year) / 1000.0)::numeric, 2) as rsl_rise_m,
         k.landhojn_mmyr as uplift_mmyr,
         k.region,
         round((ST_Distance(ST_SetSRID(ST_MakePoint(k.lon_wgs84, k.lat_wgs84), 4326)::geography, (select g from pt)) / 1000)::numeric, 1) as dist_km,
         case when ST_Distance(ST_SetSRID(ST_MakePoint(k.lon_wgs84, k.lat_wgs84), 4326)::geography, (select g from pt)) < 30000 then 'hög'
              when ST_Distance(ST_SetSRID(ST_MakePoint(k.lon_wgs84, k.lat_wgs84), 4326)::geography, (select g from pt)) < 80000 then 'medel'
              else 'låg' end as confidence
  from strandkontroll k
  where k.landhojn_mmyr is not null
  order by ST_SetSRID(ST_MakePoint(k.lon_wgs84, k.lat_wgs84), 4326) <-> ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)
  limit 1;
$$;
grant execute on function paleo_rsl(double precision, double precision, integer) to anon, authenticated;

-- Metrisk RSL på ledpunkterna (vid routens slutår).
alter table trade_route_points add column if not exists rsl_rise_m numeric;
alter table trade_route_points add column if not exists rsl_confidence text;

update trade_route_points p
set rsl_rise_m = s.rsl_rise_m, rsl_confidence = s.confidence
from (
  select tp.id, r.rsl_rise_m, r.confidence
  from trade_route_points tp
  join trade_routes tr on tr.id = tp.route_id
  cross join lateral paleo_rsl(tp.lng, tp.lat, coalesce(tr.year_to, 950)) r
  where tp.lat is not null and tp.lng is not null
) s
where p.id = s.id;
