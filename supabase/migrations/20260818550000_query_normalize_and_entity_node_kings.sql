-- Sök-QA-fix 1+2: (1) query-normalisering (strippar frågeord så "hur gammal är kalmar"→"kalmar",
-- "vem var gustav vasa?"→"gustav vasa", "stockholm historia"→"stockholm"); (2) entity_node täcker
-- nu historical_kings (kungar/drottningar hade description men saknades helt) + normaliserad match.
-- Även resolve_place normaliserar sin fråga.

create or replace function public.normalize_search_query(p text)
returns text language sql immutable as $$
  with a as (select lower(btrim(coalesce(p,''))) s),
  b as (select regexp_replace(s,
    '^(vem var |vem är |vad var |vad är |vad berättar |vad hände (vid |i )|hur gammal(t)? är |var bodde |var ligger |var låg |var finns |vilket är |vilken är |vilka var |när blev |när var |berätta om )',
    '') s from a),
  c as (select regexp_replace(s, ' (historia|historien|podd|podcast|tidning)$', '') s from b),
  d as (select btrim(regexp_replace(s, '[?.!,]+$', '')) s from c)
  select nullif(s,'') from d;
$$;

create or replace function public.entity_node(p_name text)
 returns table(kind text, title text, description text, dating text)
 language sql stable set search_path to 'public' as $function$
  with n as (select coalesce(normalize_search_query(p_name), lower(btrim(p_name))) nm)
  select kind, title, description, dating from (
    -- Kungar & drottningar (högst prioritet) — matchar namn el. namnvariation, normaliserat.
    select (case when lower(coalesce(k.gender,''))='female' or k.role ilike '%drottning%' then 'Drottning'
                 else coalesce(nullif(btrim(k.role),''),'Regent') end)::text as kind,
           k.name as title, k.description,
           (case when k.reign_start is not null then k.reign_start::text || coalesce('–'||k.reign_end::text,'')
                 when k.birth_year is not null then k.birth_year::text || coalesce('–'||k.death_year::text,'') end)::text as dating,
           0 as pri
    from historical_kings k, n
    where (lower(k.name) = n.nm or n.nm = any(select lower(v) from unnest(coalesce(k.name_variations,'{}'::text[])) v))
      and coalesce(k.description,'') <> ''
    union all
    select 'Kyrka'::text, e.name, e.description, e.founded_year::text, 1
    from ecclesiastical_sites e, n where lower(e.name) = n.nm and coalesce(e.description,'') <> ''
    union all
    select coalesce(cs.site_type,'Kristen plats'), cs.name, cs.description, null, 2
    from christian_sites cs, n where lower(cs.name) = n.nm and coalesce(cs.description,'') <> ''
    union all
    select h.raa_type, h.name, h.description, h.period, 3
    from heritage_sites h, n where lower(h.name) = n.nm and coalesce(h.description,'') <> ''
  ) x order by pri limit 1;
$function$;

create or replace function public.resolve_place(p_q text)
 returns table(lat double precision, lng double precision, zoom integer, kind text, place_name text)
 language sql stable as $function$
  with q as (select coalesce(public.normalize_search_query(p_q), lower(btrim(p_q))) as t)
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
    select (vc.coordinates)[1] as lat, (vc.coordinates)[0] as lng, 13, 'city', vc.name, 2, 1000000
    from public.viking_cities vc, q where lower(vc.name) = q.t and vc.coordinates is not null
    union all
    select pn.lat, pn.lng, 12, 'place', pn.name, 5, coalesce(pn.wikidata_sitelinks, 0)
    from public.place_names pn, q where lower(pn.name) = q.t and pn.lat is not null
  ) hits
  order by prio asc, pop desc nulls last
  limit 1;
$function$;
