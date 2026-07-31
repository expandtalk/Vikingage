-- 20260731170000_maritime_fingerprint.sql
-- Maritim nod-fingerprint: körbart & jämförbart. Tre delar:
--   1) heritage_epoch() — typologisk epok ur raa_type (period-text override). Aoristisk
--      prior, ej påstående per objekt (jfr TYP≠ÅLDER-disciplinen).
--   2) maritime_node_fingerprint() — täthet/typ-/epokprofil inom radie → jämför noder.
--   3) ship_losses — haverier (orsak = hypotes m. confidence, aldrig påstå) + grund-attribuering.
--   4) vessel_types — indikativa djupgående/sjövärdighet per epok (grund för farled v1).

-- 1) Typologisk epok (immutabel → kan användas i generated/index vid behov)
CREATE OR REPLACE FUNCTION public.heritage_epoch(p_type text, p_period text DEFAULT NULL)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    -- period-text vinner när den finns och är tolkbar
    WHEN p_period ~* 'vikingatid'                         THEN 'vikingatid'
    WHEN p_period ~* 'medeltid|^\s*1[0-4][0-9]{2}'        THEN 'medeltid'
    WHEN p_period ~* 'vendel|folkvandring|romersk|järnålder' THEN 'järnålder'
    WHEN p_period ~* 'bronsålder'                          THEN 'bronsålder'
    WHEN p_period ~* 'stenålder|neolit|mesolit'            THEN 'stenålder'
    WHEN p_period ~* '^\s*1[5-9][0-9]{2}|^\s*20[0-9]{2}'   THEN 'efterreformatorisk'
    -- annars typologisk prior ur lämningstyp
    WHEN p_type ~* 'runsten'                               THEN 'vikingatid'
    WHEN p_type ~* 'hällkista|stenkammargrav|dös|gånggrift' THEN 'stenålder'
    WHEN p_type ~* 'hällristning|röse|skärvstenshög'       THEN 'bronsålder'
    WHEN p_type ~* 'skeppssättning'                        THEN 'järnålder'
    WHEN p_type ~* 'stensättning|gravfält|domarring|fossil åker|åkermark|stensträng|husgrund|hög' THEN 'järnålder'
    WHEN p_type ~* 'fartyg|vrak|båtlämning'               THEN 'medeltid–nyare tid'
    WHEN p_type ~* 'milst|väghålln'                        THEN 'efterreformatorisk'
    WHEN p_type ~* 'kyrka|kloster|kapell|kyrkogård'        THEN 'medeltid'
    ELSE 'okänd'
  END;
$$;

-- 2) Fingerprint: räkna lämningar inom radie kring en nod, per typ och per epok + total.
--    Returnerar (dim, bucket, n, per_km2). dim ∈ total|type|epoch.
CREATE OR REPLACE FUNCTION public.maritime_node_fingerprint(
  p_lat double precision, p_lng double precision, p_radius_km double precision DEFAULT 3
)
RETURNS TABLE(dim text, bucket text, n integer, per_km2 numeric)
LANGUAGE sql STABLE AS $$
  WITH area AS (SELECT (pi() * p_radius_km * p_radius_km) AS km2),
  hits AS (
    SELECT h.raa_type, public.heritage_epoch(h.raa_type, h.period) AS epoch
    FROM heritage_sites h
    WHERE h.geom IS NOT NULL
      AND ST_DWithin(h.geom, ST_SetSRID(ST_MakePoint(p_lng, p_lat),4326)::geography, p_radius_km*1000)
  )
  SELECT 'total'::text, 'alla'::text, count(*)::int, ROUND((count(*)/(SELECT km2 FROM area))::numeric,2) FROM hits
  UNION ALL
  SELECT 'type', raa_type, count(*)::int, ROUND((count(*)/(SELECT km2 FROM area))::numeric,2)
    FROM hits GROUP BY raa_type
  UNION ALL
  SELECT 'epoch', epoch, count(*)::int, ROUND((count(*)/(SELECT km2 FROM area))::numeric,2)
    FROM hits GROUP BY epoch
  ORDER BY 1, 3 DESC;
$$;

-- 3) Haverier / skeppsförlisningar
CREATE TABLE IF NOT EXISTS public.ship_losses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  heritage_site_id uuid REFERENCES public.heritage_sites(id) ON DELETE SET NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  geom geometry(Point,4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED,
  period_start int, period_end int,
  ship_type text,
  depth_m numeric,                       -- NULL tills batymetri ingestas
  cause text NOT NULL DEFAULT 'unknown'
    CHECK (cause IN ('grounding','battle','storm','ice','fire','scuttled','abandoned','unknown')),
  cause_confidence text NOT NULL DEFAULT 'unknown'
    CHECK (cause_confidence IN ('documented','probable','hypothesis','unknown')),
  cause_basis text,                      -- grund för orsaksbedömningen
  attributed_node_id uuid REFERENCES public.maritime_nodes(id) ON DELETE SET NULL,
  source text, source_uri text UNIQUE, notes text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ship_losses_geom ON public.ship_losses USING gist(geom);
ALTER TABLE public.ship_losses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ship_losses public read" ON public.ship_losses;
CREATE POLICY "ship_losses public read" ON public.ship_losses FOR SELECT USING (true);
DROP POLICY IF EXISTS "ship_losses admin write" ON public.ship_losses;
CREATE POLICY "ship_losses admin write" ON public.ship_losses FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
COMMENT ON TABLE public.ship_losses IS
  'Skeppsförlisningar. cause+cause_confidence: grundstötning m.m. anges bara som HYPOTES vid '
  'rumslig närhet till namngivet grund — aldrig påstådd orsak utan dokumentär källa. depth_m NULL tills batymetri.';

-- 4) Fartygstyper (indikativt djupgående/sjövärdighet per epok — grund för farled v1)
CREATE TABLE IF NOT EXISTS public.vessel_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, name_en text, epoch text,
  period_start int, period_end int,
  draft_m numeric,            -- ungefärligt djupgående
  open_water_km numeric,      -- rimlig öppensjö-korsning (sjövärdighet)
  propulsion text,            -- paddel/rodd/segel
  seaworthiness text, notes text, source text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.vessel_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vessel_types public read" ON public.vessel_types;
CREATE POLICY "vessel_types public read" ON public.vessel_types FOR SELECT USING (true);
DROP POLICY IF EXISTS "vessel_types admin write" ON public.vessel_types;
CREATE POLICY "vessel_types admin write" ON public.vessel_types FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
COMMENT ON TABLE public.vessel_types IS
  'Indikativa fartygsparametrar per epok (experimentell arkeologi: Hjortspring/Nydam/Skuldelev/Bremerkoggen). '
  'draft_m + open_water_km driver farled v1 (kusthuggnings-index): grundgående kusthuggare vs öppensjö-farkoster.';

INSERT INTO public.vessel_types (name, name_en, epoch, period_start, period_end, draft_m, open_water_km, propulsion, seaworthiness, notes, source)
VALUES
  ('Stockbåt/eka','Logboat','stenålder',-4000,-1800,0.2,2,'paddel','kusthuggare','Grundgående, endast skyddat vatten','indikativt'),
  ('Plankbåt (Hjortspringtyp)','Plank boat','bronsålder',-1800,-500,0.4,8,'paddel','kusthuggare','Sydd plankbåt; kustnära, skärgårdsled','indikativt (Hjortspring)'),
  ('Rodd-/paddelfarkost (Nydamtyp)','Rowed craft','järnålder',-500,800,0.5,15,'rodd','kustnära','Klinkbyggd men segellös; följer kusten','indikativt (Nydam)'),
  ('Långskepp/knarr','Longship/knarr','vikingatid',800,1050,1.0,150,'segel','öppet vatten','Köl+segel → öppensjö; knarr djupare lastdragare','indikativt (Skuldelev)'),
  ('Kogg','Cog','medeltid',1150,1450,2.5,300,'segel','öppet vatten','Djupgående lastfartyg; kräver djupare farled/hamn','indikativt (Bremerkoggen)')
ON CONFLICT DO NOTHING;
