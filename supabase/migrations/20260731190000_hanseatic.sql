-- 20260731190000_hanseatic.sql
-- Hansalager: Hanseförbundets städer + Kontor (senmedeltid ~1200–1500). Städer med
-- VERIFIERADE Wikidata-koordinater (P625). Rutterna läggs som rekonstruerade ben i
-- fairways (fairway_kind='hanseatic') — schematiskt stad-till-stad-nätverk, EJ uppmätt
-- segelgeometri. Knyter Visby/Kalmar/Stockholm till maritime_nodes & Valdemarsleden.
CREATE TABLE IF NOT EXISTS public.hanseatic_cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,           -- historiskt/hanseatiskt namn
  name_modern text,             -- modernt namn om annat
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  geom geometry(Point,4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED,
  country text,
  role text NOT NULL DEFAULT 'member'
    CHECK (role IN ('hauptstadt','kontor','member','associated')),
  kontor_name text,             -- Peterhof / Bryggen / Kontor Brügge / Stalhof
  flourished_from int DEFAULT 1200,
  flourished_to int DEFAULT 1500,
  wikidata_qid text,
  source_uri text UNIQUE,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hanseatic_cities_geom ON public.hanseatic_cities USING gist(geom);
ALTER TABLE public.hanseatic_cities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hanseatic_cities public read" ON public.hanseatic_cities;
CREATE POLICY "hanseatic_cities public read" ON public.hanseatic_cities FOR SELECT USING (true);
DROP POLICY IF EXISTS "hanseatic_cities admin write" ON public.hanseatic_cities;
CREATE POLICY "hanseatic_cities admin write" ON public.hanseatic_cities FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
COMMENT ON TABLE public.hanseatic_cities IS
  'Hanseförbundets städer + 4 Kontor (Peterhof/Bryggen/Brügge/Stalhof). Verifierade Wikidata-koord (P625). '
  'Rutter i fairways (fairway_kind=hanseatic, schematiskt nätverk). Se migr. 20260731190000.';
