-- Icke-destruktiv dubblett-rekonciliering för place_names (OSM ↔ Lantmäteriet ↔ Wikidata).
--
-- BAKGRUND: LM-ortnamn (auktoritativt, tätt) lades additivt bredvid OSM. Samma verkliga plats får
-- då flera rader från olika källor (t.ex. "Borgholm" = 3 LM + 1 OSM). LM har dessutom flera punkter
-- per namn (olika detaljtyp: tätort/bebyggelse/trakt). Detta klustrar samma normaliserade namn inom
-- ett avstånd och väljer EN kanonisk rad per kluster; övriga markeras superseded_by (nollställbart).
--
-- INGEN RADERING. Konsumenter (karta/sök) filtrerar `superseded_by IS NULL`.

ALTER TABLE public.place_names
  ADD COLUMN IF NOT EXISTS superseded_by uuid REFERENCES public.place_names(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.place_names.superseded_by IS
  'Icke-destruktiv dedup: satt på lägre-prioriterad dubblett som ersätts av kanonisk rad i samma namnkluster. NULL = gällande/kanonisk. Konsumenter filtrerar superseded_by IS NULL. Nollställ med reconcile-funktionen eller UPDATE ... SET superseded_by=NULL.';

CREATE INDEX IF NOT EXISTS idx_place_names_superseded_by ON public.place_names(superseded_by);
-- Snabbar upp konsumenternas WHERE superseded_by IS NULL:
CREATE INDEX IF NOT EXISTS idx_place_names_canonical ON public.place_names(id) WHERE superseded_by IS NULL;

-- Rekoncilierings-pass. Klustrar per normaliserat namn (lower+unaccent) med DBSCAN i meter (EPSG:3006),
-- väljer kanonisk per (namn, kluster) och markerar övriga superseded_by. Idempotent + scope:bar via bbox.
-- Källprioritet: Lantmäteriet > Wikidata > OSM > övrigt. Inom källa: bebyggelsetyp först, sen sitelinks.
CREATE OR REPLACE FUNCTION public.reconcile_place_name_clusters(
  eps_m double precision DEFAULT 500,
  only_bbox geometry DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql AS $$
DECLARE n integer;
BEGIN
  WITH scope AS (
    SELECT id, source, feature_type, wikidata_sitelinks, lat, lng,
           lower(unaccent(btrim(name))) AS nk
    FROM public.place_names
    WHERE name IS NOT NULL AND btrim(name) <> '' AND lat IS NOT NULL AND lng IS NOT NULL
      AND (only_bbox IS NULL OR ST_Intersects(ST_SetSRID(ST_MakePoint(lng, lat), 4326), only_bbox))
  ),
  clustered AS (
    SELECT *,
           ST_ClusterDBSCAN(ST_Transform(ST_SetSRID(ST_MakePoint(lng, lat), 4326), 3006), eps_m, 1)
             OVER (PARTITION BY nk) AS cid
    FROM scope
  ),
  ranked AS (
    SELECT id, nk, cid,
      row_number() OVER (PARTITION BY nk, cid ORDER BY prio) AS rn,
      first_value(id) OVER (PARTITION BY nk, cid ORDER BY prio) AS canonical_id
    FROM (
      SELECT id, nk, cid,
        ( CASE source WHEN 'lantmateriet_ortnamn' THEN 0
                      WHEN 'Wikidata' THEN 1 WHEN 'wikidata' THEN 1
                      ELSE 2 END * 1000000
          + CASE WHEN feature_type IN ('BEBTÄTTX','BEBTX','TRAKTTX') THEN 0 ELSE 1000 END
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
       AND p.superseded_by IS DISTINCT FROM r.canonical_id
    RETURNING 1
  ),
  reset AS (
    -- Rader som nu är kanoniska men tidigare var superseded → nollställ (idempotens).
    UPDATE public.place_names p
       SET superseded_by = NULL, updated_at = now()
      FROM ranked r
     WHERE p.id = r.id AND r.rn = 1 AND p.superseded_by IS NOT NULL
    RETURNING 1
  )
  SELECT (SELECT count(*) FROM upd) INTO n;
  RETURN n;
END; $$;

COMMENT ON FUNCTION public.reconcile_place_name_clusters(double precision, geometry) IS
  'Icke-destruktiv dubblett-rekonciliering: klustrar place_names på normaliserat namn inom eps_m meter, väljer kanonisk per kluster (LM>Wikidata>OSM, bebyggelsetyp först) och sätter superseded_by på övriga. Idempotent. only_bbox scope:ar passet. Returnerar antal nymarkerade rader.';
