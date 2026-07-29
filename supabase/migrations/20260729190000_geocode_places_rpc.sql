-- Geokodar sockennamn → centroid ur place_names. Publik (place_names är publikt läsbar).
-- Används av släktforskningssidan för att placera anfäders socknar på kartan (klientsidigt,
-- ingen släktdata lagras — bara publika ortnamn slås upp).
create or replace function geocode_places(names text[])
returns table(name text, lat double precision, lng double precision)
language sql stable as $$
  select distinct on (lower(p.name)) p.name,
         ST_Y(ST_Centroid(p.geom))::double precision,
         ST_X(ST_Centroid(p.geom))::double precision
  from place_names p
  where lower(p.name) = any(select lower(unnest(names))) and p.geom is not null
  order by lower(p.name), p.name;
$$;
grant execute on function geocode_places(text[]) to anon, authenticated;
