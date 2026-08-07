-- Torshälla kyrka hade redan generella "Valvmålningar (tillskrivna Albertus Pictor)" i church_artworks.
-- Berikar med det SPECIFIKA verifierade motivet: Albertus Pictors "Simson bänder isär lejonets käftar"
-- (Travé I, valvet, västra valvkappan). Verifierat via Christer Malmbergs Albertus Pictor-motivkatalog
-- (Torshälla listas under just detta motiv). SAKUPPGIFT med källhänvisning — ingen verbatim katalogtext
-- (upphovsrätt © Christer Malmberg). Applicerad i prod via MCP; denna fil = repo-spegling. 2026-08-07.
insert into public.church_artworks (church_id, artist_id, artwork_type, title, motif, dating_text, location_in_church, source, source_url, notes)
select '6893537b-50a7-4e0d-b739-b291df3c82fe', '673ec546-adc2-418b-af69-e8e664cb1940',
  'kalkmålning', 'Simson bänder isär lejonets käftar',
  'Simson bänder isär lejonets käftar (Dom 14:5–6)',
  '1400-talets senare hälft (Albertus Pictors verkstad)',
  'Travé I, valvet, västra valvkappan',
  'Albertus Pictor motivkatalog (Christer Malmberg)',
  'https://christermalmberg.se/pictor/motiv/motivkatalog_motivtyp.php',
  'Typologisk förebild för Kristi nedstigande i dödsriket (Biblia pauperum BP 28/.h.). Sakuppgift ur källan — ingen verbatim katalogtext.'
where not exists (
  select 1 from public.church_artworks
  where church_id='6893537b-50a7-4e0d-b739-b291df3c82fe' and title='Simson bänder isär lejonets käftar');
