-- Evidensbaserad datering (fingerprint-modellen, B-specen): intervall + metod + konfidens
-- + länkad evidens, ALDRIG ett påhittat mätt år. Pilot: Årsta skålgropssten.
CREATE TABLE IF NOT EXISTS public.rock_art_dating (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  heritage_source_uri text,          -- länk till heritage_sites.source_uri
  site_name text,
  date_from int, date_to int,        -- härlett intervall (negativt = f.Kr.); NULL = odaterad
  date_basis text,                   -- shoreline_min | overlying_c14_max | typology | superposition | association
  confidence text,                   -- hög | medel | låg
  evidence_refs text[],              -- source_uris till stödjande undersökningar/lämningar
  note text, sources text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.rock_art_dating ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rock_art_dating' AND policyname='rad_read') THEN
    CREATE POLICY rad_read ON public.rock_art_dating FOR SELECT USING (true); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rock_art_dating' AND policyname='rad_write') THEN
    CREATE POLICY rad_write ON public.rock_art_dating FOR ALL USING (is_admin()) WITH CHECK (is_admin()); END IF;
END $$;

INSERT INTO public.rock_art_dating
  (heritage_source_uri, site_name, date_from, date_to, date_basis, confidence, evidence_refs, note, sources)
SELECT 'Fornsök RAÄ Brännkyrka 222:1',
  'Skålgropssten RAÄ Brännkyrka 222:1 (Årsta/Östberga)',
  -1800, 500, 'typologi + association', 'låg',
  ARRAY(SELECT source_uri FROM public.archaeological_investigations
        WHERE 'Årsta' = ANY(keywords)
          AND (title ILIKE '%Göta landsväg%' OR title ILIKE '%Skyttevärnet%') LIMIT 6),
  'Skålgropar går EJ att C14-datera (ingen organik i berget) — ingen mätt ålder finns. Datering = typokronologi (skålgropar bronsålder–äldre järnålder, ~1800 f.Kr.–500 e.Kr.) + kontext/association med Årstafältets brons-/järnålderskomplex. Brett intervall, LÅG konfidens. Exempel på evidensbaserad datering (fingerprint-modellen).',
  'RAÄ Brännkyrka 222:1; Årstafältets undersökningar (Göta landsväg, Skyttevärnet)'
WHERE NOT EXISTS (SELECT 1 FROM public.rock_art_dating WHERE heritage_source_uri='Fornsök RAÄ Brännkyrka 222:1');
