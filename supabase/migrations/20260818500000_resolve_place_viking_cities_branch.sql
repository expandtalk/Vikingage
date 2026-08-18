-- resolve_place saknade en viking_cities-gren → "Birka" föll på en nordlig place_names-post
-- (64.75,20.05) i st.f. Björkö i Mälaren (viking_cities, 59.34,17.55). Lägg viking_cities som
-- marquee-centralorter (prio 2, hög pop) så de vinner homonymer före place_names (prio 5).
CREATE OR REPLACE FUNCTION public.resolve_place(p_q text)
 RETURNS TABLE(lat double precision, lng double precision, zoom integer, kind text, place_name text)
 LANGUAGE sql STABLE AS $function$
  with q as (select lower(btrim(p_q)) as t)
  select lat, lng, zoom, kind, place_name from (
    select (cs.coordinates)[1] as lat, (cs.coordinates)[0] as lng, 16 as zoom,
           'christian_site' as kind, cs.name as place_name, 1 as prio, null::int as pop
    from public.christian_sites cs, q where lower(cs.name) = q.t and cs.coordinates is not null
    union all
    select hs.lat, hs.lng, 16, 'heritage_site', hs.name, 2, null::int
    from public.heritage_sites hs, q where lower(hs.name) = q.t and hs.lat is not null
    union all
    select es.lat, es.lng, 16, 'church', es.name, 2, null::int
    from public.ecclesiastical_sites es, q where lower(es.name) = q.t and es.lat is not null
    union all
    select (ri.coordinates)[1], (ri.coordinates)[0], 15, 'inscription', coalesce(ri.name, ri.signum), 2, null::int
    from public.runic_inscriptions ri, q where (lower(ri.name) = q.t or lower(ri.signum) = q.t) and ri.coordinates is not null
    union all
    select cu.lat, cu.lng, 15, 'cult_site', cu.name, 3, null::int
    from public.cult_sites cu, q where lower(cu.name) = q.t and cu.lat is not null
    union all
    select mo.lat, mo.lng, 15, 'museum_object', mo.name, 3, null::int
    from public.museum_objects mo, q where lower(mo.name) = q.t and mo.lat is not null
    union all
    -- viking_cities: marquee-centralorter (Birka/Björkö, Sigtuna, Hedeby…) vinner homonymer.
    select (vc.coordinates)[1] as lat, (vc.coordinates)[0] as lng, 13, 'city', vc.name, 2, 1000000
    from public.viking_cities vc, q where lower(vc.name) = q.t and vc.coordinates is not null
    union all
    select pn.lat, pn.lng, 12, 'place', pn.name, 5, coalesce(pn.wikidata_sitelinks, 0)
    from public.place_names pn, q where lower(pn.name) = q.t and pn.lat is not null
  ) hits
  order by prio asc, pop desc nulls last
  limit 1;
$function$;
