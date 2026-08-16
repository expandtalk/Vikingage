-- TASK 4 BATCH 1: fler MT-artiklar → historical_sources (sökbar 'source'-typ), fakta-only.
-- Urval = det maritima kulturlandskapet / hamnarkeologi / maritima ortnamn / itinerarium-Valdemarsled /
-- båtdrag — de artiklar som kopplar till vårt farleds-, Kalmarsund- och ortnamnsarbete.
-- UPPHOVSRÄTT: rights='copyrighted' (MT); description = ENDAST ämne+kategori ur artikelindexet (inga
-- påhittade fynd). URL: bara 1992:2 har verifierad PDF-länk (redan ingestad); övriga → collection=nummer,
-- url=null (fabricera ALDRIG PDF-sökväg — INGEN GISSNING). Peer_review-status okänd → null.
-- title_en = svenska titeln (dessa artiklar har ingen engelsk version → fabricera ej en engelsk titel).
insert into public.historical_sources
  (title, title_en, author, written_year, language, work_type, collection, catalog_role, rights, reliability, description)
select v.title, v.title, v.author, v.yr, 'sv', 'article',
       'Marinarkeologisk tidskrift (Marinarkeologiska sällskapet) '||v.issue,
       'scholarship', 'copyrighted', 'secondary', v.descr
from (values
  ('Ballastplatser', 'Christer Westerdahl', 1979, '1979:1',
   'Marinarkeologi. Ballast som fyndkategori och spårbar lämning i det maritima kulturlandskapet. Kategori: ballastplatser & sjömärken.'),
  ('Hamnarkeologi: Marknadshamn, gårdshamn, fiskehamn eller övernattningshamn?', 'Carl Olof Cederlund', 1979, '1979:2',
   'Marinarkeologi. Om vikingatida och medeltida hamnplatsers funktion och typologi. Kategori: hamnar & ledungshamnar.'),
  ('Namn som visar på hamn-, lastage- och ankarplatser', 'Christer Westerdahl', 1979, '1979:2',
   'Marinarkeologi/onomastik. Maritima ortnamn som spår efter hamn-, lastage- och ankarplatser. Kategori: hamnar, maritima ortnamn.'),
  ('Hamnarkeologi: Ledungshamnar?', 'Christer Westerdahl', 1979, '1979:3',
   'Marinarkeologi. Ledungens hamnorganisation i det maritima kulturlandskapet. Kategori: hamnar & ledungshamnar, farleder.'),
  ('Hamnarkeologi: Valdemarsleden och itinerariet', 'Christer Westerdahl', 1979, '1979:3',
   'Marinarkeologi. Kung Valdemars segelled och det danska itinerariet. Kategori: farleder/itinerarium. Se även den strukturella revisionen 1992:2.'),
  ('Ortnamn i skärgården I – Namntyper för allmän orientering/navigering och med anknytning till näringar', 'Christer Westerdahl', 1982, '1982:1',
   'Marinarkeologi/onomastik. Skärgårdens namntyper för orientering, navigering och näringar. Kategori: maritima ortnamn.'),
  ('Ortnamn i skärgården II – Segelledens namntyper', 'Christer Westerdahl', 1982, '1982:1',
   'Marinarkeologi/onomastik. Segelledens namntyper. Kategori: maritima ortnamn, farleder.'),
  ('Maritima kulturcentra i östra Sverige – En preliminär katalog med kartor', 'Christer Westerdahl', 1982, '1982:4',
   'Marinarkeologi. Katalog över maritima kulturcentra längs östra Sveriges kust. Kategori: maritimt kulturlandskap.'),
  ('Vender, kurer och ester – några idéer om maritima ortnamn', 'Christer Westerdahl', 1986, '1986:3',
   'Marinarkeologi/onomastik. Maritima ortnamn med östersjöfinsk/baltisk/slavisk anknytning. Kategori: maritima ortnamn, språkkontakt.'),
  ('Det maritima kulturlandskapet – grundbegrepp', 'Christer Westerdahl', 1996, '1996:2',
   'Marinarkeologi. Grundbegreppen i det maritima kulturlandskapet (Westerdahls centrala teoribygge). Kategori: maritimt kulturlandskap, metod.'),
  ('Det maritima kulturlandskapet – att beskriva och analysera', 'Christer Westerdahl', 1996, '1996:2',
   'Marinarkeologi. Metod för att beskriva och analysera det maritima kulturlandskapet. Kategori: maritimt kulturlandskap, metod.'),
  ('Kung Valdemars segelled – ett stycke äventyrshistoria', 'Gabriele Prenzlau-Enander', 1996, '1996:2',
   'Marinarkeologi. Kung Valdemars segelled. Kategori: farleder/itinerarium.'),
  ('Forskningen om Kung Valdemars segelled', 'Gerhard Flink', 1996, '1996:2',
   'Marinarkeologi. Forskningsläget kring Kung Valdemars segelled. Kategori: farleder/itinerarium.'),
  ('Med båt över land', 'Christer Westerdahl', 2003, '2003:3',
   'Marinarkeologi. Båtdrag/ed — att föra båt över land mellan vatten. Kategori: farleder, båtdrag/portage. Jfr Kalmarsund-dragen.')
) as v(title, author, yr, issue, descr)
where not exists (
  select 1 from public.historical_sources hs
  where hs.title = v.title and hs.author = v.author and hs.written_year = v.yr);

-- Indexera 'source'-typen (typ-scopad DELETE+reinsert; rör EJ signalbärande typer → ingen signal-wipe).
select public.rebuild_search_document('source');
