-- nearby_experiences — säsongsfiltrerade upplevelser (experiences: badplatser m.fl.) nära en punkt.
-- Egen liten RPC (rör inte stora nearby_features) → merge:as klientsidigt i near me-listan.
-- Säsong: nuvarande månad (now()) måste ligga i [season_from_month, season_to_month] (wrap över
-- årsskifte hanterad; null säsong = året runt). Haversine-avstånd i km. SECURITY DEFINER (publik läsdata).
create or replace function public.nearby_experiences(
  p_lat double precision, p_lng double precision, p_radius_km double precision, p_limit integer default 200
) returns table(feature_type text, feature_id text, label text, lat double precision, lng double precision,
                distance_km double precision, parish text, source_uri text)
language sql stable security definer set search_path = public as $$
  with cur as (select extract(month from now())::int as m)
  select e.category, e.id::text, e.name, e.lat, e.lng,
    (6371*acos(least(1,greatest(-1,
       cos(radians(p_lat))*cos(radians(e.lat))*cos(radians(e.lng)-radians(p_lng))
       + sin(radians(p_lat))*sin(radians(e.lat)))))) as distance_km,
    e.municipality, e.source_uri
  from experiences e, cur
  where e.lat is not null and e.lng is not null
    and (e.season_from_month is null or e.season_to_month is null
      or (e.season_from_month <= e.season_to_month and cur.m between e.season_from_month and e.season_to_month)
      or (e.season_from_month >  e.season_to_month and (cur.m >= e.season_from_month or cur.m <= e.season_to_month)))
    and (6371*acos(least(1,greatest(-1,
       cos(radians(p_lat))*cos(radians(e.lat))*cos(radians(e.lng)-radians(p_lng))
       + sin(radians(p_lat))*sin(radians(e.lat)))))) <= p_radius_km
  order by distance_km limit p_limit;
$$;
grant execute on function public.nearby_experiences(double precision,double precision,double precision,integer) to anon, authenticated;
