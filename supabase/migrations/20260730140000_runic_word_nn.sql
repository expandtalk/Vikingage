-- Hypotestestare: runiska ORD. Ligger inskrifter som innehåller ett givet ord (i translittereringen)
-- tätare vid ett referenslager än runstenar i allmänhet? T.ex. titlar (þiakn/þegn, trekR/drengR),
-- gudanamn (þur), släktord. Kohort 'match' = translitteration ILIKE %term%; 'baseline' = slump.
-- Referens: church|fornborg|thing|town(viking_cities)|gravfalt|runestone(andra runstenar).
create or replace function runic_word_nn(p_term text, p_reference text)
returns table(cohort text, n integer, median_m integer)
language sql stable as $$
  with refs as (
    select geom g from ecclesiastical_sites where p_reference='church' and geom is not null
    union all select ST_SetSRID(ST_MakePoint((coordinates)[0],(coordinates)[1]),4326) from swedish_hillforts where p_reference='fornborg' and coordinates is not null
    union all select geom from thing_sites where p_reference='thing' and geom is not null
    union all select ST_SetSRID(ST_MakePoint((coordinates)[0],(coordinates)[1]),4326) from viking_cities where p_reference='town' and coordinates is not null
    union all select geom from heritage_sites where p_reference='gravfalt' and geom is not null and raa_type ilike '%gravfält%'
  ),
  coh as (
    select 'match'::text cohort, ST_SetSRID(ST_MakePoint((coordinates)[0],(coordinates)[1]),4326) g
      from runic_inscriptions where coordinates is not null and transliteration ilike '%'||p_term||'%'
    union all
    select 'baseline', g from (
      select ST_SetSRID(ST_MakePoint((coordinates)[0],(coordinates)[1]),4326) g
      from runic_inscriptions where coordinates is not null order by random() limit 1200
    ) x
  ),
  nn as (
    select coh.cohort, ST_Distance(coh.g::geography, r.g::geography) d
    from coh cross join lateral (select g from refs order by coh.g <-> refs.g limit 1) r
  )
  select cohort, count(*)::int, round(percentile_cont(0.5) within group (order by d))::int
  from nn group by cohort;
$$;
grant execute on function runic_word_nn(text, text) to anon, authenticated;
