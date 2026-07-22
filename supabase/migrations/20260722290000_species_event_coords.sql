-- Koordinatsättning av arter + händelse-koordinatkolumner. Applicerad via MCP execute_sql;
-- fil = proveniens. Tågerup ur Wikidata; övriga approximerade på LOKALITETSNIVÅ (region/ort,
-- ej exakt fyndpunkt) — flaggat. historical_events får lat/lng + generad geom; punktbara
-- händelser koordinatsatta (pandemier/klimat är diffusa → null).
update public.species_introductions set lat=55.856, lng=12.952 where site_name='Tågerup';
update public.species_introductions set lat=57.30,  lng=18.15  where site_name ilike 'Ajvide%';   -- Gotland, approx
update public.species_introductions set lat=58.33,  lng=13.47  where site_name ilike '%Gökhem%';
update public.species_introductions set lat=30.57,  lng=31.51  where site_name ilike 'Egypten%';  -- Bubastis
update public.species_introductions set lat=37.98,  lng=108.85 where site_name ilike 'Tongwan%';  -- Shaanxi, approx
update public.species_introductions set lat=44.90,  lng=65.80  where site_name='Dzhankent';       -- Kazakstan, approx
update public.species_introductions set lat=34.50,  lng=109.50 where site_name ilike 'Quanhucun%';-- Kina, approx

alter table public.historical_events add column if not exists lat double precision;
alter table public.historical_events add column if not exists lng double precision;
alter table public.historical_events add column if not exists geom geometry
  generated always as (case when lat is not null and lng is not null then ST_SetSRID(ST_MakePoint(lng,lat),4326) end) stored;
update public.historical_events set lat=58.33, lng=13.47 where event_name ilike 'Neolitisk pest%';
update public.historical_events set lat=56.06, lng=14.55 where event_name ilike 'Fiskeekonomi%';
