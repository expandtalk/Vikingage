-- Dubblett-rekonciliering v2: BEBTÄTTX-ankare + kommun-klustring för BEBYGGELSE, avstånd för terräng.
--
-- v1 (20260815120000) använde ren DBSCAN 500 m → misslyckades för utspridda tätorter (Borgholms
-- olika etikettpunkter ligger >500 m isär → hamnade i skilda kluster, "Borgholm ×4" kvarstod).
--
-- v2 (per centrum-diskussionen, se docs/temporal-nucleus-spec.md):
--   • BEBYGGELSE-typer (tätort/bebyggelse/trakt + OSM place-noder) klustras på (normaliserat namn +
--     KOMMUN via punkt-i-polygon mot admin_boundaries) — robust: samma namn i samma kommun = samma ort.
--   • Övriga (terräng/vatten/natur) klustras på avstånd (DBSCAN eps_m) — samma namn kan vara skilda platser.
--   • Kanonisk väljs: BEBTÄTTX (tätortspunkt = ankaret) först, sedan källa (LM>Wikidata>OSM), sedan sitelinks.
-- Idempotent: nollställer scope först, räknar om. Icke-destruktivt (superseded_by, inga raderingar).

CREATE OR REPLACE FUNCTION public.reconcile_place_name_clusters(
  eps_m double precision DEFAULT 500,
  only_bbox geometry DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql AS $$
DECLARE n integer;
BEGIN
  -- Nollställ scope (algoritm-agnostisk idempotens).
  UPDATE public.place_names p SET superseded_by = NULL
   WHERE superseded_by IS NOT NULL
     AND (only_bbox IS NULL OR ST_Intersects(ST_SetSRID(ST_MakePoint(p.lng, p.lat), 4326), only_bbox));

  WITH scope AS (
    SELECT p.id, p.source, p.feature_type, p.wikidata_sitelinks, p.lat, p.lng,
           lower(unaccent(btrim(p.name))) AS nk,
           (p.feature_type IN ('BEBTÄTTX','BEBTX','TRAKTTX','osm_city','osm_town','osm_village','osm_hamlet')) AS is_settlement,
           (p.feature_type = 'BEBTÄTTX') AS is_tatort
    FROM public.place_names p
    WHERE p.name IS NOT NULL AND btrim(p.name) <> '' AND p.lat IS NOT NULL AND p.lng IS NOT NULL
      AND (only_bbox IS NULL OR ST_Intersects(ST_SetSRID(ST_MakePoint(p.lng, p.lat), 4326), only_bbox))
  ),
  kommun AS (
    SELECT s.*,
      (SELECT ab.code FROM public.admin_boundaries ab
        WHERE ab.level='kommun' AND ST_Contains(ab.geom, ST_SetSRID(ST_MakePoint(s.lng, s.lat), 4326))
        LIMIT 1) AS kommun_code
    FROM scope s
  ),
  clustered AS (
    SELECT *,
      CASE
        WHEN is_settlement AND kommun_code IS NOT NULL THEN 'K:' || kommun_code
        ELSE 'D:' || coalesce(
          ST_ClusterDBSCAN(ST_Transform(ST_SetSRID(ST_MakePoint(lng, lat), 4326), 3006), eps_m, 1)
            OVER (PARTITION BY nk, is_settlement)::text, 'x')
      END AS clu
    FROM kommun
  ),
  ranked AS (
    SELECT id,
      row_number() OVER (PARTITION BY nk, clu ORDER BY prio, id) AS rn,
      first_value(id) OVER (PARTITION BY nk, clu ORDER BY prio, id) AS canonical_id
    FROM (
      SELECT id, nk, clu,
        ( (NOT is_tatort)::int * 100000
          + CASE source WHEN 'lantmateriet_ortnamn' THEN 0 WHEN 'Wikidata' THEN 1 WHEN 'wikidata' THEN 1 ELSE 2 END * 1000
          + CASE WHEN is_settlement THEN 0 ELSE 10 END
          - coalesce(wikidata_sitelinks, 0)
        ) AS prio
      FROM clustered
    ) x
  ),
  upd AS (
    UPDATE public.place_names p
       SET superseded_by = r.canonical_id, updated_at = now()
      FROM ranked r
     WHERE p.id = r.id AND r.rn > 1
    RETURNING 1
  )
  SELECT count(*) INTO n FROM upd;
  RETURN n;
END; $$;

COMMENT ON FUNCTION public.reconcile_place_name_clusters(double precision, geometry) IS
  'v2: BEBYGGELSE klustras på (normaliserat namn + kommun via admin_boundaries), terräng på avstånd (eps_m). Kanonisk = BEBTÄTTX-ankare först, sedan LM>Wikidata>OSM. Icke-destruktivt (superseded_by), idempotent, only_bbox scope:ar.';
