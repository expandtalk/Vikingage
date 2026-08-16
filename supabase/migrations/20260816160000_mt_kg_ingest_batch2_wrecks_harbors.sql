-- TASK 4 BATCH 2: MT-artiklar om VRAK & HAMNAR → historical_sources (sökbar 'source'-typ), fakta-only.
-- UPPHOVSRÄTT: rights='copyrighted' (MT); description = ämne+kategori ur artikelindexet (inga påhittade
-- fynd); url=null (fabricera ej PDF-sökväg — INGEN GISSNING); collection=MT-nummer. title_en=sv-titel.
insert into public.historical_sources
  (title, title_en, author, written_year, language, work_type, collection, catalog_role, rights, reliability, description)
select v.title, v.title, v.author, v.yr, 'sv', 'article',
       'Marinarkeologisk tidskrift (Marinarkeologiska sällskapet) '||v.issue,
       'scholarship', 'copyrighted', 'secondary', v.descr
from (values
  -- VRAK & SKEPPSFYND
  ('Bossholmsvraket', 'Erik Enström', 1979, '1979:1',
   'Marinarkeologi. Bossholmsvraket. Kategori: vrak & skeppsfynd.'),
  ('Regalskeppet Kronan – förlisning, återfinnande och bärgning', 'Peter Norman', 1981, '1981:3',
   'Marinarkeologi. Regalskeppet Kronan (1676): förlisning, återfinnande och bärgning. Kategori: vrak & skeppsfynd, örlogsskepp.'),
  ('Koggen från Mollösund', 'Ole Lisberg-Jensen', 1983, '1983:2',
   'Marinarkeologi. Koggfynd vid Mollösund, Orust. Kategori: vrak & skeppsfynd, kogg.'),
  ('Tegelvraket – Skeppsteknisk analys', 'Seth Jansson', 1983, '1983:4',
   'Marinarkeologi. Tegellastat vrak — skeppsteknisk analys. Kategori: vrak & skeppsfynd, last.'),
  ('Vraket som Björn hittade', 'Niklas Eriksson', 2004, '2004:1',
   'Marinarkeologi. Vrakfynd. Kategori: vrak & skeppsfynd.'),
  ('Västeråsskeppet – framgrävt för andra gången', 'Niklas Eriksson', 2004, '2004:2',
   'Marinarkeologi. Västeråsskeppet. Kategori: vrak & skeppsfynd.'),
  ('Vraket vid Joskär – ett okänt 1600-talsfartyg i Finland', 'Fredrik Åberg', 2005, '2005:4',
   'Marinarkeologi. Okänt 1600-talsfartyg vid Joskär, Finland. Kategori: vrak & skeppsfynd.'),
  ('Ett nyupptäckt 1500-talsvrak i Göteborgs norra skärgård', 'Staffan von Arbin', 2006, '2006:2',
   'Marinarkeologi. 1500-talsvrak, Göteborgs norra skärgård. Kategori: vrak & skeppsfynd.'),
  ('Norrahamnsvraket – En holk från Hertsön?', 'Erik Karlsson', 2006, '2006:3',
   'Marinarkeologi. Norrahamnsvraket, möjlig holk. Kategori: vrak & skeppsfynd, holk.'),
  ('Jutholmsvraket – en marinarkeologisk klassiker återbesökt', 'Niklas Eriksson', 2010, '2010:2',
   'Marinarkeologi. Jutholmsvraket återbesökt. Kategori: vrak & skeppsfynd.'),
  ('Lejonvraket – Ett första fältarbete', 'Niklas Eriksson', 2010, '2010:4',
   'Marinarkeologi. Lejonvraket, första fältarbete. Kategori: vrak & skeppsfynd, örlogsskepp.'),
  ('Dygden – ett av Chapmans linjeskepp', 'Patrik Höglund', 2011, '2011:3',
   'Marinarkeologi. Linjeskeppet Dygden (Chapman). Kategori: vrak & skeppsfynd, örlogsskepp.'),
  ('Svärdet – marin slagfältsarkeologi', 'Niklas Eriksson; Johan Rönnby', 2012, '2012:1',
   'Marinarkeologi. Regalskeppet Svärdet (1676) — marin slagfältsarkeologi. Kategori: vrak & skeppsfynd, örlogsskepp, slagfält.'),
  ('Mars – En historisk bakgrund och några resultat från 2011 års undersökningar', 'Patrik Höglund', 2012, '2012:2',
   'Marinarkeologi. Skeppet Mars/Makalös (1564): historisk bakgrund + resultat. Kategori: vrak & skeppsfynd, örlogsskepp.'),
  ('Skeppet Mars, 1564: Nya undersökningar av ett sjunket slagfält', 'Johan Rönnby', 2013, '2013:3',
   'Marinarkeologi. Skeppet Mars (1564) — sjunket slagfält. Kategori: vrak & skeppsfynd, örlogsskepp, slagfält.'),
  ('Resande man – en historisk bakgrund', 'Patrik Höglund', 2012, '2012:3',
   'Marinarkeologi. Skeppet Resande man (förlist 1660): historisk bakgrund. Kategori: vrak & skeppsfynd.'),
  ('Resande mannen – ett vrak med potential', 'Niklas Eriksson', 2013, '2013:4',
   'Marinarkeologi. Resande man — vrakets potential. Kategori: vrak & skeppsfynd.'),
  ('Gribshunden (1495) – Vraket efter ett senmedeltida kravellskepp', 'Niklas Eriksson', 2016, '2016:1',
   'Marinarkeologi. Gribshunden (1495) — senmedeltida kravellskepp. Kategori: vrak & skeppsfynd, kravell.'),
  ('Flera spektakulära fynd vid utgrävning av Gribshunden', 'Johan Rönnby', 2019, '2019:3',
   'Marinarkeologi. Gribshunden (1495) — utgrävningsfynd. Kategori: vrak & skeppsfynd, kravell.'),
  ('Riksäpplet – regalskeppet mitt i Stockholms skärgård', 'Niklas Eriksson', 2019, '2019:1',
   'Marinarkeologi. Regalskeppet Riksäpplet. Kategori: vrak & skeppsfynd, örlogsskepp.'),
  -- HAMNAR
  ('Gäddtarmen, en gammal naturhamn vid Hangö i Finland', 'Peter Norman', 1979, '1979:2',
   'Marinarkeologi. Naturhamnen Gäddtarmen vid Hangö. Kategori: hamnar, naturhamn.'),
  ('Krigarnas hamn – om ett nyligen undersökt bryggfundament nedanför Birkas garnison', 'Jens Lindström', 2003, '2003:1',
   'Marinarkeologi. Bryggfundament nedanför Birkas garnison. Kategori: hamnar, Birka.'),
  ('En vikingatida hamn vid Husabyåns mynning?', 'Lotta Hjärthner', 2003, '2003:1',
   'Marinarkeologi. Möjlig vikingatida hamn vid Husabyåns mynning. Kategori: hamnar.'),
  ('Var är hamnen – om vikingatida hamnarna på Adelsö i Mälaren', 'Christin Heamägi', 2006, '2006:2',
   'Marinarkeologi. Vikingatida hamnar på Adelsö, Mälaren. Kategori: hamnar, Adelsö.'),
  ('Stora Ängsviken – en del i ett hamninventeringsprojekt', 'Jim Hansson; Jens Lindström', 2008, '2008:3',
   'Marinarkeologi. Stora Ängsviken — hamninventering. Kategori: hamnar.'),
  ('Maritima Birka: Nya undersökningar av vikingastadens hamnområden', 'Jim Hansson; Jens Lindström; Andreas Olsson; Johan Rönnby', 2010, '2010:4',
   'Marinarkeologi. Birkas hamnområden — nya undersökningar. Kategori: hamnar, Birka.'),
  ('Några anteckningar om Fröjels försvunna hamn', 'Oscar Törnqvist', 2011, '2011:3',
   'Marinarkeologi. Fröjels försvunna hamn, Gotland. Kategori: hamnar.')
) as v(title, author, yr, issue, descr)
where not exists (
  select 1 from public.historical_sources hs
  where hs.title = v.title and hs.author = v.author and hs.written_year = v.yr);

select public.rebuild_search_document('source');
