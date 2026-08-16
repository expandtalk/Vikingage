-- Fixa 500 (statement-timeout) i element_reference_nn.
-- ORSAK: KNN (`<->`) mot en icke-indexerad refs-CTE → O(kohort × refs); lund (11346) ⇒ ~38 s ⇒ 500.
-- FIX: bygg refs i en TEMP-tabell med GiST-index → indexaccelererad KNN, snabb för valfri kohortstorlek.
-- Behåller full element-kohort (bättre statistik); control/baseline slumpsamplas 1200 som förut.
create or replace function public.element_reference_nn(p_element text, p_reference text)
returns table(cohort text, n integer, mean_m integer, median_m integer)
language plpgsql volatile
set search_path to 'public'
as $function$
begin
  create temp table if not exists _ernn_refs (g geometry) on commit drop;
  truncate _ernn_refs;
  insert into _ernn_refs
    select geom from ecclesiastical_sites where p_reference='church' and geom is not null
    union all select ST_SetSRID(ST_MakePoint((coordinates)[0],(coordinates)[1]),4326) from runic_inscriptions where p_reference='runestone' and coordinates is not null
    union all select ST_SetSRID(ST_MakePoint((coordinates)[0],(coordinates)[1]),4326) from swedish_hillforts  where p_reference='fornborg'  and coordinates is not null
    union all select geom from thing_sites     where p_reference='thing'     and geom is not null
    union all select geom from heritage_sites  where p_reference='gravfalt'  and geom is not null and raa_type ilike '%gravfält%'
    union all select geom from heritage_sites  where p_reference='execution' and geom is not null and lower(raa_type) ~ 'avrätt|galg|stegl';
  create index if not exists _ernn_refs_gix on _ernn_refs using gist (g);
  analyze _ernn_refs;

  return query
  with coh as (
    select 'element'::text cohort, geom g from place_names where geom is not null and element_keys @> ARRAY[p_element]
    union all
    select 'control', geom from (select geom from place_names where geom is not null and element_keys @> ARRAY['inge'] order by random() limit 1200) x
    union all
    select 'baseline', geom from (select geom from place_names where geom is not null order by random() limit 1200) y
  ),
  nn as (
    select coh.cohort, ST_Distance(coh.g::geography, r.g::geography) d
    from coh cross join lateral (select g from _ernn_refs order by coh.g <-> _ernn_refs.g limit 1) r
  )
  select nn.cohort, count(*)::int, round(avg(nn.d))::int, round(percentile_cont(0.5) within group (order by nn.d))::int
  from nn group by nn.cohort;
end $function$;
