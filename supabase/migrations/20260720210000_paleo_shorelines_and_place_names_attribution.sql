-- Historisk geodata (Väg A): SGU:s strandförskjutningsmodell som vektor + Isof-attribution.
-- Applicerad via MCP mot fjärr-DB (db push trasig i detta repo) — denna fil är proveniens.
-- Lagras i WGS84 (4326) i linje med heritage_sites/place_names (appen serverar lat/lng).
--
-- Verifierat mot SGU OGC-API (2026): .../strandforskjutningsmodell/ogc/features/v1/
--   * Geometri = Polygon (havsutbredning), lagrings-CRS EPSG:3006.
--   * Kollektioner i BP (år före 1950): bp1-900, bp1000-1900, ... year_ce = 1950 - year_bp.
--     500 e.Kr. = 1450 BP -> bp1000-1900; vikingatid ~1000 e.Kr. = 950 BP -> bp1-900.
--   * Fält: uniktid, bp, year (BP), code, description ("Hav ..."/"Insjö ..."), geom_area, geom_length.
--   * INGET RSL-värde eller min/max: modellen ger EN polygon per 100-årssteg, inte ett band.
--     Osäkerhet bärs därför via rsl_bound='median' + approximativ rendering (NFR-1), inte data.

CREATE TABLE IF NOT EXISTS public.paleo_shorelines (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_label    text,
  year_ce         integer NOT NULL,
  rsl_bound       text NOT NULL DEFAULT 'median' CHECK (rsl_bound IN ('min','median','max')),
  water_body_type text NOT NULL DEFAULT 'sea' CHECK (water_body_type IN ('sea','lake')),
  geom            geometry(MultiPolygon, 4326) NOT NULL,
  model_version   text NOT NULL DEFAULT 'sgu_strandforskjutning',
  source          text NOT NULL DEFAULT 'SGU',
  license         text NOT NULL DEFAULT 'CC-BY-4.0',
  attribution     text NOT NULL DEFAULT 'Sveriges geologiska undersökning (SGU)',
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS paleo_shorelines_geom_gix ON public.paleo_shorelines USING gist (geom);
CREATE INDEX IF NOT EXISTS paleo_shorelines_year_idx ON public.paleo_shorelines (year_ce, rsl_bound);

ALTER TABLE public.paleo_shorelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read paleo_shorelines" ON public.paleo_shorelines FOR SELECT USING (true);
CREATE POLICY "admin write paleo_shorelines" ON public.paleo_shorelines FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
GRANT SELECT ON public.paleo_shorelines TO anon, authenticated;

COMMENT ON TABLE public.paleo_shorelines IS
  'SGU strandförskjutningsmodell (CC-BY) som förberäknade vektorpolygoner per tidsskiva. Väg A i geodata-kravspecen. Osäkerhet bärs via rsl_bound (min/median/max).';

-- place_names: attribution för CC-BY-källor (Isof) + genererad geom för spatiala joins.
ALTER TABLE public.place_names ADD COLUMN IF NOT EXISTS attribution text;
ALTER TABLE public.place_names ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326)
  GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED;
CREATE INDEX IF NOT EXISTS place_names_geom_gix ON public.place_names USING gist (geom);

COMMENT ON COLUMN public.place_names.attribution IS
  'Obligatorisk attributionssträng för CC-BY-källor (t.ex. Isof). Bärs per rad, visas i UI.';
