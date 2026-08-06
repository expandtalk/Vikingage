-- Sök: exakt/prefix-match-boost på entitetens namn. 2026-08-06.
-- Problem: "Kalmar" gav fuzzy-parishes (Kärna, Kållands Åsaka) före platsen Kalmar.
-- Fix: exakt label-match = +0.5 (dominerar RRF ~0.01–0.03), prefix = +0.05.
-- Applicerad i prod via MCP (denna fil = repo-spegling). CREATE OR REPLACE, oförändrad signatur.

CREATE OR REPLACE FUNCTION public.search_v2(
  p_q text, p_embedding vector, p_limit integer DEFAULT 30, p_types text[] DEFAULT NULL::text[],
  p_period_from integer DEFAULT NULL, p_period_to integer DEFAULT NULL, p_bbox double precision[] DEFAULT NULL
)
RETURNS TABLE(entity_type text, entity_id uuid, signum text, label text, sublabel text, snippet text, score double precision)
LANGUAGE sql STABLE SET search_path TO 'public' AS $function$
with lex as (
  select s.*, row_number() over (order by s.score desc) as rnk
  from public.search_v1(p_q, greatest(p_limit * 2, 40), p_types) s
),
vec as (
  select m.entity_type, m.entity_id, row_number() over (order by m.similarity desc) as rnk
  from public.match_search_docs(p_embedding, greatest(p_limit * 2, 40)) m
),
fused as (
  select coalesce(l.entity_type, v.entity_type) as entity_type,
         coalesce(l.entity_id, v.entity_id) as entity_id,
         coalesce(1.0 / (60 + l.rnk), 0) + coalesce(0.6 / (60 + v.rnk), 0) as score
  from lex l
  full outer join vec v on l.entity_type = v.entity_type and l.entity_id = v.entity_id
)
select f.entity_type, f.entity_id, d.signum, d.label, d.sublabel, l.snippet,
       ( f.score
         + coalesce(d.prominence,0) * 0.003
         + coalesce(ln(1 + d.popularity) * 0.001, 0)
         + coalesce((select max(ef.prior_weight) from public.entity_facets ef
                      where ef.entity_type = f.entity_type and ef.entity_id = f.entity_id) * 0.0004, 0)
         + case when lower(d.label) = lower(p_q) then 0.5 else 0 end
         + case when lower(d.label) <> lower(p_q) and lower(d.label) like lower(p_q) || '%' then 0.05 else 0 end
         + case when p_period_from is not null and d.period_start is not null
                 and d.period_start <= coalesce(p_period_to, 99999)
                 and coalesce(d.period_end, d.period_start) >= p_period_from
                then 0.02 else 0 end
         + case when p_bbox is not null and d.geom is not null
                 and ST_Intersects(d.geom, ST_MakeEnvelope(p_bbox[1], p_bbox[2], p_bbox[3], p_bbox[4], 4326))
                then 0.02 else 0 end
       ) as score
from fused f
join public.search_document d on d.entity_type = f.entity_type and d.entity_id = f.entity_id
left join lex l on l.entity_type = f.entity_type and l.entity_id = f.entity_id
where (p_types is null or f.entity_type = any (p_types))
order by score desc
limit p_limit
$function$;
