-- Helgon-hypotesen: ligger kyrkor helgade åt ett visst helgon närmare centralorterna
-- (viking_cities) än kyrkor i allmänhet? Daniels hypotes: sjöfararhelgon (Nikolaus, Olof,
-- Clemens) i centralorter. Kohort 'saint' = kyrkor med patron_saint ILIKE p_saint; 'baseline'
-- = alla kyrkor. NN-median till närmaste centralort. (patron_saint finns på 161/4146 kyrkor.)
create or replace function saint_centrality(p_saint text)
returns table(cohort text, n integer, median_m integer)
language sql stable as $$
  with towns as (
    select ST_SetSRID(ST_MakePoint((coordinates)[0],(coordinates)[1]),4326) g
    from viking_cities where coordinates is not null
  ),
  nn as (
    select (e.patron_saint ilike p_saint) is_saint,
           (select min(ST_Distance(e.geom::geography, t.g::geography)) from towns t) d
    from ecclesiastical_sites e where e.geom is not null
  )
  select 'saint'::text, count(*)::int, round(percentile_cont(0.5) within group (order by d))::int
    from nn where is_saint and d is not null
  union all
  select 'baseline', count(*)::int, round(percentile_cont(0.5) within group (order by d))::int
    from nn where d is not null;
$$;
grant execute on function saint_centrality(text) to anon, authenticated;

-- Lista helgon med tillräckligt underlag (för dropdown i UI:t).
create or replace function saint_options()
returns table(patron_saint text, n integer)
language sql stable as $$
  select patron_saint, count(*)::int from ecclesiastical_sites
  where patron_saint is not null and patron_saint <> '' and geom is not null
  group by patron_saint having count(*) >= 3 order by count(*) desc;
$$;
grant execute on function saint_options() to anon, authenticated;
