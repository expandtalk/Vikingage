-- Ordförädling: placename_match_preview(patterns, excludes, boundary) → {n, samples}.
-- Applicerad via MCP execute_sql; fil = proveniens. Räknar OSM-ortnamn som matchar ett
-- mönster (prefix/suffix/substring) minus uteslutningar, + exempel — så en användare kan
-- tuna ett sökord innan det blir hypotes. Ex: gull-/gyll- (prefix) = 71 träffar.
create or replace function public.placename_match_preview(p_patterns text[], p_excludes text[] default '{}', p_boundary text default 'substring')
returns json language sql stable set search_path to 'public' as $$
  with m as (
    select name from public.place_names
    where source='osm' and name is not null
    and (case p_boundary
      when 'prefix' then exists (select 1 from unnest(p_patterns) p where lower(name) like lower(p)||'%')
      when 'suffix' then exists (select 1 from unnest(p_patterns) p where lower(name) like '%'||lower(p))
      else exists (select 1 from unnest(p_patterns) p where lower(name) like '%'||lower(p)||'%')
    end)
    and not exists (select 1 from unnest(p_excludes) e where e<>'' and lower(name) like '%'||lower(e)||'%')
  )
  select json_build_object(
    'n',(select count(*) from m),
    'samples',(select coalesce(json_agg(name),'[]'::json) from (select distinct name from m order by name limit 18) s)
  );
$$;
