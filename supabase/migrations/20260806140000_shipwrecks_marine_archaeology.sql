-- Marinarkeologi-domän: skeppsvrak som egen tabell ovanpå befintlig ontologi
-- (mönster som swedish_hillforts — INGEN parallell graf). 2026-08-06.
-- Återbruk: 14C→radiocarbon_dates, materialanalys→material_analyses,
-- fältarbete→archaeological_investigations, förlisning/slag→historical_events,
-- rapport/skeppsbiografi→historical_sources. Applicerad i prod via MCP.

CREATE TABLE IF NOT EXISTS public.shipwrecks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  also_known_as text[],
  survey_label text,
  vessel_type text,
  identification text,
  identification_confidence text,   -- high|probable|possible|uncertain
  construction text,
  wood_species text,
  length_m numeric, beam_m numeric, water_depth_m numeric,
  dating_summary text,
  dating_earliest integer, dating_latest integer,
  dating_method text,               -- dendrochronology|radiocarbon|typology|historical
  dating_confidence text,
  sinking_year integer, sinking_event text,
  raa_number text, fornreg_ref text,
  parish text, municipality text, landscape text,
  geom geometry(Point,4326),
  coord_source text, coord_precision_m integer,
  source_ref text, source_license text, source_attribution text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shipwrecks_geom ON public.shipwrecks USING gist(geom);
ALTER TABLE public.shipwrecks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS shipwrecks_read ON public.shipwrecks;
CREATE POLICY shipwrecks_read ON public.shipwrecks FOR SELECT USING (true);

INSERT INTO public.ontology_entity_types
 (code, label_sv, label_en, physical_table, id_column, coord_kind, provenance_columns, status, description)
VALUES
 ('shipwreck','Skeppsvrak','Shipwreck','shipwrecks','id','point','source_ref,source_license,coord_source','active',
  'Marinarkeologiskt vrak (fartygslämning): position, konstruktion, datering, identifiering + konfidens, förlisning.')
ON CONFLICT (code) DO NOTHING;

-- SEED (applicerad via MCP): 5 vrak i Kalmarsund ur CC BY 4.0-rapporten
-- Warming, R., Palm, V. & Rönnby, J. 2026. Arkeologisk fältdokumentation — 5 vrak i Kalmarsund.
-- Västerviks Museums Förlag. Lst dnr 3084/3087-2025. Fornreg 202500483.
-- Koordinater: SWEREF99TM (rapport) → WGS84 via ST_Transform(...,3006→4326), auktoritativt.
--   Vrak 1 Nya Enigheden (linjeskepp, Enigheden 1679, dendro efter 1632)   E 584577.937 N 6278846.66
--   Vrak 2 (brännare, ev. S:t Johannes 1679, odaterad)                     E 584558.258 N 6279367.713
--   Vrak 3 (brännare, ev. S:t Peder 1679, odaterad)                        E 584562.457 N 6279362.23
--   Vrak 4 Skäggenäsvraket (fraktskepp, 1600-tal keramik, syd Revsudden)   E 590444.827 N 6292794.35
--   Vrak 5 Furuvraket (furu, 14C tidigast ~1680-tal)                       E 590526.015 N 6292762.7
