-- Fyra verk av Lars-Olof Larsson (prof. em. i historia, Linnéuniversitetet) → historical_sources.
-- Sekundärlitteratur, upphovsrättsskyddad → rights='copyrighted': endast metadata/fakta lagras,
-- ingen verbatim brödtext. ISBN/förlag i copyrighted_editions. Osäkra OCR-detaljer utelämnade
-- (ingen gissning). Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
INSERT INTO public.historical_sources
  (title, title_en, author, written_year, covers_period_start, covers_period_end,
   reliability, language, kind, rights, work_type, copyrighted_editions, description)
SELECT * FROM (VALUES
  ('Arvet efter Gustav Vasa',
   'The Legacy of Gustav Vasa',
   'Lars-Olof Larsson', 2005, 1560, 1611, 'secondary'::source_reliability, 'svenska',
   'publication'::source_kind, 'copyrighted'::source_rights, 'historisk monografi',
   'Prisma (Norstedts förlagsgrupp AB), 2005. ISBN 978-91-518-4203-5.',
   'Behandlar striden mellan Gustav Vasas söner om arvet efter fadern — bl.a. Erik XIV och Sturemorden 1567 samt Karl IX:s hårda uppgörelser med sina motståndare.'),
  ('Kalmarunionens tid – från drottning Margareta till Kristian II',
   'The Era of the Kalmar Union – from Queen Margaret to Christian II',
   'Lars-Olof Larsson', NULL, 1389, 1523, 'secondary'::source_reliability, 'svenska',
   'publication'::source_kind, 'copyrighted'::source_rights, 'historisk monografi',
   'ISBN 91-518-4217-3.',
   'Skildrar vägen till och tiden för Kalmarunionen — tre riken under en monark, från drottning Margareta till Kristian II, med unionsvälde och kungaval.'),
  ('Gustav Vasa – landsfader eller tyrann?',
   'Gustav Vasa – Father of the Nation or Tyrant?',
   'Lars-Olof Larsson', 2002, 1496, 1560, 'secondary'::source_reliability, 'svenska',
   'publication'::source_kind, 'copyrighted'::source_rights, 'historisk biografi',
   'ISBN 91-518-3904-0, 2002.',
   'Biografisk omprövning av Gustav Vasa — frågan om han bör ses som landsfader eller tyrann.'),
  ('Det medeltida Värend – studier i det småländska gränslandets historia fram till 1500-talets mitt',
   'Medieval Värend – studies in the history of the Småland borderland up to the mid-16th century',
   'Lars-Olof Larsson', 1964, 1100, 1550, 'secondary'::source_reliability, 'svenska',
   'publication'::source_kind, 'copyrighted'::source_rights, 'akademisk avhandling',
   'Tryckt 1964; andra upplagan 1975.',
   'Studier i det medeltida Värends historia — det småländska gränslandet fram till 1500-talets mitt.')
) AS v(title,title_en,author,written_year,covers_period_start,covers_period_end,
       reliability,language,kind,rights,work_type,copyrighted_editions,description)
WHERE NOT EXISTS (SELECT 1 FROM public.historical_sources s WHERE s.title = v.title);
