-- Nearby-rank Fas 2: generisk signal-infrastruktur så nya rankfaktorer läggs till UTAN
-- schemaändring. place_signals = en rad per (objekt, signal); signal_weights = tunbar vikt
-- per signal (utan deploy). RPC:n summerar Σ value·weight → sevärdhet-boost. Daniels
-- populäritetsdata (sökord/sidor) blir bara INSERTs i place_signals + ev. en vikt-rad.
CREATE TABLE IF NOT EXISTS place_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,   -- matchar nearby feature_type: runestone|church|cult_site|estate|heritage|maritime_node
  entity_id text NOT NULL,
  signal text NOT NULL,        -- sight | popularity | wikidata_sitelinks | museum | pageviews | ...
  value numeric NOT NULL DEFAULT 1,
  source text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (entity_type, entity_id, signal)
);
CREATE TABLE IF NOT EXISTS signal_weights (
  signal text PRIMARY KEY,
  weight numeric NOT NULL DEFAULT 0.1,
  note text
);
ALTER TABLE place_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_weights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS place_signals_read ON place_signals;
CREATE POLICY place_signals_read ON place_signals FOR SELECT USING (true);
DROP POLICY IF EXISTS signal_weights_read ON signal_weights;
CREATE POLICY signal_weights_read ON signal_weights FOR SELECT USING (true);

INSERT INTO signal_weights (signal, weight, note) VALUES
  ('sight', 0.18, 'Kurerad/erkänd sevärdhet'),
  ('popularity', 0.20, 'Populäraste sökord/sidor (extern data, Daniel)'),
  ('wikidata_sitelinks', 0.004, 'Per Wikipedia-språkversion (extern länk-auktoritet)'),
  ('museum', 0.05, 'Museiuppmärksamhet (SHM-objektantal m.m.)')
ON CONFLICT (signal) DO UPDATE SET weight = excluded.weight, note = excluded.note;

-- Seed: kultplatser (115 kurerade signifikanta platser) + kurerade flaggskeppsrunstenar.
INSERT INTO place_signals (entity_type, entity_id, signal, value, source)
  SELECT 'cult_site', id::text, 'sight', 1.0, 'kurerad (kultplats)' FROM cult_sites
ON CONFLICT (entity_type, entity_id, signal) DO NOTHING;

INSERT INTO place_signals (entity_type, entity_id, signal, value, source)
  SELECT 'runestone', id::text, 'sight', 1.0, 'kurerad flaggskeppsrunsten'
    FROM runic_inscriptions
   WHERE signum = ANY(ARRAY['Öl 1','Ög 136','Sö 101','Sö 106','U 240','U 344','Vg 119','U 448','Sö 179','Ög 8','U 11','Sö 105','G 203'])
ON CONFLICT (entity_type, entity_id, signal) DO NOTHING;

-- RPC v2: folda in place_signals × signal_weights i signifikansen.
CREATE OR REPLACE FUNCTION nearby_features_ranked(
  p_lat double precision, p_lng double precision,
  p_radius_km double precision DEFAULT 40, p_limit int DEFAULT 120
)
RETURNS TABLE(
  feature_type text, feature_id text, label text, lat double precision, lng double precision,
  distance_km double precision, significance double precision, authority int,
  score double precision, rank_reason text
)
LANGUAGE sql STABLE AS $$
  WITH deg AS (
    SELECT id, count(*)::int AS cnt FROM (
      SELECT subject_id AS id FROM relationship UNION ALL SELECT object_id FROM relationship
    ) e GROUP BY id
  ),
  signals AS (
    SELECT ps.entity_type, ps.entity_id, sum(ps.value * coalesce(sw.weight, 0.1)) AS boost
      FROM place_signals ps LEFT JOIN signal_weights sw ON sw.signal = ps.signal
     GROUP BY ps.entity_type, ps.entity_id
  ),
  src AS (
    SELECT 'runestone'::text AS feature_type, r.id::text AS feature_id, coalesce(r.signum,'runsten') AS label,
           r.coordinates_latitude AS lat, r.coordinates_longitude AS lng, 0.60::numeric AS base_sig, NULL::text AS evidence, true AS is_named
      FROM runic_with_coordinates r WHERE r.coordinates_latitude IS NOT NULL AND r.coordinates_longitude IS NOT NULL
    UNION ALL
    SELECT 'church', c.id::text, c.name, c.lat, c.lng, 0.35, NULL, (c.name IS NOT NULL)
      FROM ecclesiastical_sites c WHERE c.lat IS NOT NULL AND c.lng IS NOT NULL AND (c.built_from IS NULL OR c.built_from < 1550)
    UNION ALL
    SELECT 'cult_site', cs.id::text, cs.name, cs.lat, cs.lng, 0.32, NULL, (cs.name IS NOT NULL) FROM cult_sites cs WHERE cs.lat IS NOT NULL AND cs.lng IS NOT NULL
    UNION ALL
    SELECT 'estate', e.id::text, e.name, e.lat, e.lng, 0.30, NULL, (e.name IS NOT NULL) FROM estates e WHERE e.lat IS NOT NULL AND e.lng IS NOT NULL
    UNION ALL
    SELECT 'heritage', h.id::text, coalesce(h.raa_type,'lämning') || CASE WHEN h.name IS NOT NULL AND h.name <> coalesce(h.raa_type,'') THEN ' – ' || h.name ELSE '' END,
           h.lat, h.lng, 0.10, h.evidence_class, (h.name IS NOT NULL AND h.name <> coalesce(h.raa_type,''))
      FROM heritage_sites h WHERE h.geom IS NOT NULL AND h.raa_type NOT ILIKE '%kyrk%'
        AND ST_DWithin(h.geom, ST_SetSRID(ST_MakePoint(p_lng, p_lat),4326)::geography, p_radius_km*1000)
    UNION ALL
    SELECT 'maritime_node', m.id::text, m.name, m.lat, m.lng, 0.28, NULL, (m.name IS NOT NULL) FROM maritime_nodes m WHERE m.lat IS NOT NULL AND m.lng IS NOT NULL
  ),
  scored AS (
    SELECT s.*,
      2*6371*asin(sqrt(power(sin(radians(s.lat-p_lat)/2),2)+cos(radians(p_lat))*cos(radians(s.lat))*power(sin(radians(s.lng-p_lng)/2),2))) AS distance_km,
      coalesce(d.cnt,0) AS authority
      FROM src s LEFT JOIN deg d ON d.id = (CASE WHEN s.feature_id ~ '^[0-9a-f-]{36}$' THEN s.feature_id::uuid END)
  ),
  sig AS (
    SELECT sc.*,
      coalesce(sg.boost,0) AS signal_boost,
      least(1.0, sc.base_sig
        + least(sc.authority/20.0, 0.30)
        + CASE sc.evidence WHEN 'belagd' THEN 0.25 WHEN 'tradition' THEN 0.12 WHEN 'oklar' THEN 0.05 ELSE 0 END
        + CASE WHEN sc.is_named THEN 0.10 ELSE 0 END
        + least(coalesce(sg.boost,0), 0.35)) AS significance,
      exp(-sc.distance_km/8.0) AS dist_decay
      FROM scored sc
      LEFT JOIN signals sg ON sg.entity_type = sc.feature_type AND sg.entity_id = sc.feature_id
     WHERE sc.distance_km <= p_radius_km
  ),
  ranked AS (
    SELECT *, row_number() OVER (PARTITION BY feature_type ORDER BY significance DESC, distance_km) AS type_rn FROM sig
  )
  SELECT feature_type, feature_id, label, lat, lng,
    round(distance_km::numeric,3)::double precision AS distance_km,
    round(significance::numeric,3)::double precision AS significance,
    authority,
    round((0.45*dist_decay + 0.55*significance - least(greatest(type_rn-3,0)*0.03,0.25))::numeric,4)::double precision AS score,
    (CASE WHEN feature_type='runestone' THEN 'Runsten' ELSE initcap(feature_type) END)
      || CASE WHEN signal_boost >= 0.1 THEN ' · sevärdhet' ELSE '' END
      || CASE WHEN authority >= 8 THEN ' · rikt kopplad' WHEN authority >= 3 THEN ' · kopplad' ELSE '' END
      || CASE WHEN evidence='belagd' THEN ' · belagd datering' WHEN evidence='tradition' THEN ' · tradition' ELSE '' END AS rank_reason
    FROM ranked
   ORDER BY score DESC
   LIMIT p_limit;
$$;

NOTIFY pgrst, 'reload schema';
