-- #1 Skräp-etiketter (carver 'okänd', place/parish/heritage 'Okänd', tomma) ska ALDRIG synas i sök.
-- #2 Rent semantiska (vec-only) träffar är brus vid ENORDS-sökningar (Ög 106 för "Kalmar") — då är det
--    en uppslagning där lexikalt räcker. Släpp vec-only vid enordssök; behåll semantik vid flerord/frågor.
-- Verifierat: search_v2('Kalmar', dummy-emb) = bara Kalmar-relaterat; inget Kärna/Ög 106/okänd ristare.
-- Applicerad i prod via MCP; denna fil = repo-spegling. Live via edge (ingen frontend-deploy). 2026-08-07.
create or replace function public.search_junk_label(t text)
 returns boolean language sql immutable as $$
  select coalesce(btrim(t),'') = ''
      or lower(btrim(t)) = any (array['okänd','okänt','okända','unknown','other',
           'övrig','övrigt','n/a','-','ristare','okänd ristare','namnlös'])
$$;

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
         (l.entity_id is not null) as in_lex,
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
  and not public.search_junk_label(d.label)
  and not (position(' ' in btrim(p_q)) = 0 and f.in_lex = false)
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
