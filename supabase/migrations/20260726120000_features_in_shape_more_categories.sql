-- Räckviddsmätaren: fler kategorier + per-typ-uppdelning av kulturlagret.
--
-- Daniel vill mäta fler saker i räckviddssonden (och hällristningar/gravfält/… som
-- egna kategorier). Utökar features_in_shape med:
--   * cult_sites (kultplatser/gudar), coins (mynt), thing_sites (tingsplatser) — listor + antal
--   * counts.kulturlager_by_type = EXAKT antal per raa_type (hällristning/gravfält/…),
--     så per-typ-siffran inte påverkas av 1500-cappen på objektlistan.
-- Returtyp oförändrad (json) → CREATE OR REPLACE räcker, inga grants rörs.

CREATE OR REPLACE FUNCTION public.features_in_shape(p_lat double precision, p_lng double precision, radius_km double precision, shape text DEFAULT 'circle'::text)
 RETURNS json
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
declare
  center geography := ST_SetSRID(ST_MakePoint(p_lng,p_lat),4326)::geography;
  r_m double precision := radius_km*1000;
  poly geometry;
  azis double precision[];
  ring geometry[] := array[]::geometry[];
  a double precision;
begin
  if shape = 'square' then azis := array[45,135,225,315];
  elsif shape = 'hexagon' then azis := array[0,60,120,180,240,300];
  end if;

  if azis is null then
    poly := ST_Buffer(center, r_m)::geometry;
  else
    foreach a in array azis loop
      ring := ring || ST_Project(center, r_m, radians(a))::geometry;
    end loop;
    ring := ring || ring[1];
    poly := ST_MakePolygon(ST_MakeLine(ring));
  end if;

  return json_build_object(
    'shape', shape, 'radius_km', radius_km,
    'place_names', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from
      (select pn.name, pn.lat, pn.lng, pn.element_category as category from place_names pn
       where pn.geom is not null and pn.source is distinct from 'osm' and ST_Covers(poly, pn.geom) limit 1500) x),
    'kulturlager', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from
      (select h.name, h.raa_type as type, h.lat, h.lng from heritage_sites h
       where h.geom is not null and ST_Covers(poly, h.geom) limit 1500) x),
    'runestones', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from
      (select ri.signum, (ri.coordinates)[1] as lat, (ri.coordinates)[0] as lng from runic_inscriptions ri
       where ri.coordinates is not null and ST_Covers(poly, ST_SetSRID(ST_MakePoint((ri.coordinates)[0],(ri.coordinates)[1]),4326)) limit 1500) x),
    'fortresses', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from
      (select vf.name, vf.fortress_type as type, (vf.coordinates)[1] as lat, (vf.coordinates)[0] as lng from viking_fortresses vf
       where vf.coordinates is not null and ST_Covers(poly, ST_SetSRID(ST_MakePoint((vf.coordinates)[0],(vf.coordinates)[1]),4326)) limit 1500) x),
    -- NYA kategorier:
    'cult_sites', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from
      (select cs.name, coalesce(cs.deity, cs.type) as type, cs.lat, cs.lng from cult_sites cs
       where cs.lat is not null and cs.lng is not null
         and ST_Covers(poly, ST_SetSRID(ST_MakePoint(cs.lng,cs.lat),4326)) limit 1500) x),
    'coins', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from
      (select co.name, co.denomination as type, (co.coordinates)[1] as lat, (co.coordinates)[0] as lng from coins co
       where co.coordinates is not null
         and ST_Covers(poly, ST_SetSRID(ST_MakePoint((co.coordinates)[0],(co.coordinates)[1]),4326)) limit 1500) x),
    'thing_sites', (select coalesce(json_agg(row_to_json(x)),'[]'::json) from
      (select ts.name, ts.thing_type as type, ts.lat, ts.lng from thing_sites ts
       where ts.geom is not null and ST_Covers(poly, ts.geom) limit 1500) x),
    'counts', json_build_object(
      'place_names_curated', (select count(*) from place_names pn where pn.geom is not null and pn.source is distinct from 'osm' and ST_Covers(poly, pn.geom)),
      'place_names_osm', (select count(*) from place_names pn where pn.geom is not null and pn.source = 'osm' and ST_Covers(poly, pn.geom)),
      'kulturlager', (select count(*) from heritage_sites h where h.geom is not null and ST_Covers(poly, h.geom)),
      'kulturlager_by_type', (select coalesce(json_object_agg(type, n),'{}'::json) from
        (select h.raa_type as type, count(*) as n from heritage_sites h
         where h.geom is not null and ST_Covers(poly, h.geom) group by h.raa_type) t),
      'runestones', (select count(*) from runic_inscriptions ri where ri.coordinates is not null and ST_Covers(poly, ST_SetSRID(ST_MakePoint((ri.coordinates)[0],(ri.coordinates)[1]),4326))),
      'fortresses', (select count(*) from viking_fortresses vf where vf.coordinates is not null and ST_Covers(poly, ST_SetSRID(ST_MakePoint((vf.coordinates)[0],(vf.coordinates)[1]),4326))),
      'cult_sites', (select count(*) from cult_sites cs where cs.lat is not null and cs.lng is not null and ST_Covers(poly, ST_SetSRID(ST_MakePoint(cs.lng,cs.lat),4326))),
      'coins', (select count(*) from coins co where co.coordinates is not null and ST_Covers(poly, ST_SetSRID(ST_MakePoint((co.coordinates)[0],(co.coordinates)[1]),4326))),
      'thing_sites', (select count(*) from thing_sites ts where ts.geom is not null and ST_Covers(poly, ts.geom)),
      'area_km2', round((ST_Area(poly::geography)/1000000)::numeric,1)
    )
  );
end $function$;
