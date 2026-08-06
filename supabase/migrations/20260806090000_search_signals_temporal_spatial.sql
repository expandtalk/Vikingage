-- Sök Fas 1 + Fas 2: koppla in signal-datan + gör tid/rum sökbara.
-- Applicerad i prod 2026-08-06 via MCP (denna fil = repo-spegling).

-- Fas 2: nya dimensioner på indexet.
ALTER TABLE public.search_document
  ADD COLUMN IF NOT EXISTS popularity integer,
  ADD COLUMN IF NOT EXISTS period_start integer,
  ADD COLUMN IF NOT EXISTS period_end integer,
  ADD COLUMN IF NOT EXISTS geom geometry;

-- Fas 1: popularitet ur sökvolymer (theme_links → theme_keywords, max volym per tema).
WITH tv AS (SELECT theme_id, max(volume) v FROM public.theme_keywords GROUP BY theme_id),
     ep AS (SELECT tl.entity_type, tl.entity_id, max(tv.v) pop FROM public.theme_links tl JOIN tv ON tv.theme_id=tl.theme_id GROUP BY 1,2)
UPDATE public.search_document sd SET popularity = ep.pop
FROM ep WHERE ep.entity_type=sd.entity_type AND ep.entity_id=sd.entity_id;

-- Fas 2: period + geom (huvud-historietyper). Utöka med fler typer efter behov.
UPDATE public.search_document sd
   SET period_start=r.period_start, period_end=r.period_end,
       geom = CASE WHEN r.coordinates IS NOT NULL THEN ST_SetSRID(ST_MakePoint(r.coordinates[0], r.coordinates[1]),4326) END
  FROM public.runic_inscriptions r WHERE sd.entity_type='inscription' AND sd.entity_id=r.id;
UPDATE public.search_document sd
   SET period_start=h.period_start, period_end=h.period_end,
       geom = CASE WHEN h.coordinates IS NOT NULL THEN ST_SetSRID(h.coordinates::geometry,4326) END
  FROM public.swedish_hillforts h WHERE sd.entity_type='hillfort' AND sd.entity_id=h.id;
UPDATE public.search_document sd
   SET period_start=co.period_start, period_end=co.period_end,
       geom = CASE WHEN co.coordinates IS NOT NULL THEN ST_SetSRID(ST_MakePoint(co.coordinates[0], co.coordinates[1]),4326) END
  FROM public.coins co WHERE sd.entity_type='coin' AND sd.entity_id=co.id;

CREATE INDEX IF NOT EXISTS idx_search_document_geom ON public.search_document USING gist(geom);
CREATE INDEX IF NOT EXISTS idx_search_document_period ON public.search_document(period_start, period_end);

-- Rankern: RRF (oförändrad) + prominence + Fas 1 (popularitet/facett-prior) + Fas 2 (temporal/spatial-boost, opt-in).
DROP FUNCTION IF EXISTS public.search_v2(text, vector, integer, text[]);
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
