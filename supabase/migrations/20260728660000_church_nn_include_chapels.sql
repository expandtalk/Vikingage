-- Bredda kyrktäthetsmotorn: inkludera kapell + kloster, inte bara sockenkyrkor.
-- Daniel: kloster/kapell är ofta den FÖRSTA kyrkobyggnaden (Kalmar-klostret; Sankt Knuts
-- kapell vid Gråborg, 1100-tal) — att bara räkna parish_church missar de äldsta noderna.
create or replace function public.church_nn_by_period(
  p_landscape text default null, p_minlat double precision default -90,  p_minlng double precision default -180,
  p_maxlat double precision default 90,   p_maxlng double precision default 180
) returns table(cutoff int, n int, median_km numeric) language sql stable as $$
  with pts as (
    select id, geom::geography g, built_from y from public.ecclesiastical_sites
    where kind in ('parish_church','chapel','monastery') and built_from is not null
      and (p_landscape is null or landscape = p_landscape)
      and lat between p_minlat and p_maxlat and lng between p_minlng and p_maxlng)
  select cutoff::int, count(*)::int, round((percentile_cont(0.5) within group (order by nn))::numeric/1000, 2)
  from generate_series(1050, 1350, 50) as cutoff
  cross join lateral (
    select a.id,(select min(st_distance(a.g, b.g)) from pts b where b.y <= cutoff and b.id <> a.id) nn
    from pts a where a.y <= cutoff) x
  where nn is not null group by cutoff order by cutoff;
$$;

-- Sankt Knuts kapell vid Gråborg: feltaggat parish_church → kapell (den fristående kapelltypen).
update public.ecclesiastical_sites set kind='chapel'
 where name='Sankt Knuts Kapell' and round(lat::numeric,4)=56.6679;
