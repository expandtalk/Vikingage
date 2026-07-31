-- nearby_features v3: exkludera EFTERreformatoriska kyrkor (built_from >= 1550) ur Near me
-- — moderna frikyrkor (pingst/mission/baptist…) ska inte skräpa i en vikinga-/medeltidsvy.
-- Odaterade kyrkor behålls (troligen medeltida sockenkyrkor). Övriga grenar oförändrade.
CREATE OR REPLACE FUNCTION nearby_features(
  p_lat double precision, p_lng double precision,
  p_radius_km double precision DEFAULT 40, p_limit int DEFAULT 200
)
RETURNS TABLE(feature_type text, feature_id text, label text, lat double precision, lng double precision, distance_km double precision)
LANGUAGE sql STABLE AS $$
  WITH src AS (
    SELECT 'runestone'::text AS feature_type, r.id::text AS feature_id, coalesce(r.signum,'runsten') AS label,
           r.coordinates_latitude AS lat, r.coordinates_longitude AS lng
      FROM runic_with_coordinates r WHERE r.coordinates_latitude IS NOT NULL AND r.coordinates_longitude IS NOT NULL
    UNION ALL
    SELECT 'church', c.id::text, c.name, c.lat, c.lng FROM ecclesiastical_sites c
     WHERE c.lat IS NOT NULL AND c.lng IS NOT NULL AND (c.built_from IS NULL OR c.built_from < 1550)
    UNION ALL
    SELECT 'cult_site', cs.id::text, cs.name, cs.lat, cs.lng FROM cult_sites cs WHERE cs.lat IS NOT NULL AND cs.lng IS NOT NULL
    UNION ALL
    SELECT 'estate', e.id::text, e.name, e.lat, e.lng FROM estates e WHERE e.lat IS NOT NULL AND e.lng IS NOT NULL
    UNION ALL
    SELECT 'heritage', h.id::text, coalesce(h.raa_type,'lämning') || CASE WHEN h.name IS NOT NULL AND h.name <> coalesce(h.raa_type,'') THEN ' – ' || h.name ELSE '' END, h.lat, h.lng
      FROM heritage_sites h WHERE h.geom IS NOT NULL AND h.raa_type NOT ILIKE '%kyrk%'
        AND ST_DWithin(h.geom, ST_SetSRID(ST_MakePoint(p_lng, p_lat),4326)::geography, p_radius_km*1000)
    UNION ALL
    SELECT 'maritime_node', m.id::text, m.name, m.lat, m.lng FROM maritime_nodes m WHERE m.lat IS NOT NULL AND m.lng IS NOT NULL
  ),
  dist AS (
    SELECT feature_type, feature_id, label, lat, lng,
           2 * 6371 * asin(sqrt(power(sin(radians(lat - p_lat)/2),2) + cos(radians(p_lat))*cos(radians(lat))*power(sin(radians(lng - p_lng)/2),2))) AS distance_km
      FROM src
  )
  SELECT feature_type, feature_id, label, lat, lng, distance_km FROM dist WHERE distance_km <= p_radius_km ORDER BY distance_km LIMIT p_limit;
$$;
