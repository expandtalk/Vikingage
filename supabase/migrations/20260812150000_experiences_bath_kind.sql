-- Härledd badtyp ur NAMNET (märks härledd, ej påhitt). Inomhus/simhall finns EJ i HaV-datan (0) →
-- kräver egen ingest. hundbad/nakenbad/barnbad/klippbad ur namnmönster; resten = naturbad (utomhus).
-- Resultat 2026-08-12: naturbad 2631, hundbad 18, barnbad 12, klippbad 3, nakenbad 2.
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS bath_kind text;
COMMENT ON COLUMN public.experiences.bath_kind IS 'Härledd badtyp ur namnmönster (naturbad/hundbad/nakenbad/barnbad/klippbad) — granskningsbar, ej källbelagd per plats. Inomhus/simhall saknas (egen ingest).';

UPDATE public.experiences SET bath_kind = CASE
  WHEN category <> 'badplats' THEN NULL
  WHEN name ILIKE '%hundbad%' THEN 'hundbad'
  WHEN name ILIKE '%naken%' OR name ILIKE '%nudist%' THEN 'nakenbad'
  WHEN name ILIKE '%barnbad%' OR name ILIKE '%barn%' THEN 'barnbad'
  WHEN name ILIKE '%klippbad%' THEN 'klippbad'
  ELSE 'naturbad'
END
WHERE category = 'badplats';
