-- Testbok för Steg 0-kedjan: källa m. ISBN → documents-länk → surfar i söksvaret m. "Hitta boken".
-- Erik Petersson, "Drottning Margaretas dröm" (Natur & Kultur, 2023). Metadata; copyrighted.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
INSERT INTO public.historical_sources
  (title, title_en, author, written_year, covers_period_start, covers_period_end,
   reliability, language, kind, rights, work_type, isbn, copyrighted_editions, description)
SELECT
  'Drottning Margaretas dröm', 'Queen Margaret''s Dream', 'Erik Petersson', 2023, 1375, 1412,
  'secondary'::source_reliability, 'svenska', 'publication'::source_kind, 'copyrighted'::source_rights,
  'historisk biografi', '9789127176645', 'Natur & Kultur, 2023 (tryckt i Lettland). ISBN 978-91-27-17664-5.',
  'Biografi över drottning Margareta och hennes vision om ett enat nordiskt rike — Kalmarunionen.'
WHERE NOT EXISTS (SELECT 1 FROM public.historical_sources s WHERE s.isbn = '9789127176645' OR s.title = 'Drottning Margaretas dröm');

INSERT INTO public.relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence, created_by)
SELECT s.id, 'documents', 'fdee4572-6c0f-4472-8c9b-9e1ceed804fe',
       jsonb_build_object('note','drottning Margareta och Kalmarunionens grundläggning'),
       'Metadata (Erik Petersson, Natur & Kultur 2023), användaruppgift 2026-08-06', 'certain', 'curation:test-book'
FROM public.historical_sources s
WHERE s.isbn = '9789127176645'
  AND NOT EXISTS (
    SELECT 1 FROM public.relationship r
    WHERE r.subject_id = s.id AND r.predicate = 'documents'
      AND r.object_id = 'fdee4572-6c0f-4472-8c9b-9e1ceed804fe');
