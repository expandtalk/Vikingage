-- Kyrkoutbyggnad per landskap: antal kyrkor, andel daterade, och t50 = median byggår
-- (mittpunkten för kyrkoutbyggnaden = konsolideringens t50, jfr logistisk adoption). Frontend
-- räknar täthet per 100 km² odlingsbygd/yta med landskapsarealer. landscape backfilld via KNN.
create or replace function church_consolidation_by_region()
returns table(region text, n_churches integer, n_dated integer, t50 integer, t25 integer, t75 integer)
language sql stable as $$
  select landscape, count(*)::int, count(built_from)::int,
    round(percentile_cont(0.5)  within group (order by built_from))::int,
    round(percentile_cont(0.25) within group (order by built_from))::int,
    round(percentile_cont(0.75) within group (order by built_from))::int
  from ecclesiastical_sites
  where landscape is not null and landscape <> '' and geom is not null
  group by landscape having count(*) >= 20
  order by count(*) desc;
$$;
grant execute on function church_consolidation_by_region() to anon, authenticated;
