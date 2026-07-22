-- features_in_shape: räknar/listar lämningar INUTI en form (cirkel/fyrkant/hexagon)
-- kring en punkt, via punkt-i-polygon (ST_Covers). Applicerad via MCP execute_sql;
-- fil = proveniens. Formen byggs geodetiskt: cirkel = ST_Buffer(geography); fyrkant =
-- 4 hörn (azimut 45/135/225/315°), hexagon = 6 hörn (0/60/…/300°) via ST_Project.
-- counts = fullständiga (analysvärdet); dot-listor cappade till 1500/lager (kart-prestanda).
-- place_names delas i kurerade (ritas) och registret/OSM (räknas, ritas ej — annars 42k prickar).
create or replace function public.features_in_shape(p_lat double precision, p_lng double precision, radius_km double precision, shape text default 'circle')
returns json language plpgsql stable set search_path to 'public' as $$
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
    'counts', json_build_object(
      'place_names_curated', (select count(*) from place_names pn where pn.geom is not null and pn.source is distinct from 'osm' and ST_Covers(poly, pn.geom)),
      'place_names_osm', (select count(*) from place_names pn where pn.geom is not null and pn.source = 'osm' and ST_Covers(poly, pn.geom)),
      'kulturlager', (select count(*) from heritage_sites h where h.geom is not null and ST_Covers(poly, h.geom)),
      'runestones', (select count(*) from runic_inscriptions ri where ri.coordinates is not null and ST_Covers(poly, ST_SetSRID(ST_MakePoint((ri.coordinates)[0],(ri.coordinates)[1]),4326))),
      'fortresses', (select count(*) from viking_fortresses vf where vf.coordinates is not null and ST_Covers(poly, ST_SetSRID(ST_MakePoint((vf.coordinates)[0],(vf.coordinates)[1]),4326))),
      'area_km2', round((ST_Area(poly::geography)/1000000)::numeric,1)
    )
  );
end $$;
