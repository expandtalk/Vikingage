-- search_v2: hybrid av lexikalt (search_v1) + semantiskt (match_search_docs),
-- fuserat via viktad RRF (lexikalt 1.0, vektor 0.6 — exakta lexikala träffar
-- överröstas aldrig av semantiken; semantiken lyfter recall). Icke-förstörande:
-- search_v1 och match_search_docs är oförändrade. Query-embeddingen skickas in
-- (beräknas i edge-funktionen search-hybrid med gte-small). Applicerad via MCP.
create or replace function public.search_v2(
  p_q text,
  p_embedding vector(384),
  p_limit integer default 30,
  p_types text[] default null
) returns table (entity_type text, entity_id uuid, signum text, label text, sublabel text, snippet text, score double precision)
language sql stable set search_path = public as $fn$
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
  full outer join vec v
    on l.entity_type = v.entity_type and l.entity_id = v.entity_id
)
select f.entity_type, f.entity_id, d.signum, d.label, d.sublabel, l.snippet, f.score
from fused f
join public.search_document d on d.entity_type = f.entity_type and d.entity_id = f.entity_id
left join lex l on l.entity_type = f.entity_type and l.entity_id = f.entity_id
where (p_types is null or f.entity_type = any (p_types))
order by f.score desc
limit p_limit
$fn$;
