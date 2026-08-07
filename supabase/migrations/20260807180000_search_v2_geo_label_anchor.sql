-- ROT till kvarstående sök-skräp: search-hybrid edge-funktion → search_v2 = search_v1 (ankrat)
-- FULL OUTER JOIN match_search_docs (embeddings, OANKRAT). Semantiska GEO-träffar (Göteborg↔Gotland,
-- Kalmar↔Kårsta/Kareby/Kållands/Källa/Skalunda, Årsta↔Ramsta/Års) kom in via vec-grenen och kringgick
-- ankaret i search_v1. Embeddings matchar TEXTlikhet, inte geografi — därför meningslöst för ortnamn.
-- Fix: samma plats-ankare (search_fold) på search_v2:s slutfilter — GEO-typer + hillfort/fortress måste
-- bära söktexten i namnet. Semantik behålls för icke-GEO (inskrifter/heritage). +extensions i search_path.
-- Verifierat: Gotland/Kareby/Kårsta/Kållands/Källa/Skalunda/Kärna/Ramsta/Års utesluts; Göteborg/Kalmar/
-- Kalmar slott/Årsta behålls. LIVE via edge-anropet direkt (ingen frontend-deploy krävs).
-- Applicerad i prod via MCP; denna fil = repo-spegling. 2026-08-07.
CREATE OR REPLACE FUNCTION public.search_v2(p_q text, p_embedding vector, p_limit integer DEFAULT 30, p_types text[] DEFAULT NULL::text[], p_period_from integer DEFAULT NULL::integer, p_period_to integer DEFAULT NULL::integer, p_bbox double precision[] DEFAULT NULL::double precision[])
 RETURNS TABLE(entity_type text, entity_id uuid, signum text, label text, sublabel text, snippet text, score double precision)
 LANGUAGE sql STABLE SET search_path TO 'public', 'extensions'
AS $function$
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
  and not (
    f.entity_type in ('parish','place_name','place','hundred','landscape','city','hillfort','fortress')
    and not (
      public.search_fold(d.label) like '%' || public.search_fold(p_q) || '%'
      or word_similarity(public.search_fold(p_q), public.search_fold(d.label)) >= 0.55
      or exists (select 1 from regexp_split_to_table(public.search_fold(p_q), '\s+') tok
                 where length(tok) >= 3 and public.search_fold(d.label) like '%' || tok || '%')
    )
  )
order by score desc
limit p_limit
$function$;
