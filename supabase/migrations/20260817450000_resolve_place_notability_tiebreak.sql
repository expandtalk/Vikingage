-- resolve_place: notabilitets-tiebreak för HOMONYMER. Tidigare 'order by prio asc limit 1' → bland 153
-- likalydande "Sandviken" (alla prio 5, place_names) valdes en GODTYCKLIG (en liten vik i Jämtland),
-- inte den kända staden. Nu bär place_names-grenen wikidata_sitelinks (backfyllt för svenska tätorter,
-- scripts/data/ingest-place-notability.mjs) och sorteringen tiebreak:ar 'pop desc' INOM samma prio.
-- Kuraterade typer (kyrka/runsten/kultplats …) har lägre prio och vinner fortfarande på prio.
-- KÄLLKRITIK: notabilitet = Wikipedia-språklänkar (Wikidata), en objektiv proxy — ingen redaktionell
-- rangordning. Orter utan sitelinks (pop=0) faller efter en namnlik ort som HAR det.

create or replace function public.resolve_place(p_q text)
returns table(lat double precision, lng double precision, zoom integer, kind text, place_name text)
language sql stable as $function$
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
    -- place_names: bär notabilitet (wikidata_sitelinks) så den KÄNDA orten vinner bland homonymer.
    select pn.lat, pn.lng, 12, 'place', pn.name, 5, coalesce(pn.wikidata_sitelinks, 0)
    from public.place_names pn, q where lower(pn.name) = q.t and pn.lat is not null
  ) hits
  order by prio asc, pop desc nulls last
  limit 1;
$function$;
