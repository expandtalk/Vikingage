-- (1) excursions_near — närmaste kurerade utflykter (railen visade tidigare ALLA utan närhet).
-- (2) entity_answer_context center-fallback — rena ortnamn (Färjestaden) fick center=null → hela
--     högerkolumnen + kartan tom. resolve_place(p_name) läggs som sista fallback i ctr (concept-safe;
--     ger tomt för viking/njord/svamp). Applicerad via scripts/data/patch-answer-center-fallback.mjs
--     (funktionen är stor/genererad → patchas med pg_get_functiondef + string-replace, repo-konvention).

create or replace function public.excursions_near(p_lat double precision, p_lng double precision, p_radius_km double precision default 60, p_limit int default 6)
 returns table(id text, name text, region text, dist_km double precision)
 language sql stable security definer set search_path to 'public'
as $function$
  select e.id, e.name, e.region,
    round((ST_Distance(ST_SetSRID(ST_MakePoint(e.coordinates[0], e.coordinates[1]),4326)::geography,
                       ST_SetSRID(ST_MakePoint(p_lng,p_lat),4326)::geography)/1000.0)::numeric,1)::double precision
  from excursions e
  where e.coordinates is not null
    and ST_DWithin(ST_SetSRID(ST_MakePoint(e.coordinates[0], e.coordinates[1]),4326)::geography,
                   ST_SetSRID(ST_MakePoint(p_lng,p_lat),4326)::geography, p_radius_km*1000)
  order by 4 asc limit p_limit;
$function$;
grant execute on function public.excursions_near(double precision,double precision,double precision,int) to anon, authenticated;
