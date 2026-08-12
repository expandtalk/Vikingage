-- Inskrifts-utformningselement per runinskrift (Bollaert-grupperingar). Claim-liggarmönster:
-- status belagt/hypotes/obelagt + source. Populeras KÄLLBELAGT (runolog/filolog), aldrig gissat.
-- Grupperingar: Johan Bollaert, "Runstenar längs vägen" (Uppsala 2016); poetik = Hübler 1996;
-- status/skriftlighet = Williams 2013. Attundalandsvägen saknas ännu som väg i viking_roads.
CREATE TABLE IF NOT EXISTS public.inscription_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inscription_id uuid NOT NULL REFERENCES public.runic_inscriptions(id) ON DELETE CASCADE,
  feature_type text NOT NULL CHECK (feature_type IN (
    'boneformel','ristarformel','nekrolog','familjerelation','endast_namn',
    'trollformel','kors','flerstensmonument','poetisk','dubbellasning','skiljetecken','ornamentstil')),
  feature_value text,          -- t.ex. Hübler-grupp A/B/C för poetisk, korsform, Gräslund-stil Pr1-5
  status text NOT NULL DEFAULT 'hypotes' CHECK (status IN ('belagt','hypotes','obelagt')),
  source text,                 -- 'Bollaert 2016','Hübler 1996','Rundata','Williams 2013'…
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.inscription_features IS 'Inskrifts-utformningselement (formler, poetik, kors, flerstensmonument m.m.) per runinskrift. Claim-liggarmönster (belagt/hypotes/obelagt + source). Grupperingar efter Johan Bollaert 2016 + Hübler 1996/Williams 2013. Populeras källbelagt, ej gissat.';

CREATE UNIQUE INDEX IF NOT EXISTS inscription_features_uniq
  ON public.inscription_features (inscription_id, feature_type, coalesce(feature_value,''));
CREATE INDEX IF NOT EXISTS inscription_features_insc ON public.inscription_features (inscription_id);
CREATE INDEX IF NOT EXISTS inscription_features_type ON public.inscription_features (feature_type);

ALTER TABLE public.inscription_features ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inscription_features public read" ON public.inscription_features;
CREATE POLICY "inscription_features public read" ON public.inscription_features FOR SELECT USING (true);
DROP POLICY IF EXISTS "inscription_features admin write" ON public.inscription_features;
CREATE POLICY "inscription_features admin write" ON public.inscription_features FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Flaggskepps-seed (belagt, krediterat) — demonstrerar modellen.
INSERT INTO inscription_features (inscription_id, feature_type, feature_value, status, source, note)
SELECT ri.id, v.ft, v.fv, 'belagt', v.src, v.note
FROM runic_inscriptions ri
JOIN (VALUES
  ('Ög 136','poetisk','C (versifierad)','Hübler 1996 / Bollaert 2016','Rökstenen — poetiska partier + chiffer; världens längsta runinskrift'),
  ('Ög 136','dubbellasning',NULL,'Bollaert 2016','12 runor dubbelläses (flest i materialet)'),
  ('U 164','flerstensmonument',NULL,'Bollaert 2016','Jarlabankes bro (Attundalandsvägen); parsten med U 165'),
  ('U 165','flerstensmonument',NULL,'Bollaert 2016','Jarlabankes bro (Attundalandsvägen); parsten med U 164')
) AS v(signum, ft, fv, src, note) ON ri.signum = v.signum
WHERE NOT EXISTS (
  SELECT 1 FROM inscription_features f
  WHERE f.inscription_id=ri.id AND f.feature_type=v.ft AND coalesce(f.feature_value,'')=coalesce(v.fv,''));
