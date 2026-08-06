-- "Bondenöd och stormaktsdröm: studier över skedet 1630–1718" av Axel Strindberg (Gidlunds,
-- 3:e uppl. 1988, tryckt i Värnamo). Uppgifterna VERIFIERADE via webbsök (Bokbörsen/Google Books/
-- HathiTrust) — användarens ISBN "91778430038" var 11 siffror (extra 7); korrekt ISBN-10 9178430038
-- → ISBN-13 9789178430031. Metadata; copyrighted.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
INSERT INTO public.historical_sources
  (title, title_en, author, written_year, covers_period_start, covers_period_end,
   reliability, language, kind, rights, work_type, isbn, copyrighted_editions, description)
SELECT
  'Bondenöd och stormaktsdröm', 'Peasant Hardship and Great-Power Dream', 'Axel Strindberg', 1988, 1630, 1718,
  'secondary'::source_reliability, 'svenska', 'publication'::source_kind, 'copyrighted'::source_rights,
  'historisk monografi', '9789178430031',
  'Gidlunds, Stockholm, 3:e uppl. 1988 (tryckt i Värnamo). ISBN 91-7843-003-8 (ISBN-13 978-91-7843-003-1).',
  'Studier över skedet 1630–1718: böndernas villkor ställda mot den svenska stormaktstidens ambitioner (klasskampsperspektiv). Först utgiven 1937.'
WHERE NOT EXISTS (SELECT 1 FROM public.historical_sources s WHERE s.isbn = '9789178430031' OR s.title = 'Bondenöd och stormaktsdröm');
