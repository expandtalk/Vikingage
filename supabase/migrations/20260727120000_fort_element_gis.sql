-- Befästnings-GIS för medeltida stadsmurar/hamnar (Kalmar gamla stad först).
-- Design: Daniels GIS-uppställning. Lagras i EPSG:3006 (SWEREF99TM), serveras 4326 via RPC.
-- Kärnprincip: evidence + pos_accuracy_m PER SEGMENT — muren är utgrävd på punkter,
-- interpolerad på resten, och det ska synas (osäkerhetsband i renderingen).
--
-- OBS geometri: fylls via QGIS-georeferering -> ogr2ogr staging -> INSERT (se ingest-not nedan).
-- Vi seedar INGA påhittade koordinater — portarnas läge är målvariabler, ej indata.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS public.fort_source (
  id bigserial PRIMARY KEY,
  citation text,
  archive text,
  signum text,
  year int,
  url text,
  source_type text  -- historisk_karta | utgravningsrapport | kmr | sekundarlitteratur
);

CREATE TABLE IF NOT EXISTS public.fort_element (
  id            bigserial PRIMARY KEY,
  site          text NOT NULL,                 -- 'Kalmar gamla stad'
  element_type  text NOT NULL,                 -- kurtin|torn|port|vallgrav|bastion|kaj
  name          text,                          -- 'Norreport'
  start_earliest int, start_latest int,        -- fyrdatumsmodell (Allen-intervall)
  end_earliest   int, end_latest   int,
  evidence      text NOT NULL
                CHECK (evidence IN ('utgravd','dokumenterad','rekonstruerad','hypotetisk')),
  pos_accuracy_m numeric,                       -- sqrt(rmse^2 + linjebredd^2 + tolkning^2)
  geom          geometry(Geometry,3006) NOT NULL,
  created_at    timestamptz DEFAULT now(),
  CONSTRAINT chk_kronologi CHECK (
    COALESCE(start_latest,start_earliest) <= COALESCE(end_earliest,end_latest)
    AND start_earliest <= COALESCE(start_latest,start_earliest)),
  CONSTRAINT chk_inom_sverige CHECK (
    ST_X(ST_Centroid(geom)) BETWEEN 200000 AND 950000
    AND ST_Y(ST_Centroid(geom)) BETWEEN 6100000 AND 7700000)
);
CREATE INDEX IF NOT EXISTS fort_element_geom_gix ON public.fort_element USING gist (geom);

CREATE TABLE IF NOT EXISTS public.fort_element_source (
  element_id bigint REFERENCES public.fort_element(id) ON DELETE CASCADE,
  source_id  bigint REFERENCES public.fort_source(id) ON DELETE CASCADE,
  note text,
  PRIMARY KEY (element_id, source_id)
);

-- RLS: publik läsning (samma mönster som övriga referenslager).
ALTER TABLE public.fort_element ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fort_source ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fort_element_source ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='fort_element' AND policyname='fort_element public read')
    THEN CREATE POLICY "fort_element public read" ON public.fort_element FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='fort_source' AND policyname='fort_source public read')
    THEN CREATE POLICY "fort_source public read" ON public.fort_source FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='fort_element_source' AND policyname='fort_element_source public read')
    THEN CREATE POLICY "fort_element_source public read" ON public.fort_element_source FOR SELECT USING (true); END IF;
END $$;

-- Kontinuerlig temporal säkerhetsgrad ur fyrdatumsmodellen (0..1) -> opacitet i kartan.
CREATE OR REPLACE FUNCTION public.temporal_certainty(se int, sl int, ee int, el int, t int)
RETURNS numeric LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN t < se OR t > el                              THEN 0
    WHEN t >= COALESCE(sl,se) AND t <= COALESCE(ee,el) THEN 1
    WHEN t < COALESCE(sl,se)  THEN COALESCE((t-se)::numeric / NULLIF(sl-se,0), 1)
    ELSE                            COALESCE((el-t)::numeric / NULLIF(el-ee,0), 1)
  END;
$$;

-- GeoJSON-endpoint: alla element som "existerar" år p_year, med osäkerhetsband (halo) + källor.
CREATE OR REPLACE FUNCTION public.fort_at(
  p_year int,
  p_site text DEFAULT 'Kalmar gamla stad',
  p_min_certainty numeric DEFAULT 0.01
) RETURNS json LANGUAGE sql STABLE PARALLEL SAFE AS $$
  SELECT json_build_object(
    'type','FeatureCollection',
    'year', p_year,
    'features', COALESCE(json_agg(f ORDER BY f->>'id'), '[]'::json)
  )
  FROM (
    SELECT json_build_object(
      'type','Feature',
      'id', e.id,
      'geometry', ST_AsGeoJSON(ST_Transform(e.geom,4326),6)::json,
      'properties', json_build_object(
        'name',       e.name,
        'type',       e.element_type,
        'evidence',   e.evidence,
        'accuracy_m', e.pos_accuracy_m,
        'certainty',  round(public.temporal_certainty(e.start_earliest,e.start_latest,
                                                      e.end_earliest,e.end_latest,p_year),2),
        'span',       format('%s–%s', COALESCE(e.start_latest,e.start_earliest),
                                      COALESCE(e.end_earliest,e.end_latest)),
        'halo', CASE WHEN e.pos_accuracy_m > 0 THEN
                  ST_AsGeoJSON(ST_Transform(
                    ST_Buffer(e.geom, e.pos_accuracy_m, 'quad_segs=4'),4326),5)::json END,
        'sources', (SELECT COALESCE(json_agg(json_build_object(
                      'citation',s.citation,'archive',s.archive,'signum',s.signum,
                      'year',s.year,'url',s.url)),'[]'::json)
                    FROM public.fort_element_source es JOIN public.fort_source s ON s.id=es.source_id
                    WHERE es.element_id=e.id)
      )
    ) AS f
    FROM public.fort_element e
    WHERE e.site = p_site
      AND public.temporal_certainty(e.start_earliest,e.start_latest,
                                    e.end_earliest,e.end_latest,p_year) >= p_min_certainty
  ) q;
$$;
GRANT EXECUTE ON FUNCTION public.fort_at(int,text,numeric) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.temporal_certainty(int,int,int,int,int) TO anon, authenticated;

-- Källposter (verifierade citat ur underlaget). Georefereringen läggs som egen källpost
-- NÄR den är gjord (transform_type, gcp_count, rmse_m + peka på GCP-fil i repot).
INSERT INTO public.fort_source (citation, archive, signum, year, source_type, url)
SELECT * FROM (VALUES
  ('Dominicus Pahrs karta över Kalmar slott och stad (medeltida stadsmur innanför 1500-talets befästningsverk)',
   'Krigsarkivet, Stads- och fästningsplaner', 'SE/KrA/0424/058/047', 1585, 'historisk_karta', NULL),
  ('Arkeologiska undersökningar av Kalmars stadsmur (Rosman 1920-tal; Åkerlund 1930-tal Slottsfjärden; ledningsschakt m.fl.; Kalmar konstmuseum 2006)',
   'Kalmar läns museum / Arkeologerna', NULL, NULL, 'utgravningsrapport', NULL),
  ('Det medeltida Kalmar blir synligt — stadsmurens sträckning, torn och portar (Norreport/Västerport/Söderport, watnportar, Munkeporten, Timmerporten)',
   'Arkeologerna (Statens historiska museer), CC BY', NULL, 2025, 'sekundarlitteratur', NULL)
) AS v(citation, archive, signum, year, source_type, url)
WHERE NOT EXISTS (SELECT 1 FROM public.fort_source s2 WHERE s2.citation = v.citation);
