-- Sök-prominens v2: `places` är en bar namntabell (inga signaler) och grafgraden råkar gynna
-- Uppland-socknen Kalmar. Så vi lägger en KURERAD storortsauktoritet (dessa ÄR de stora
-- orterna — källrent, som is_sight) + grafgrad för svansen, och en avgörande skala i search_v2.
CREATE TABLE IF NOT EXISTS place_authority (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  landscape text NOT NULL,
  boost numeric NOT NULL DEFAULT 1.5,
  note text,
  UNIQUE (name, landscape)
);
ALTER TABLE place_authority ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS place_authority_read ON place_authority;
CREATE POLICY place_authority_read ON place_authority FOR SELECT USING (true);

INSERT INTO place_authority (name, landscape, boost) VALUES
  ('Kalmar','Småland',2.0),('Uppsala','Uppland',2.0),('Lund','Skåne',2.0),('Visby','Gotland',2.0),
  ('Stockholm','Uppland',2.0),('Sigtuna','Uppland',1.8),('Birka','Uppland',1.8),('Skara','Västergötland',1.6),
  ('Linköping','Östergötland',1.6),('Söderköping','Östergötland',1.4),('Nyköping','Södermanland',1.4),
  ('Norrköping','Östergötland',1.4),('Västerås','Västmanland',1.6),('Örebro','Närke',1.5),
  ('Jönköping','Småland','1.4'),('Vadstena','Östergötland',1.5),('Enköping','Uppland',1.3),
  ('Strängnäs','Södermanland',1.4),('Eskilstuna','Södermanland',1.4),('Köpingsvik','Öland',1.4),
  ('Kalmar','Öland',1.2)   -- Kalmar sn på Öland (om det finns) — lägre än staden
ON CONFLICT (name, landscape) DO UPDATE SET boost = excluded.boost;

CREATE OR REPLACE FUNCTION public.refresh_search_prominence() RETURNS void
LANGUAGE sql AS $$
  WITH deg AS (
    SELECT id, count(*)::numeric AS cnt FROM (
      SELECT subject_id AS id FROM relationship UNION ALL SELECT object_id FROM relationship
    ) e GROUP BY id
  )
  UPDATE search_document sd SET prominence = least(3.0,
      coalesce((SELECT least(cnt/20.0, 1.0) FROM deg WHERE deg.id = sd.entity_id), 0)   -- grafauktoritet (svans)
    + coalesce((SELECT max(pa.boost) FROM place_authority pa                            -- kurerad storort
                 WHERE lower(sd.label) = lower(pa.name)
                   AND (sd.sublabel ILIKE '%'||pa.landscape||'%' OR sd.entity_type = 'place')), 0)
    );
$$;
SELECT public.refresh_search_prominence();

-- Avgörande skala: en storort (boost 2.0) ska säkert klå en obskyr namne, ej bara nudgas.
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
  full outer join vec v on l.entity_type = v.entity_type and l.entity_id = v.entity_id
)
select f.entity_type, f.entity_id, d.signum, d.label, d.sublabel, l.snippet,
       (f.score + coalesce(d.prominence,0) * 0.003) as score
from fused f
join public.search_document d on d.entity_type = f.entity_type and d.entity_id = f.entity_id
left join lex l on l.entity_type = f.entity_type and l.entity_id = f.entity_id
where (p_types is null or f.entity_type = any (p_types))
order by score desc
limit p_limit
$fn$;

NOTIFY pgrst, 'reload schema';
