-- Kyrktäthet över tid: median grannavstånd (nearest-neighbour) per tidsperiod.
-- Svarar på: gick det fort att få kyrkor vid kristnandet? Tätheten mäts som medianavståndet
-- till närmaste andra kyrka, bland de kyrkor som EXISTERADE vid varje snittår (built_from<=cutoff).
-- Region väljs via landskap ELLER bbox. Parametriserad (ingen injektion). STABLE.
-- CAVEAT: bygger på built_from (ofta stenkyrkans datering) → träförelöpare skulle tidigarelägga
-- kurvan. Kräver komplett + daterat kyrkbestånd i regionen för att vara tillförlitlig
-- (Uppland n=181 daterat = välkalibrerat; Öland n=8 = för glest, tolka ej).
create or replace function public.church_nn_by_period(
  p_landscape text default null,
  p_minlat double precision default -90,  p_minlng double precision default -180,
  p_maxlat double precision default 90,   p_maxlng double precision default 180
) returns table(cutoff int, n int, median_km numeric)
language sql stable as $$
  with pts as (
    select id, geom::geography g, built_from y
    from public.ecclesiastical_sites
    where kind='parish_church' and built_from is not null
      and (p_landscape is null or landscape = p_landscape)
      and lat between p_minlat and p_maxlat and lng between p_minlng and p_maxlng
  )
  select cutoff::int,
         count(*)::int,
         round((percentile_cont(0.5) within group (order by nn))::numeric/1000, 2)
  from generate_series(1050, 1350, 50) as cutoff
  cross join lateral (
    select a.id,
           (select min(st_distance(a.g, b.g)) from pts b where b.y <= cutoff and b.id <> a.id) nn
    from pts a where a.y <= cutoff
  ) x
  where nn is not null
  group by cutoff order by cutoff;
$$;

-- Nuläges-täthet (alla kyrkor i regionen, oavsett datering) — för jämförelse mot slutläget.
create or replace function public.church_nn_current(
  p_landscape text default null,
  p_minlat double precision default -90,  p_minlng double precision default -180,
  p_maxlat double precision default 90,   p_maxlng double precision default 180
) returns table(n int, median_km numeric)
language sql stable as $$
  with pts as (
    select id, geom::geography g from public.ecclesiastical_sites
    where kind='parish_church'
      and (p_landscape is null or landscape = p_landscape)
      and lat between p_minlat and p_maxlat and lng between p_minlng and p_maxlng
  )
  select count(*)::int,
         round((percentile_cont(0.5) within group (order by nn))::numeric/1000, 2)
  from pts a cross join lateral (select min(st_distance(a.g, b.g)) nn from pts b where b.id <> a.id) x;
$$;
