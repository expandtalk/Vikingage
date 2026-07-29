-- Omvandlingsanalys: runstenarna som kristna transitionsmonument. Per landskap: kristen-markör-%,
-- median-datering (≈ när stenresandet/omvändelsen kulminerade där) + expeditionsstenar (män som
-- dog österut/i Grekland/England). Visar kristnandets kronologi + språkögonblicket per landskap.
-- Kristen = has_cross='true' ELLER christian_invocation ifylld. Norska/danska (NO/Hordaland) utesluts.
create or replace function runic_transition_by_region()
returns table(province text, n integer, christian_pct integer, median_dating integer, expedition_n integer)
language sql stable as $$
  select province, count(*)::int,
    round(100.0*count(*) filter (where has_cross = true or christian_invocation is not null)/count(*))::int,
    round(percentile_cont(0.5) within group (order by period_start))::int,
    count(*) filter (where coalesce(transliteration,'') ~* 'ikuar|inkuar|grikk|grik|krik|enklant|iklant')::int
  from runic_inscriptions
  where coordinates is not null and province is not null and province <> '' and province not in ('NO','Hordaland','DK','Danmark')
  group by province having count(*) >= 20
  order by count(*) desc;
$$;
grant execute on function runic_transition_by_region() to anon, authenticated;

-- Expeditionsstenar per mål: antal, kristen-andel, median-datering. Männen som dog utomlands.
create or replace function runic_expedition_stats()
returns table(destination text, n integer, christian_pct integer, median_dating integer)
language sql stable as $$
  with e as (
    select id, has_cross, christian_invocation, period_start,
      case
        when coalesce(transliteration,'') ~* 'ikuar|inkuar' then 'Ingvarståget (österut)'
        when coalesce(transliteration,'') ~* 'grikk|grik|krik' then 'Grekland (Bysans)'
        when coalesce(transliteration,'') ~* 'enklant|iklant|\mikla' then 'England'
        when coalesce(transliteration,'') ~* 'sirklant|serklant' then 'Serkland'
      end dest
    from runic_inscriptions where coordinates is not null
  )
  select dest, count(*)::int,
    round(100.0*count(*) filter (where has_cross = true or christian_invocation is not null)/count(*))::int,
    round(percentile_cont(0.5) within group (order by period_start))::int
  from e where dest is not null group by dest order by count(*) desc;
$$;
grant execute on function runic_expedition_stats() to anon, authenticated;
