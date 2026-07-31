-- 20260731160000_maritime_nodes.sql
-- Maritima noder = digital fingerprint-domän för hamnar, öar, grund och sund
-- (marin syster till fornborgs-fingerprintet). En feature-vektor per nod som
-- marinarkeologer kan köra och jämföra: hamnmorfologi, skydd mot förhärskande
-- vind (Kalmarsund = SW, ~228°, verifierat), lämningstäthet per period (ur
-- heritage_sites), strandförskjutnings-justerad tillgänglighet, folktro-täthet.
-- Icke-destruktivt: ny tabell, harbors lämnas orörd (kan migreras in senare).

CREATE TABLE IF NOT EXISTS public.maritime_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  -- hamn/ö/grund/sund/landningsplats/vaktpunkt
  node_type text NOT NULL CHECK (node_type IN ('harbor','island','shallow','strait','landing','watch_point')),
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  geom geometry(Point,4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED,
  period_start int,
  period_end int,
  natural_harbor boolean,
  shelter_index numeric,        -- 0..1, skydd mot förhärskande vind (SW i Kalmarsund)
  wind_exposure text[],         -- exponerade riktningar, t.ex. {SW,S}
  enclosure text,               -- morfologi: 'djupt inskuren' / 'öppen vik' / 'rev' …
  depth_note text,              -- fri djupuppgift tills batymetri ingestas
  shoreline_note text,          -- strandförskjutning / hur läget ändrats över tid
  folklore_note text,           -- sägen/tradition-täthet (liminala öar: Blå Jungfrun, Grimskär)
  hazard_note text,             -- grund: haverier/farlighet
  coord_precision text,         -- forskare / fyrkälla / sweref-konv / approximativ
  description text,
  description_en text,
  sources jsonb DEFAULT '[]'::jsonb,
  source_uri text UNIQUE,       -- idempotent upsert-nyckel
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maritime_nodes_geom ON public.maritime_nodes USING gist(geom);
CREATE INDEX IF NOT EXISTS idx_maritime_nodes_type ON public.maritime_nodes(node_type);

-- RLS: publik läsning, admin-skrivning (samma mönster som harbors/heritage_sites).
ALTER TABLE public.maritime_nodes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "maritime_nodes public read" ON public.maritime_nodes;
CREATE POLICY "maritime_nodes public read" ON public.maritime_nodes FOR SELECT USING (true);
DROP POLICY IF EXISTS "maritime_nodes admin write" ON public.maritime_nodes;
CREATE POLICY "maritime_nodes admin write" ON public.maritime_nodes FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

COMMENT ON TABLE public.maritime_nodes IS
  'Maritima noder (hamn/ö/grund/sund) med fingerprint-attribut: morfologi, vindskydd, '
  'strandförskjutning, folktro. Lämningstäthet per period härleds ur heritage_sites via bbox/radie. '
  'Kalmarsund förhärskande vind = SW ~228° (windfinder Kalmar). Se migration 20260731160000.';
