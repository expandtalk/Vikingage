-- Runord-test v3: separata flaggor (för delad kohort) + REGION-MATCHAD baslinje (B).
--  p_exclude_moved / p_exclude_collections: ta bort risk-stenar var för sig.
--  p_medium: all|stone|portable|coin.
--  p_region_match: baslinjen dras BARA från samma landskap som träffarna → dödar korpus-skevheten
--    (annars ser ett Uppland-ord "nära allt" bara för att Uppland är tätt). Kräver province (backfilld).
drop function if exists runic_word_nn(text, text, text, text);
create or replace function runic_word_nn(
  p_term text, p_reference text,
  p_exclude_moved boolean default true, p_exclude_collections boolean default true,
  p_medium text default 'all', p_region_match boolean default false)
returns table(cohort text, n integer, median_m integer)
language sql stable as $$
  with refs as (
    select geom g from ecclesiastical_sites where p_reference='church' and geom is not null
    union all select ST_SetSRID(ST_MakePoint((coordinates)[0],(coordinates)[1]),4326) from swedish_hillforts where p_reference='fornborg' and coordinates is not null
    union all select geom from thing_sites where p_reference='thing' and geom is not null
    union all select ST_SetSRID(ST_MakePoint((coordinates)[0],(coordinates)[1]),4326) from viking_cities where p_reference='town' and coordinates is not null
    union all select geom from heritage_sites where p_reference='gravfalt' and geom is not null and raa_type ilike '%gravfält%'
  ),
  pil as (
    select round((coordinates)[1]::numeric,3) la, round((coordinates)[0]::numeric,3) lo
    from runic_inscriptions where coordinates is not null group by 1,2 having count(*) >= 15
  ),
  ins as (
    select ri.id, ri.transliteration, ri.object_type, ri.province prov,
      (lower(coalesce(ri.location,'')||' '||coalesce(ri.current_location,'')) like '%kyrk%'
       or exists (select 1 from inscription_locations o join inscription_locations cu
            on o.inscription_id=cu.inscription_id and o.role='original' and cu.role='current'
            where o.inscription_id=ri.id and o.lat is not null and cu.lat is not null
              and ST_Distance(ST_SetSRID(ST_MakePoint(o.lng,o.lat),4326)::geography,
                              ST_SetSRID(ST_MakePoint(cu.lng,cu.lat),4326)::geography) > 100)) moved,
      exists (select 1 from pil where pil.la=round((ri.coordinates)[1]::numeric,3) and pil.lo=round((ri.coordinates)[0]::numeric,3)) coll,
      coalesce(
        (select ST_SetSRID(ST_MakePoint(o.lng,o.lat),4326) from inscription_locations o
           where o.inscription_id=ri.id and o.role='original' and o.lat is not null limit 1),
        ST_SetSRID(ST_MakePoint((ri.coordinates)[0],(ri.coordinates)[1]),4326)) g
    from runic_inscriptions ri where ri.coordinates is not null
  ),
  filt as (
    select * from ins where g is not null
      and (p_medium='all'
        or (p_medium='stone'    and (object_type ilike '%runsten%' or object_type ilike '%runestone%' or object_type ilike '%gravhäll%'))
        or (p_medium='portable' and (object_type ilike '%pinne%' or object_type ilike '%träinskrift%' or object_type ilike '%runben%' or object_type ilike '%revben%' or object_type ilike '%märklapp%'))
        or (p_medium='coin'     and object_type ilike '%mynt%'))
      and (not p_exclude_moved or not moved)
      and (not p_exclude_collections or not coll)
  ),
  matched as (select * from filt where transliteration ilike '%'||p_term||'%'),
  mprov as (select distinct prov from matched where prov is not null),
  base as (
    select g from (
      select g from filt
      where (not p_region_match) or (prov is not null and prov in (select prov from mprov))
      order by random() limit 1200
    ) x
  ),
  coh as (select 'match'::text cohort, g from matched union all select 'baseline', g from base),
  nn as (
    select coh.cohort, ST_Distance(coh.g::geography, r.g::geography) d
    from coh cross join lateral (select g from refs order by coh.g <-> refs.g limit 1) r
  )
  select cohort, count(*)::int, round(percentile_cont(0.5) within group (order by d))::int
  from nn group by cohort;
$$;
grant execute on function runic_word_nn(text, text, boolean, boolean, text, boolean) to anon, authenticated;
