-- 20260731180000_fairways.sql
-- Farleder/sjöfartsstråk. Moderna korridorer (HaV, öppna data) fungerar som BASLINJE
-- för handelsleder: navigerbarheten (djup/skydd/chokepoints) är geografiskt stabil, så
-- dagens farled är ett palimpsest av vikinga-/medeltidshandeln. Historiska/period-
-- rekonstruerade farleder kan läggas som egna rader (fairway_kind + period) och jämföras.
CREATE TABLE IF NOT EXISTS public.fairways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  fairway_kind text NOT NULL DEFAULT 'modern_shipping_corridor', -- modern_shipping_corridor | reconstructed | historical
  period text DEFAULT 'nutida',
  vessel_epoch text,          -- för rekonstruerade: vilken epok/skeppstyp leden gäller
  note text,
  source text,
  source_uri text UNIQUE,     -- idempotent
  geom geometry(Geometry,4326),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fairways_geom ON public.fairways USING gist(geom);
ALTER TABLE public.fairways ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fairways public read" ON public.fairways;
CREATE POLICY "fairways public read" ON public.fairways FOR SELECT USING (true);
DROP POLICY IF EXISTS "fairways admin write" ON public.fairways;
CREATE POLICY "fairways admin write" ON public.fairways FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
COMMENT ON TABLE public.fairways IS
  'Farleder. Moderna korridorer (HaV bg-sjofartutanforhavsplan, öppna data) = handelsleds-baslinje. '
  'Rekonstruerade period-farleder (kust-offset per vessel_types.draft) läggs som egna rader för jämförelse. Se migr. 20260731180000.';
