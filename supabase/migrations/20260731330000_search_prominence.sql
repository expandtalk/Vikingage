-- Sök-homonymer: "Kalmar" (socken Uppland) hamnade före Kalmar stad för att search_v2 saknade
-- prominens — ren RRF på text/vektor kan inte skilja två likadana etiketter åt. Vi lägger
-- prominens = grafgrad (auktoritet) + ortstyps-nivå (stad>by) + wikidata-sitelinks, och blandar
-- in den i score. Generellt: löser ALLA homonymer (Berga, Prästgården, Fornborg…), ej bara Kalmar.
ALTER TABLE search_document ADD COLUMN IF NOT EXISTS prominence numeric NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.refresh_search_prominence() RETURNS void
LANGUAGE sql AS $$
  WITH deg AS (
    SELECT id, count(*)::numeric AS cnt FROM (
      SELECT subject_id AS id FROM relationship UNION ALL SELECT object_id FROM relationship
    ) e GROUP BY id
  )
  UPDATE search_document sd SET prominence = least(2.0,
      coalesce((SELECT least(cnt/20.0, 1.0) FROM deg WHERE deg.id = sd.entity_id), 0)  -- graf-auktoritet
    + coalesce((SELECT (CASE pn.feature_type
                          WHEN 'osm_city' THEN 1.0 WHEN 'tätort' THEN 0.7 WHEN 'osm_town' THEN 0.7
                          WHEN 'osm_village' THEN 0.4 WHEN 'småort' THEN 0.3 ELSE 0.15 END)
                       + least(coalesce(pn.wikidata_sitelinks,0)/50.0, 1.0)              -- extern salience
                 FROM place_names pn WHERE pn.id = sd.entity_id AND sd.entity_type = 'place'), 0)
    );
$$;
SELECT public.refresh_search_prominence();

-- search_v2 v2: blanda in prominens (tunbar skala) som avgörare mellan likvärdiga textträffar.
CREATE OR REPLACE FUNCTION public.search_v2(
  p_q text, p_embedding vector(384), p_limit integer default 30, p_types text[] default null
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
select f.entity_type, f.entity_id, d.signum, d.label, d.sublabel, l.snippet,
       (f.score + coalesce(d.prominence,0) * 0.0015) as score
from fused f
join public.search_document d on d.entity_type = f.entity_type and d.entity_id = f.entity_id
left join lex l on l.entity_type = f.entity_type and l.entity_id = f.entity_id
where (p_types is null or f.entity_type = any (p_types))
order by score desc
limit p_limit
$fn$;

NOTIFY pgrst, 'reload schema';
