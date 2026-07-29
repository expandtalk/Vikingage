-- Allt inom gångavstånd (räckvidd) från en punkt: heritage_sites + christian_sites (kyrkor/kloster),
-- med avstånd i meter. Används av släktforskningssidan: "vad kunde anfadern nå till fots (~5000 steg)".
create or replace function features_near(p_lat double precision, p_lng double precision, radius_m integer default 4000)
returns table(kind text, name text, raa_type text, lat double precision, lng double precision, dist_m integer)
language sql stable as $$
  select q.kind, q.name, q.raa_type, q.lat, q.lng, q.dist_m from (
    select 'heritage'::text kind, h.name, h.raa_type, h.lat, h.lng,
           ST_Distance(h.geom::geography, ST_SetSRID(ST_MakePoint(p_lng,p_lat),4326)::geography)::int dist_m
    from heritage_sites h
    where h.geom is not null
      and ST_DWithin(h.geom::geography, ST_SetSRID(ST_MakePoint(p_lng,p_lat),4326)::geography, radius_m)
    union all
    select 'church'::text, c.name, 'kyrka/kloster', (c.coordinates)[1], (c.coordinates)[0],
           ST_Distance(ST_SetSRID(ST_MakePoint((c.coordinates)[0],(c.coordinates)[1]),4326)::geography,
                       ST_SetSRID(ST_MakePoint(p_lng,p_lat),4326)::geography)::int
    from christian_sites c
    where c.coordinates is not null
      and ST_DWithin(ST_SetSRID(ST_MakePoint((c.coordinates)[0],(c.coordinates)[1]),4326)::geography,
                     ST_SetSRID(ST_MakePoint(p_lng,p_lat),4326)::geography, radius_m)
  ) q order by q.dist_m limit 300;
$$;
grant execute on function features_near(double precision, double precision, integer) to anon, authenticated;
