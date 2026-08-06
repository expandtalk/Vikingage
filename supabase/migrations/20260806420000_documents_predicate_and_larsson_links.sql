-- Nytt predikat: en KÄLLA behandlar/dokumenterar en godtycklig entitet (person, region, händelse).
-- Fyller luckan mellan mentions_inscription (källa→inskrift) och has_theme (→tema). Metadata gör
-- källor kopplingsbara till andra objekt i grafen (Daniel).
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
INSERT INTO public.rel_predicates (code, label_sv, label_en, subject_type, object_type, qualifier_schema, description)
SELECT 'documents', 'behandlar', 'documents / treats', 'source', '*', '{"note":"text"}'::jsonb,
  'Källan (bok/artikel/urkund) behandlar/dokumenterar entiteten som sitt ämne — härlett ur källans metabeskrivning (omfång: personer, region, period).'
WHERE NOT EXISTS (SELECT 1 FROM public.rel_predicates p WHERE p.code = 'documents');

-- Koppla Lars-Olof Larssons fyra verk till de personer/region de behandlar (ur metabeskrivningarna).
INSERT INTO public.relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence, created_by)
SELECT v.subj::uuid, 'documents', v.obj::uuid, jsonb_build_object('note', v.note),
       'Metabeskrivning från böckerna (Lars-Olof Larsson), användaruppgift 2026-08-06', 'certain', 'curation:larsson-books'
FROM (VALUES
  -- Arvet efter Gustav Vasa → Gustav Vasa, Erik XIV, Karl IX
  ('12a56c62-5e72-4b52-8342-673f615ab6b5','279b632e-6b31-407b-9e6e-3b1d286f61ba','arvsstriden efter Gustav Vasa'),
  ('12a56c62-5e72-4b52-8342-673f615ab6b5','0e8ba53a-afb4-49cf-a258-7e6ce06b4a60','Sturemorden 1567'),
  ('12a56c62-5e72-4b52-8342-673f615ab6b5','f04c40a2-7404-4719-8bde-cdfc76b5476a','uppgörelserna med motståndarna'),
  -- Gustav Vasa – landsfader eller tyrann? → Gustav Vasa
  ('8781e6e9-7288-465c-8a4b-765e4cda1813','279b632e-6b31-407b-9e6e-3b1d286f61ba','biografisk omprövning'),
  -- Kalmarunionens tid → Margareta, Kristian II
  ('6f36cd96-8948-404b-89e0-27a8f8dc7998','fdee4572-6c0f-4472-8c9b-9e1ceed804fe','unionens grundläggning'),
  ('6f36cd96-8948-404b-89e0-27a8f8dc7998','53547336-15df-44b0-b1db-16105330be64','unionens upplösning'),
  -- Det medeltida Värend → Småland (Värend = medeltida gränsland i Småland)
  ('9ef37a67-4ed6-4e64-966f-d9e0d18fbf24','5768ce85-8ad2-99c5-c466-b9bf6ceb7f4b','Värend, medeltida gränsland i Småland')
) AS v(subj,obj,note)
WHERE NOT EXISTS (
  SELECT 1 FROM public.relationship r
  WHERE r.subject_id = v.subj::uuid AND r.predicate = 'documents' AND r.object_id = v.obj::uuid
);
