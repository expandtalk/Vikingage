-- Extend resolve_place's church-variant normalization: besides "<X> gamla|nya kyrka(n)" -> "<X> kyrka(n)",
-- also try "-> <X> kyrkoruin". Demolished medieval churches are catalogued in heritage_sites as
-- "<X> kyrkoruin" (e.g. Tängs kyrkoruin, 58.4005/12.8122, where Vg 108/109 stand). Resolves to that
-- feature's REAL coordinate (no fabrication), ranked below any exact match. Rescues Tängs (the parish
-- merged into Håle-Täng in 1883, so there is no "Tängs kyrka" sibling to normalize toward).
CREATE OR REPLACE FUNCTION public.resolve_place(p_q text)
 RETURNS TABLE(lat double precision, lng double precision, zoom integer, kind text, place_name text)
 LANGUAGE sql
 STABLE
AS $function$
  with q as (
    select
      coalesce(public.normalize_search_query(p_q), lower(btrim(p_q))) as t,
      nullif(lower(btrim(regexp_replace(p_q, '\s+(gamla|nya)\s+(kyrka|kyrkan)', ' \2', 'i'))),
             coalesce(public.normalize_search_query(p_q), lower(btrim(p_q)))) as t2,
      nullif(lower(btrim(regexp_replace(p_q, '\s+(gamla|nya)\s+(kyrka|kyrkan)', ' kyrkoruin', 'i'))),
             coalesce(public.normalize_search_query(p_q), lower(btrim(p_q)))) as t3
  )
  select lat, lng, zoom, kind, place_name from (
    select (cs.coordinates)[1] as lat, (cs.coordinates)[0] as lng, 16 as zoom,
           'christian_site' as kind, cs.name as place_name, 1 as prio, null::int as pop,
           case when lower(cs.name) = q.t then 0 else 1 end as ex
    from public.christian_sites cs, q where lower(cs.name) in (q.t, q.t2, q.t3) and cs.coordinates is not null
    union all
    select hs.lat, hs.lng, 16, 'heritage_site', hs.name, 2, null::int, case when lower(hs.name)=q.t then 0 else 1 end
    from public.heritage_sites hs, q where lower(hs.name) in (q.t, q.t2, q.t3) and hs.lat is not null
    union all
    select es.lat, es.lng, 16, 'church', es.name, 2, null::int, case when lower(es.name)=q.t then 0 else 1 end
    from public.ecclesiastical_sites es, q where lower(es.name) in (q.t, q.t2, q.t3) and es.lat is not null
    union all
    select (ri.coordinates)[1], (ri.coordinates)[0], 15, 'inscription', coalesce(ri.name, ri.signum), 2, null::int,
           case when lower(ri.name)=q.t or lower(ri.signum)=q.t then 0 else 1 end
    from public.runic_inscriptions ri, q where (lower(ri.name) in (q.t,q.t2,q.t3) or lower(ri.signum) in (q.t,q.t2,q.t3)) and ri.coordinates is not null
    union all
    select cu.lat, cu.lng, 15, 'cult_site', cu.name, 3, null::int, case when lower(cu.name)=q.t then 0 else 1 end
    from public.cult_sites cu, q where lower(cu.name) in (q.t,q.t2,q.t3) and cu.lat is not null
    union all
    select mo.lat, mo.lng, 15, 'museum_object', mo.name, 3, null::int, case when lower(mo.name)=q.t then 0 else 1 end
    from public.museum_objects mo, q where lower(mo.name) in (q.t,q.t2,q.t3) and mo.lat is not null
    union all
    select (vc.coordinates)[1] as lat, (vc.coordinates)[0] as lng, 13, 'city', vc.name, 2, 1000000, case when lower(vc.name)=q.t then 0 else 1 end
    from public.viking_cities vc, q where lower(vc.name) in (q.t,q.t2,q.t3) and vc.coordinates is not null
    union all
    select pn.lat, pn.lng, 12, 'place', pn.name, 5, coalesce(pn.wikidata_sitelinks, 0), case when lower(pn.name)=q.t then 0 else 1 end
    from public.place_names pn, q where lower(pn.name) in (q.t,q.t2,q.t3) and pn.lat is not null
  ) hits
  order by ex asc, prio asc, pop desc nulls last
  limit 1;
$function$;
