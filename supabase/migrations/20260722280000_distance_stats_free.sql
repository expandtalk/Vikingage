-- Steg 2b: parametriserad distance_stats — fri testmängd/baslinje (ortnamnsled) +
-- valbart mål (kyrka/fornborg/kulturlager/runsten). Applicerad via MCP execute_sql; fil =
-- proveniens. Koordinat = OSM-bebyggelsepunkt (source='osm'), EJ kyrkan → ej cirkulärt.
-- KNN <-> mot målets geom (kyrka/kulturlager indexerat; fornborg/runsten seqscan, litet).
create or replace function public.distance_stats(p_test text[], p_baseline text[], p_target text default 'church')
returns table(grp text, n integer, q1 double precision, median double precision, q3 double precision, p90 double precision, mean double precision)
language plpgsql stable set search_path to 'public' as $$
declare lat_sql text;
begin
  lat_sql := case p_target
    when 'church'    then 'select e.geom g from ecclesiastical_sites e where e.geom is not null order by p.geom <-> e.geom limit 1'
    when 'heritage'  then 'select h.geom g from heritage_sites h where h.geom is not null order by p.geom <-> h.geom limit 1'
    when 'fortress'  then 'select ST_SetSRID(ST_MakePoint((vf.coordinates)[0],(vf.coordinates)[1]),4326) g from viking_fortresses vf where vf.coordinates is not null order by p.geom <-> ST_SetSRID(ST_MakePoint((vf.coordinates)[0],(vf.coordinates)[1]),4326) limit 1'
    when 'runestone' then 'select ST_SetSRID(ST_MakePoint((ri.coordinates)[0],(ri.coordinates)[1]),4326) g from runic_inscriptions ri where ri.coordinates is not null order by p.geom <-> ST_SetSRID(ST_MakePoint((ri.coordinates)[0],(ri.coordinates)[1]),4326) limit 1'
    else 'select e.geom g from ecclesiastical_sites e where e.geom is not null order by p.geom <-> e.geom limit 1' end;
  return query execute format($q$
    with pts as (
      select geom, case when element_keys && $1 then 'test' when element_keys && $2 then 'baseline' end grp
      from place_names where source='osm' and geom is not null
    ),
    d as (
      select p.grp, ST_Distance(p.geom::geography, t.g::geography) dist
      from pts p cross join lateral (%s) t where p.grp is not null
    )
    select grp, count(*)::int,
      percentile_cont(0.25) within group (order by dist),
      percentile_cont(0.5) within group (order by dist),
      percentile_cont(0.75) within group (order by dist),
      percentile_cont(0.9) within group (order by dist), avg(dist)
    from d group by grp
  $q$, lat_sql) using p_test, p_baseline;
end $$;

-- Uppdatera ontologi-katalogen: distance_stats_free nu aktiv.
update public.ontology_measures set status='active', rpc='distance_stats',
  inputs='p_test[], p_baseline[], p_target(church|fortress|heritage|runestone)'
where code='distance_stats_free';
