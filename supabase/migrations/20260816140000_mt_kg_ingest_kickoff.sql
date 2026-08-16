-- TASK 4 KICKOFF: MT-artiklar sökbara i kunskapsgrafen. Den sökbara källtypen ('source' i
-- search_document) = historical_sources (catalog_role='scholarship'). Bibliografiska `sources`-
-- tabellen (bytea, /researchers) är EJ sök-indexerad → MT-artiklar hör hemma i historical_sources.
-- UPPHOVSRÄTT: rights='copyrighted' (MT skyddat); description = ENDAST FAKTA (ingen verbatim
-- artikeltext); url = länk (rehosta ej). Etablerar mönstret för resten av MT-ingesten.

-- 1) MT 1992:2 "En strukturell översyn av itinerariet" → historical_sources (sökbar källa).
insert into public.historical_sources
  (title, title_en, author, written_year, language, work_type, collection, catalog_role, rights, reliability, url, description)
select
  'En strukturell översyn av itinerariet',
  'A structural review of the itinerary',
  'Christer Westerdahl', 1992, 'sv', 'article',
  'Marinarkeologisk tidskrift (Marinarkeologiska sällskapet) 1992:2', 'scholarship', 'copyrighted', 'secondary',
  'https://marinarkeologi.nu/MT/1992/mt_1992_2__558.pdf',
  'Marinarkeologi. Källkritisk revision av det danska itinerariet i Kung Valdemars jordebok (utg. Liber Census Daniae, P.F. Suhm 1792; itinerariet nedtecknat ca 1300, knutet till Johannes Jutae). Westerdahl tar tillbaka tesen om fasta lotsstationer och förordar att marinarkeologin utgår från det maritima kulturlandskapets faktiska rester (hamnar, vrak, sjömärken, ballastplatser). Kategori: farleder/itinerarium, maritimt kulturlandskap. FAKTA fria; uttryck upphovsrättsskyddat (MT) — länk, ej rehostad.'
where not exists (
  select 1 from public.historical_sources
  where title = 'En strukturell översyn av itinerariet' and author = 'Christer Westerdahl');

-- 2) Indexera SÄKERT (typ/id-scopad rebuild river bara den raden, ej signalbärande typer):
--    a) den nya MT-artikeln (entity_type 'source'), b) Christer Westerdahl (entity_type 'scholar').
select public.rebuild_search_document(
  'source',
  (select id from public.historical_sources
   where title = 'En strukturell översyn av itinerariet' and author = 'Christer Westerdahl'));

select public.rebuild_search_document('scholar', 'f74fb8c3-36fb-4375-b72a-76726195a4a9'::uuid);
