-- Kart-gränser: kommun- och socken-linjer nära en punkt (för kart-overlay i svarspanel/ortshubb).
-- Förenklad geometri (ST_Simplify ~50 m) → liten payload. Radie i meter; cap för att inte spränga.
create or replace function public.boundaries_near(
  p_lat double precision, p_lng double precision,
  p_radius_m integer default 15000, p_levels text[] default array['kommun','socken']
) returns table(level text, name text, geojson text)
language sql stable as $$
  select b.level, b.name, ST_AsGeoJSON(ST_Simplify(b.geom, 0.0005))::text
  from public.admin_boundaries b
  where b.level = any(p_levels)
    and ST_DWithin(b.geom::geography, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_m)
  order by b.level, b.name
  limit 60;
$$;
