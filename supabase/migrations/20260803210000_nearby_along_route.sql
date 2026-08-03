-- nearby_along_route: korridorsökning "sevärt längs vägen" för roadtrip-läget.
-- Samma objekt-union + signifikansmodell som nearby_features_ranked, men mäter avstånd till
-- RUTT-LINJEN (ST_Distance mot geography-linje), filtrerar på omvägstolerans p_buffer_km,
-- respekterar intresse (p_types = påslagna lagertyper) och ger läge längs rutten (frac_along,
-- ST_LineLocatePoint) så resultatet kan ordnas som en resväg. Applicerad i prod via execute_sql.
create or replace function public.nearby_along_route(
  p_lngs double precision[], p_lats double precision[],
  p_buffer_km double precision default 3, p_limit integer default 40,
  p_types text[] default null, p_season text default null
) returns table(
  feature_type text, feature_id text, label text, lat double precision, lng double precision,
  detour_km double precision, frac_along double precision, significance double precision,
  authority integer, score double precision, rank_reason text
) language sql stable as $function$
  with route as (
    select st_makeline(p.geom order by p.ord) as geom
    from (select st_setsrid(st_makepoint(lng,lat),4326) as geom, ord
          from unnest(p_lngs,p_lats) with ordinality as u(lng,lat,ord)) p
  ),
  rl as (select geom, geom::geography as geog from route),
  deg as (select id, count(*)::int as cnt from (select subject_id as id from relationship union all select object_id from relationship) e group by id),
  signals as (select ps.entity_type, ps.entity_id, sum(ps.value*coalesce(sw.weight,0.1)) as boost from place_signals ps left join signal_weights sw on sw.signal=ps.signal group by ps.entity_type, ps.entity_id),
  src as (
    select 'runestone'::text as feature_type, r.id::text as feature_id,
      coalesce(case when ri.name ~* '(sten|häll|ristning|monument|bleck)' then nullif(ri.name,'') end,
        (select a from unnest(ri.also_known_as) a where a ~* '(sten|häll|ristning|monument|bleck)' limit 1),
        r.signum,'runsten') as label,
      r.coordinates_latitude as lat, r.coordinates_longitude as lng, 0.60::numeric as base_sig, null::text as evidence, true as is_named, null::text as subtype
      from runic_with_coordinates r left join runic_inscriptions ri on ri.id=r.id
      where r.coordinates_latitude is not null and r.coordinates_longitude is not null
    union all
    select 'church', c.id::text, c.name, c.lat, c.lng, 0.35, null, (c.name is not null), null
      from ecclesiastical_sites c where c.lat is not null and c.lng is not null and (c.built_from is null or c.built_from<1550 or c.name ilike '%domkyrka%')
    union all
    select 'cult_site', cs.id::text, cs.name, cs.lat, cs.lng, 0.32, null, (cs.name is not null), null from cult_sites cs where cs.lat is not null and cs.lng is not null
    union all
    select 'estate', e.id::text, e.name, e.lat, e.lng, 0.30, null, (e.name is not null), null from estates e where e.lat is not null and e.lng is not null
    union all
    select 'museum', mu.id::text, mu.name, mu.lat, mu.lng, 0.45, null, true, null from museums mu where mu.lat is not null and mu.lng is not null
    union all
    select 'heritage', h.id::text, coalesce(h.raa_type,'lämning')||case when h.name is not null and h.name<>coalesce(h.raa_type,'') then ' – '||h.name else '' end,
      h.lat, h.lng, 0.10, h.evidence_class, (h.name is not null and h.name<>coalesce(h.raa_type,'')), h.raa_type
      from heritage_sites h where h.geom is not null and h.raa_type not ilike '%kyrk%'
        and st_dwithin(h.geom::geography, (select geog from rl), p_buffer_km*1000)
    union all
    select 'maritime_node', m.id::text, m.name, m.lat, m.lng, 0.28, null, (m.name is not null), null from maritime_nodes m where m.lat is not null and m.lng is not null
  ),
  scored as (
    select s.*,
      st_distance(st_setsrid(st_makepoint(s.lng,s.lat),4326)::geography, (select geog from rl))/1000.0 as detour_km,
      st_linelocatepoint((select geom from rl), st_setsrid(st_makepoint(s.lng,s.lat),4326)) as frac_along,
      coalesce(d.cnt,0) as authority
      from src s left join deg d on d.id=(case when s.feature_id ~ '^[0-9a-f-]{36}$' then s.feature_id::uuid end)
  ),
  sig as (
    select sc.*, coalesce(sg.boost,0) as signal_boost,
      case when p_season is null then 0 else least(0.30, coalesce((select sum(sr.weight) from seasonal_relevance sr where sr.season=p_season and ((sr.match_kind='feature_type' and sr.match_value=sc.feature_type) or (sr.match_kind='raa_type' and sr.match_value=sc.subtype))),0)) end as season_boost,
      exp(-sc.detour_km/4.0) as dist_decay
      from scored sc left join signals sg on sg.entity_type=sc.feature_type and sg.entity_id=sc.feature_id
      where sc.detour_km <= p_buffer_km and (p_types is null or sc.feature_type = any(p_types))
  ),
  fin as (
    select *, least(1.0, base_sig + least(authority/20.0,0.30)
      + case evidence when 'belagd' then 0.25 when 'tradition' then 0.12 when 'oklar' then 0.05 else 0 end
      + case when is_named then 0.10 else 0 end + least(signal_boost,0.35) + season_boost) as significance
      from sig
  ),
  ranked as (select *, row_number() over (partition by feature_type order by significance desc, detour_km) as type_rn from fin)
  select feature_type, feature_id, label, lat, lng,
    round(detour_km::numeric,2)::double precision, round(frac_along::numeric,4)::double precision,
    round(significance::numeric,3)::double precision, authority,
    round((0.35*dist_decay + 0.65*significance - least(greatest(type_rn-3,0)*0.03,0.25))::numeric,4)::double precision as score,
    (case when feature_type='runestone' then 'Runsten' else initcap(feature_type) end)
      || case when signal_boost>=0.1 then ' · sevärdhet' else '' end
      || case when authority>=8 then ' · rikt kopplad' when authority>=3 then ' · kopplad' else '' end
      || case when evidence='belagd' then ' · belagd datering' when evidence='tradition' then ' · tradition' else '' end as rank_reason
    from ranked order by score desc limit p_limit;
$function$;
grant execute on function public.nearby_along_route(double precision[],double precision[],double precision,integer,text[],text) to anon, authenticated;
