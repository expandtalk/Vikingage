-- Ramverk för platser med OKÄNT/omtvistat/multipelt läge: monument vs ursprunglig
-- plats vs kandidatpunkter. Återanvändbart (Mora stenar först; framtida förlorade/
-- omtvistade platser). En rad = en hypotes/punkt om VAR något låg.
-- Integritet: en 'lost'-rad utan koordinat är helt legitim — vi gissar inte lägen.

CREATE TABLE IF NOT EXISTS public.location_hypotheses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name text NOT NULL,          -- 'Mora stenar'
  feature_slug text,                   -- 'mora-stenar'
  kind text NOT NULL,                  -- monument | reference | candidate | lost
  label text,
  lat double precision,
  lng double precision,
  geom geometry(Point, 4326) GENERATED ALWAYS AS (
    CASE WHEN lat IS NOT NULL AND lng IS NOT NULL
         THEN ST_SetSRID(ST_MakePoint(lng, lat), 4326) END
  ) STORED,
  confidence text,                     -- confirmed | high | medium | low | speculative | unknown
  rationale text,
  source text,
  thing_site_id uuid REFERENCES public.thing_sites(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.location_hypotheses ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='location_hypotheses' AND policyname='location_hypotheses public read') THEN
    CREATE POLICY "location_hypotheses public read" ON public.location_hypotheses FOR SELECT USING (true);
  END IF;
END $$;

-- Mora stenar: monumentet (vi HAR) + ursprunglig plats (okänd) + Daniels natursten-hypotes.
INSERT INTO public.location_hypotheses (feature_name, feature_slug, kind, label, lat, lng, confidence, rationale, source, thing_site_id)
SELECT * FROM (VALUES
  ('Mora stenar', 'mora-stenar', 'monument', 'Mora stenar-monumentet (skyddshus med samlade fragment)',
   59.79773::double precision, 17.78075::double precision, 'confirmed',
   'Skyddshus vid Lagga/Knivsta där bevarade fragment av Mora stenar samlats och ställts ut. Detta är MONUMENTET — inte den ursprungliga kungavalsplatsen.',
   'Nominatim/RAÄ (verifierad koordinat).',
   (SELECT id FROM public.thing_sites WHERE name ILIKE 'Mora stenar' LIMIT 1)),
  ('Mora stenar', 'mora-stenar', 'lost', 'Mora stenar — ursprunglig kungavalsplats (läge okänt)',
   NULL, NULL, 'unknown',
   'Medeltida plats där svenska kungar valdes och hyllades. Den VERKLIGA platsen är okänd — stenarna skingrades/förstördes (tradition: under Gustav Vasa, som suddade spår av kyrka och unionstid). Ungefärligt Mora äng. Flera kandidatpunkter har föreslagits. HYPOTES (Daniel): tingsplatser återanvände befintliga naturstenar i landskapet → kandidater bör sökas bland naturliga stenblock nära tingsväg/Mora äng. Kandidatpunkter läggs in som kind=candidate när de har läge + källa.',
   'Historisk tradition; hypotes under utredning.',
   (SELECT id FROM public.thing_sites WHERE name ILIKE 'Mora stenar' LIMIT 1))
) AS v(feature_name, feature_slug, kind, label, lat, lng, confidence, rationale, source, thing_site_id)
WHERE NOT EXISTS (
  SELECT 1 FROM public.location_hypotheses lh WHERE lh.feature_slug = 'mora-stenar' AND lh.kind = v.kind
);
