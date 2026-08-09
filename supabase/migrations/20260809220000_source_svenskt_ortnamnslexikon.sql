-- Registrera Svenskt ortnamnslexikon (SOL 2003, Mats Wahlberg red., SOFI) som källa.
-- FULLTEXT02.pdf i repot = detta verk. UPPHOVSRÄTTSSKYDDAT (© 2003 SOFI): endast fakta får
-- återges med citat, aldrig verbatim uppslagstext. ISBN utelämnas (format-constraint på ISBN-10).
insert into historical_sources
  (title, title_en, author, written_year, language, reliability, work_type, collection, description, copyrighted_editions, peer_reviewed, source_key)
values
('Svenskt ortnamnslexikon', 'Dictionary of Swedish Place-Names', 'Mats Wahlberg (red.)', 2003, 'sv', 'tertiary', 'uppslagsverk',
 'Språk- och folkminnesinstitutet (SOFI), Uppsala; Elanders Gotab, Stockholm 2003 (ISBN 91-7229-020-X)',
 'Standarduppslagsverk för svenska ortnamns etymologi och äldsta belägg. Källkritiskt facit för namnled och tolkningar. UPPHOVSRÄTTSSKYDDAD (© 2003 SOFI) — endast FAKTA (etymologi, beläggår, tolkning) får återges med citat, aldrig verbatim uppslagstext.',
 '© 2003 Språk- och folkminnesinstitutet (SOFI). Skyddad — fakta fritt, uttryck ej utan licens.', false, 'sol-2003-wahlberg')
on conflict do nothing;
