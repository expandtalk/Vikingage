-- Predikat för vårdplats-koppling (person → institution). Person-social/biografisk KG-kant.
-- Används av Göring→Aspuddens sjukhem/Katarina sjukhus/Långbro sjukhus (medicin-claims, primärkälla Regionarkivet).
INSERT INTO public.rel_predicates (code,label_sv,label_en,subject_type,object_type,qualifier_schema,description,version)
VALUES ('treated_at','vårdad vid','treated at','person','institution',
  '{"year":"text","date":"text","note":"text","source":"text"}'::jsonb,
  'Person vårdad/intagen vid institution (sjukhus/sjukhem). Kurerat, källbelagt.',1)
ON CONFLICT (code) DO NOTHING;
