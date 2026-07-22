-- Baslinjetest-RPC: medianavstånd från ortnamnsgrupp (makt/kontroll/sakralt) till
-- närmaste sockenkyrka. Applicerad via MCP execute_sql; fil = proveniens.
-- VIKTIGT (ej cirkulärt): koordinaten är ortnamnets OSM-bebyggelsepunkt (source='osm'),
-- INTE sockencentroiden/kyrkan. Avstånd via PostGIS geodetisk KNN (geom-GiST-index).
--   makt      = element_category 'centralort' (tuna/sala/husby/karleby/sätuna)
--   sakralt   = element_category 'sakralt' (oden/tor/frö/ull/lund/harg/hov/vi)
--   kontroll  = element_keys innehåller by/sta/torp (baslinjen)
create or replace function public.distance_stats_baseline()
returns table(grp text, n integer, min_m double precision, q1 double precision, median double precision, q3 double precision, p90 double precision, max_m double precision, mean double precision)
language sql stable
set search_path = public
as $$
  with pts as (
    select id, geom,
      case
        when element_category = 'centralort' then 'makt'
        when element_category = 'sakralt' then 'sakralt'
        when element_keys && array['by','sta','torp'] then 'kontroll'
      end as grp
    from place_names
    where source = 'osm' and geom is not null
  ),
  d as (
    select p.grp, ST_Distance(p.geom::geography, c.geom::geography) as dist
    from pts p
    cross join lateral (
      select e.geom from ecclesiastical_sites e
      where e.geom is not null
      order by p.geom <-> e.geom
      limit 1
    ) c
    where p.grp is not null
  )
  select grp, count(*)::int,
    min(dist),
    percentile_cont(0.25) within group (order by dist),
    percentile_cont(0.5) within group (order by dist),
    percentile_cont(0.75) within group (order by dist),
    percentile_cont(0.9) within group (order by dist),
    max(dist),
    avg(dist)
  from d group by grp;
$$;
