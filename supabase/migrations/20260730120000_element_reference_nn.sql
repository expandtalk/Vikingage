-- Hypotestestare v2: för ett namnled, medel/median närmaste-grann-avstånd (NN) till ett valt
-- referenslager, jämfört mot kontroll-led (-inge, neutralt) OCH slumpbaslinje (alla ortnamn).
-- Signal = element-NN klart < både kontroll och baslinje → leden ligger tätare vid referensen
-- än väntat. Referens: church|gravfalt|fornborg|thing|runestone|execution. Kör mot HELA place_names.
create or replace function element_reference_nn(p_element text, p_reference text)
returns table(cohort text, n integer, mean_m integer, median_m integer)
language sql stable as $$
  with refs as (
    select geom g from ecclesiastical_sites where p_reference='church' and geom is not null
    union all select ST_SetSRID(ST_MakePoint((coordinates)[0],(coordinates)[1]),4326) from runic_inscriptions where p_reference='runestone' and coordinates is not null
    union all select ST_SetSRID(ST_MakePoint((coordinates)[0],(coordinates)[1]),4326) from swedish_hillforts  where p_reference='fornborg'  and coordinates is not null
    union all select geom from thing_sites     where p_reference='thing'     and geom is not null
    union all select geom from heritage_sites  where p_reference='gravfalt'  and geom is not null and raa_type ilike '%gravfält%'
    union all select geom from heritage_sites  where p_reference='execution' and geom is not null and lower(raa_type) ~ 'avrätt|galg|stegl'
  ),
  coh as (
    select 'element'::text cohort, geom g from place_names where geom is not null and element_keys @> ARRAY[p_element]
    union all
    select 'control', geom from (select geom from place_names where geom is not null and element_keys @> ARRAY['inge'] order by random() limit 1200) x
    union all
    select 'baseline', geom from (select geom from place_names where geom is not null order by random() limit 1200) y
  ),
  nn as (
    select coh.cohort, ST_Distance(coh.g::geography, r.g::geography) d
    from coh cross join lateral (select g from refs order by coh.g <-> refs.g limit 1) r
  )
  select cohort, count(*)::int, round(avg(d))::int, round(percentile_cont(0.5) within group (order by d))::int
  from nn group by cohort;
$$;
grant execute on function element_reference_nn(text, text) to anon, authenticated;
