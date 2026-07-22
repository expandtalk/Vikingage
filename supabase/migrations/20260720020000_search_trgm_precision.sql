-- Sökfix 3 (Daniel 2026-07-20): trigram-benet släppte igenom avlägsna grannar.
-- "Öland" gav Åland (sim .33), Meland/Moland (.30) FÖRE Ölands socknar/borgar;
-- "Årsta" gav Kårsta/Års/Ågersta/Irsta/Örsta (.33–.44) som brus efter äkta träffar.
-- Rotorsak: trgm-CTE:n tog ALLT över pg_trgm-tröskeln 0.3 och RRF-viktade rankplats
-- (1.5/(60+rnk)) oavsett faktisk likhet → lågsimilaritets-grannar slog FTS-träffar
-- (~0.010–0.016) på genuint relevanta dokument.
-- Fix: substring-träffar (label innehåller frågan) behålls alltid; ren fuzzy kräver
-- similarity ≥ 0.45. Stavfel överlever ("Jellinge"→Jelling ≈ .8), grannbyar dör.
-- Övriga CTE:er identiska med 20260720010000.

create or replace function public.search_v1(p_q text, p_limit integer default 30, p_types text[] default null)
returns table (entity_type text, entity_id uuid, signum text, label text, sublabel text, snippet text, score double precision)
language sql stable as $fn$
with q as (
  select trim(p_q) as raw,
         lower(replace(trim(p_q), ' ', '')) as qnorm,
         websearch_to_tsquery('simple', p_q) as tq_simple,
         websearch_to_tsquery('swedish', p_q) as tq_sv,
         websearch_to_tsquery('english', p_q) as tq_en
),
exact_sig as (
  select d.entity_type, d.entity_id, 1::bigint as rnk
  from search_document d, q
  where length(q.qnorm) >= 2
    and (d.signum_norm = q.qnorm or lower(d.label) = lower(q.raw))
),
trgm as (
  select entity_type, entity_id, row_number() over (order by sim desc) as rnk
  from (
    select d.entity_type, d.entity_id, similarity(d.label, q.raw) as sim,
           (d.label ilike '%' || q.raw || '%') as is_substr
    from search_document d, q
    where length(q.raw) >= 2 and (d.label % q.raw or d.label ilike '%' || q.raw || '%')
    order by sim desc limit 60
  ) x
  where x.is_substr or x.sim >= 0.45
),
fts as (
  select entity_type, entity_id, row_number() over (order by rank desc) as rnk
  from (
    select d.entity_type, d.entity_id,
      greatest(ts_rank(d.tsv_simple, q.tq_simple),
               ts_rank(d.tsv_sv, q.tq_sv),
               ts_rank(d.tsv_en, q.tq_en)) as rank
    from search_document d, q
    where d.tsv_simple @@ q.tq_simple or d.tsv_sv @@ q.tq_sv or d.tsv_en @@ q.tq_en
    order by rank desc limit 300
  ) x
),
fused as (
  select entity_type, entity_id, sum(w / (60 + rnk)) as score
  from (
    select entity_type, entity_id, rnk, 3.0 as w from exact_sig
    union all select entity_type, entity_id, rnk, 1.5 from trgm
    union all select entity_type, entity_id, rnk, 1.0 from fts
  ) s
  group by entity_type, entity_id
),
diversified as (
  select f.*, row_number() over (partition by f.entity_type order by f.score desc) as type_rn
  from fused f
)
select d.entity_type, d.entity_id, d.signum, d.label, d.sublabel,
  ts_headline('simple',
    left(concat_ws(' ', d.body_sv, d.body_en, d.body_simple), 600),
    q.tq_simple, 'MaxWords=18, MinWords=6, MaxFragments=1') as snippet,
  f.score
from diversified f
join search_document d using (entity_type, entity_id)
cross join q
where f.type_rn <= 20
  and (p_types is null or d.entity_type = any (p_types))
order by f.score desc
limit p_limit
$fn$;
