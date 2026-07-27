-- fort_at: skicka med evidence_class (ärlighetsaxeln) + hypotes (namn/id) så frontend kan rendera
-- uppmätt heldraget / interpolerat streckat / hypotetiskt punktat, och toggla konkurrerande hypoteser.
begin;
create or replace function public.fort_at(p_year integer, p_site text default 'Kalmar gamla stad'::text, p_min_certainty numeric default 0.01)
 returns json language sql stable parallel safe set search_path to ''
as $function$
  select json_build_object(
    'type','FeatureCollection','year',p_year,
    'features', coalesce(json_agg(f order by f->>'id'), '[]'::json)
  )
  from (
    select json_build_object(
      'type','Feature','id',e.id,
      'geometry', public.ST_AsGeoJSON(public.ST_Transform(e.geom,4326),6)::json,
      'properties', json_build_object(
        'name',           e.name,
        'type',           e.element_type,
        'evidence',       e.evidence,
        'evidence_class', e.evidence_class,
        'accuracy_m',     coalesce(e.pos_uncertainty_m, e.pos_accuracy_m),
        'hypothesis_id',  e.hypothesis_id,
        'hypothesis',     (select h.name from public.fort_hypothesis h where h.id = e.hypothesis_id),
        'certainty',      round(public.temporal_certainty(e.start_earliest,e.start_latest,e.end_earliest,e.end_latest,p_year),2),
        'span',           format('%s–%s', coalesce(e.start_latest,e.start_earliest), coalesce(e.end_earliest,e.end_latest)),
        'halo', case when e.halo_geom is not null then public.ST_AsGeoJSON(public.ST_Transform(e.halo_geom,4326),5)::json end,
        'sources', (select coalesce(json_agg(json_build_object(
                      'citation',s.citation,'archive',s.archive,'signum',s.signum,'year',s.year,'url',s.url)),'[]'::json)
                    from public.fort_element_source es join public.fort_source s on s.id=es.source_id
                    where es.element_id=e.id)
      )
    ) as f
    from public.fort_element e
    where e.site = p_site
      and public.temporal_certainty(e.start_earliest,e.start_latest,e.end_earliest,e.end_latest,p_year) >= p_min_certainty
  ) q;
$function$;
commit;
