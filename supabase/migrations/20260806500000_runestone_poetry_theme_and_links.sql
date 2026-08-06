-- Tema: runstenar med poesi/diktmått (skaldisk/eddisk vers). Länkas via has_theme (qualifier notes =
-- diktmått). Stenarna verifierade i runologisk standardlitteratur + webb.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
WITH th AS (
  INSERT INTO public.themes (name, name_en, slug, description, keywords)
  SELECT 'Runstenar med poesi och diktmått', 'Runestones with poetry and verse', 'runstenar-poesi',
    'Runstenar vars text bär skaldisk eller eddisk vers — hjältedikt, diktmått (dróttkvätt/fornyrðislag) och kosmologi. Rökstenen, Karlevistenen, Skarpåkersstenen m.fl.',
    ARRAY['poesi','diktmått','dróttkvätt','fornyrðislag','hjältedikt','skaldik','eddisk']
  WHERE NOT EXISTS (SELECT 1 FROM public.themes WHERE slug = 'runstenar-poesi')
  RETURNING id
),
tid AS (SELECT id FROM th UNION SELECT id FROM public.themes WHERE slug = 'runstenar-poesi')
INSERT INTO public.relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence, created_by)
SELECT r.id, 'has_theme', (SELECT id FROM tid LIMIT 1), jsonb_build_object('notes', v.meter),
       'Kurering (runologisk standardlitteratur; webbverifierad)', 'certain', 'curation:poesi'
FROM (VALUES
  ('Ög 136', 'fornyrðislag / hjältedikt (Teoderik-strofen)'),
  ('Öl 1',   'dróttkvätt — äldsta bevarade skaldestrofen på sten'),
  ('Sö 154', 'eddisk kosmologi (Ragnarök; jfr Völuspá), lönnrunor'),
  ('Sö 179', 'fornyrðislag (Gripsholmsstenen)'),
  ('Sö 338', 'fornyrðislag (Turingestenen)'),
  ('Ög 81',  'fornyrðislag (Högbystenen)')
) AS v(signum, meter)
JOIN public.runic_inscriptions r ON r.signum = v.signum
JOIN public.entity_registry er ON er.id = r.id AND er.entity_type = 'inscription'
WHERE NOT EXISTS (
  SELECT 1 FROM public.relationship x
  WHERE x.subject_id = r.id AND x.predicate = 'has_theme' AND x.object_id = (SELECT id FROM tid LIMIT 1));

CREATE OR REPLACE FUNCTION public.inscriptions_by_theme(p_slug text)
 RETURNS jsonb LANGUAGE sql STABLE SET search_path TO 'public' AS $fn$
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', r.id, 'signum', r.signum,
    'name', coalesce(nullif(r.name,''), r.signum),
    'socken', r.socken, 'landscape', r.landscape,
    'meter', rel.qualifiers->>'notes'
  ) ORDER BY r.signum), '[]'::jsonb)
  FROM public.themes t
  JOIN public.relationship rel ON rel.object_id = t.id AND rel.predicate = 'has_theme'
  JOIN public.runic_inscriptions r ON r.id = rel.subject_id
  WHERE t.slug = p_slug;
$fn$;
