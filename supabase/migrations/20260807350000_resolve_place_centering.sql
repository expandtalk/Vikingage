-- Generell platsupplösare: explore-centreringen slog bara upp place_names, så en sökning på ett
-- kloster/kyrka/monument (t.ex. "Kalmars dominikankonvent (Svartbrödraklostret)") tog dig ingenstans.
-- resolve_place slår upp EXAKT namn i rätt entitetstabell och ger koordinat + lämplig zoom (specifik
-- byggnad = hög zoom så man faktiskt landar PÅ platsen). point-kolumner lagras (lng,lat): [0]=lng,[1]=lat.
-- Applicerad i prod via MCP; denna fil = repo-spegling. 2026-08-07.
create or replace function public.resolve_place(p_q text)
returns table(lat double precision, lng double precision, zoom int, kind text, place_name text)
language sql stable
as $$
  with q as (select lower(btrim(p_q)) as t)
  select lat, lng, zoom, kind, place_name from (
    select (cs.coordinates)[1] as lat, (cs.coordinates)[0] as lng, 16 as zoom,
           'christian_site' as kind, cs.name as place_name, 1 as prio
    from public.christian_sites cs, q where lower(cs.name) = q.t and cs.coordinates is not null
    union all
    select hs.lat, hs.lng, 16, 'heritage_site', hs.name, 2
    from public.heritage_sites hs, q where lower(hs.name) = q.t and hs.lat is not null
    union all
    select es.lat, es.lng, 16, 'church', es.name, 2
    from public.ecclesiastical_sites es, q where lower(es.name) = q.t and es.lat is not null
    union all
    select (ri.coordinates)[1], (ri.coordinates)[0], 15, 'inscription', coalesce(ri.name, ri.signum), 2
    from public.runic_inscriptions ri, q where (lower(ri.name) = q.t or lower(ri.signum) = q.t) and ri.coordinates is not null
    union all
    select cu.lat, cu.lng, 15, 'cult_site', cu.name, 3
    from public.cult_sites cu, q where lower(cu.name) = q.t and cu.lat is not null
    union all
    select mo.lat, mo.lng, 15, 'museum_object', mo.name, 3
    from public.museum_objects mo, q where lower(mo.name) = q.t and mo.lat is not null
    union all
    select pn.lat, pn.lng, 12, 'place', pn.name, 5
    from public.place_names pn, q where lower(pn.name) = q.t and pn.lat is not null
  ) hits
  order by prio asc
  limit 1;
$$;
grant execute on function public.resolve_place(text) to anon, authenticated;
