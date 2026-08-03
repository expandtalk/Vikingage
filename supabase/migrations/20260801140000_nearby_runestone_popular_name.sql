-- Near me: visa runstenens VARDAGSNAMN när det finns ("Apelbodastenen", "Björketorpsstenen")
-- i stället för signum. also_known_as blandar katalog-korsref ("DR 408") och folkliga namn —
-- välj första posten som läser som ett stennamn (%sten%/%ristning%), annars signum.
-- Gäller både listan (nearby_features) och rankningen (nearby_features_ranked). Signaturer
-- oförändrade → CREATE OR REPLACE (ingen DROP).

CREATE OR REPLACE FUNCTION nearby_features(
  p_lat double precision, p_lng double precision,
  p_radius_km double precision DEFAULT 40, p_limit int DEFAULT 200
)
RETURNS TABLE(feature_type text, feature_id text, label text, lat double precision, lng double precision,
              distance_km double precision, parish text, source_uri text)
LANGUAGE sql STABLE AS $$
  WITH src AS (
    SELECT 'runestone'::text AS feature_type, r.id::text AS feature_id,
           coalesce((SELECT a FROM unnest(ri.also_known_as) a WHERE a ILIKE '%sten%' OR a ILIKE '%ristning%' LIMIT 1), r.signum, 'runsten') AS label,
           r.coordinates_latitude AS lat, r.coordinates_longitude AS lng, NULL::text AS parish, NULL::text AS source_uri
      FROM runic_with_coordinates r
      LEFT JOIN runic_inscriptions ri ON ri.id = r.id
      WHERE r.coordinates_latitude IS NOT NULL AND r.coordinates_longitude IS NOT NULL
    UNION ALL
    SELECT 'church', c.id::text, c.name, c.lat, c.lng, NULL::text, NULL::text FROM ecclesiastical_sites c
     WHERE c.lat IS NOT NULL AND c.lng IS NOT NULL AND (c.built_from IS NULL OR c.built_from < 1550)
    UNION ALL
    SELECT 'cult_site', cs.id::text, cs.name, cs.lat, cs.lng, NULL::text, NULL::text FROM cult_sites cs WHERE cs.lat IS NOT NULL AND cs.lng IS NOT NULL
    UNION ALL
    SELECT 'estate', e.id::text, e.name, e.lat, e.lng, NULL::text, NULL::text FROM estates e WHERE e.lat IS NOT NULL AND e.lng IS NOT NULL
    UNION ALL
    SELECT 'heritage', h.id::text,
           coalesce(h.raa_type,'lämning') || CASE WHEN h.name IS NOT NULL AND h.name <> coalesce(h.raa_type,'') THEN ' – ' || h.name ELSE '' END,
           h.lat, h.lng, h.parish, h.source_uri
      FROM heritage_sites h WHERE h.geom IS NOT NULL AND h.raa_type NOT ILIKE '%kyrk%'
        AND ST_DWithin(h.geom, ST_SetSRID(ST_MakePoint(p_lng, p_lat),4326)::geography, p_radius_km*1000)
    UNION ALL
    SELECT 'maritime_node', m.id::text, m.name, m.lat, m.lng, NULL::text, NULL::text FROM maritime_nodes m WHERE m.lat IS NOT NULL AND m.lng IS NOT NULL
  ),
  dist AS (
    SELECT feature_type, feature_id, label, lat, lng, parish, source_uri,
           2 * 6371 * asin(sqrt(power(sin(radians(lat - p_lat)/2),2) + cos(radians(p_lat))*cos(radians(lat))*power(sin(radians(lng - p_lng)/2),2))) AS distance_km
      FROM src
  )
  SELECT feature_type, feature_id, label, lat, lng, distance_km, parish, source_uri
    FROM dist WHERE distance_km <= p_radius_km ORDER BY distance_km LIMIT p_limit;
$$;

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
      SELECT subject_id AS id FROM relationship
      UNION ALL SELECT object_id FROM relationship
    ) e GROUP BY id
  ),
  src AS (
    SELECT 'runestone'::text AS feature_type, r.id::text AS feature_id,
           coalesce((SELECT a FROM unnest(ri.also_known_as) a WHERE a ILIKE '%sten%' OR a ILIKE '%ristning%' LIMIT 1), r.signum, 'runsten') AS label,
           r.coordinates_latitude AS lat, r.coordinates_longitude AS lng, 0.60::numeric AS base_sig, NULL::text AS evidence, true AS is_named
      FROM runic_with_coordinates r
      LEFT JOIN runic_inscriptions ri ON ri.id = r.id
      WHERE r.coordinates_latitude IS NOT NULL AND r.coordinates_longitude IS NOT NULL
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
    SELECT *,
      least(1.0, base_sig
        + least(authority/20.0, 0.30)
        + CASE evidence WHEN 'belagd' THEN 0.25 WHEN 'tradition' THEN 0.12 WHEN 'oklar' THEN 0.05 ELSE 0 END
        + CASE WHEN is_named THEN 0.10 ELSE 0 END) AS significance,
      exp(-distance_km/8.0) AS dist_decay
      FROM scored WHERE distance_km <= p_radius_km
  ),
  ranked AS (
    SELECT *,
      row_number() OVER (PARTITION BY feature_type ORDER BY significance DESC, distance_km) AS type_rn
      FROM sig
  )
  SELECT feature_type, feature_id, label, lat, lng,
    round(distance_km::numeric,3)::double precision AS distance_km,
    round(significance::numeric,3)::double precision AS significance,
    authority,
    round((0.45*dist_decay + 0.55*significance - least(greatest(type_rn-3,0)*0.03,0.25))::numeric,4)::double precision AS score,
    (CASE WHEN feature_type='runestone' THEN 'Runsten' ELSE initcap(feature_type) END)
      || CASE WHEN authority >= 8 THEN ' · rikt kopplad' WHEN authority >= 3 THEN ' · kopplad' ELSE '' END
      || CASE WHEN evidence='belagd' THEN ' · belagd datering' WHEN evidence='tradition' THEN ' · tradition' ELSE '' END AS rank_reason
    FROM ranked
   ORDER BY score DESC
   LIMIT p_limit;
$$;

NOTIFY pgrst, 'reload schema';
