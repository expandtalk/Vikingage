-- Österleden + Kung Valdemars segelled som routes, och Åland in i kunskapsbilden.
-- Underlag: Ålands kulturhistoriska museum (museum.ax, järnålder–vikingatid),
-- Källström via K-blogg 2016-04-20 (Hitisfragmentet), Kung Valdemars jordebok
-- ("Det danska itinerariet", ca 1300). Koordinater är FÖRENKLADE stödpunkter
-- för kartvisning, inte exakt farledsrekonstruktion.
-- Idempotent (where not exists).

begin;

-- ---------- 1. Österleden (vikingatidens sjöväg österut) ----------
insert into public.river_systems (name, name_en, description, period, significance, type, importance, color, total_length_km)
select 'Österleden', 'The Eastern Route (Austrvegr)',
  'Vikingatidens stora sjöväg österut: Birka → Ålands hav → Åland → Skärgårdshavet (Hitis/Kyrksundet) → Finska viken → Nevan → Ladoga (Staraja Ladoga/Aldeigjuborg) — porten mot Rus, Volga och Bysans. Åland var ledens nav: rikt på vikingatida gravfält och fynd (men utan runstenar), med handelskontakter åt både väst och öst — lertass-riten återfinns i Volga-området. Belagd indirekt genom fynden längs leden och de skriftliga Rus-källorna (Annales Bertiniani 839, Nestorskrönikan).',
  'Vikingatid (800–1050)',
  'Huvudled för handel och färder österut; knyter Mälardalen till Ladoga och Rus',
  'sjöled', 'primary', '#b45309', 900
where not exists (select 1 from public.river_systems where name = 'Österleden');

insert into public.river_coordinates (river_system_id, sequence_order, latitude, longitude, name, name_en, description, is_trading_post)
select rs.id, v.ord, v.lat, v.lng, v.namn, v.namn_en, v.beskr, v.trading
from public.river_systems rs,
(values
  (1, 59.336, 17.542, 'Birka', 'Birka', 'Utgångspunkt: Mälardalens stora handelsstad.', true),
  (2, 59.85, 19.07, 'Arholma/Ålands hav', 'Arholma/Åland Sea', 'Överfarten från Roslagskusten.', false),
  (3, 60.28, 19.95, 'Åland (Saltvik/Kvarnbo)', 'Åland (Saltvik/Kvarnbo)', 'Ledens nav: rika gravfält, Bartsgårda-gårdarna, handel åt båda håll — men inga runstenar.', true),
  (4, 59.90, 22.43, 'Hitis/Kyrksundet', 'Hitis/Kyrksundet', 'Vikingatida handelsplats i Skärgårdshavet; nära fyndplatsen för Finlands första runstensfragment (FI NOR1998;14).', true),
  (5, 59.95, 26.00, 'Finska viken', 'Gulf of Finland', 'Öppet vatten österut.', false),
  (6, 59.95, 30.30, 'Nevans mynning', 'Neva mouth', 'Uppfarten mot Ladoga.', false),
  (7, 59.997, 32.297, 'Staraja Ladoga (Aldeigjuborg)', 'Staraya Ladoga', 'Porten till Rus — vidare mot Novgorod, Volga och Bysans.', true)
) as v(ord, lat, lng, namn, namn_en, beskr, trading)
where rs.name = 'Österleden'
  and not exists (select 1 from public.river_coordinates rc where rc.river_system_id = rs.id);

-- ---------- 2. Kung Valdemars segelled (medeltida itinerariet) ----------
insert into public.river_systems (name, name_en, description, period, significance, type, importance, color, total_length_km)
select 'Kung Valdemars segelled', 'King Valdemar''s sailing route',
  'Den medeltida farled som beskrivs i "Det danska itinerariet" i Kung Valdemars jordebok (ca 1300): från Utlängan i Blekinge längs svenska kusten, över Ålands hav till Åland (Lemböte) och genom Skärgårdshavet (Kökar, Jungfrusund vid Hitis) till Reval (Tallinn). Itinerariet räknar upp hamnarna namn för namn — Nordens äldsta bevarade seglingsbeskrivning, och i praktiken Österledens medeltida efterföljare.',
  'Medeltid (ca 1300)',
  'Nordens äldsta seglingsbeskrivning; visar att Åland/Skärgårdshavet förblev huvudstråket österut',
  'sjöled', 'primary', '#7c3aed', 1100
where not exists (select 1 from public.river_systems where name = 'Kung Valdemars segelled');

insert into public.river_coordinates (river_system_id, sequence_order, latitude, longitude, name, name_en, description, is_trading_post)
select rs.id, v.ord, v.lat, v.lng, v.namn, v.namn_en, v.beskr, v.trading
from public.river_systems rs,
(values
  (1, 55.95, 15.78, 'Utlängan (Blekinge)', 'Utlängan', 'Itinerariets startpunkt.', false),
  (2, 56.66, 16.36, 'Kalmarsund', 'Kalmar Strait', 'Längs smålandskusten, i lä av Öland.', true),
  (3, 58.74, 17.87, 'Landsort', 'Landsort', 'Sörmlandskustens angöring.', false),
  (4, 59.85, 19.07, 'Arholma', 'Arholma', 'Roslagens sista hamn före överfarten.', false),
  (5, 60.05, 19.93, 'Lemböte (Åland)', 'Lemböte (Åland)', 'Ålandshamnen med medeltida sjöfararkapell.', true),
  (6, 59.92, 20.91, 'Kökar', 'Kökar', 'Skärgårdshavets södra stråk.', false),
  (7, 59.90, 22.40, 'Jungfrusund (Hitis)', 'Jungfrusund (Hitis)', 'Samma sund som vikingatidens Kyrksundet-handelsplats.', true),
  (8, 59.82, 22.97, 'Hangö', 'Hanko', 'Finska vikens tröskel.', false),
  (9, 59.44, 24.75, 'Reval (Tallinn)', 'Reval (Tallinn)', 'Slutpunkt i Estland.', true)
) as v(ord, lat, lng, namn, namn_en, beskr, trading)
where rs.name = 'Kung Valdemars segelled'
  and not exists (select 1 from public.river_coordinates rc where rc.river_system_id = rs.id);

-- ---------- 3. Källan: Kung Valdemars jordebok ----------
insert into public.historical_sources
  (title, title_en, author, written_year, covers_period_start, covers_period_end, reliability, language, work_type, bias_types, description)
select 'Kung Valdemars jordebok (Det danska itinerariet)', 'King Valdemar''s Census Book (the Danish itinerary)',
  'Danska kungliga kansliet', 1300, 1250, 1350,
  'primary'::source_reliability, 'Latin/forndanska', 'itinerarium', array['none']::bias_type[],
  'Jordebok över den danska kronans egendomar, med det berömda "danska itinerariet": en hamn-för-hamn-beskrivning av segelleden Utlängan (Blekinge) → svenska kusten → Åland (Lemböte) → Skärgårdshavet (Kökar, Jungfrusund) → Reval. Nordens äldsta bevarade seglingsbeskrivning och nyckelkälla för Östersjöns medeltida farleder — i praktiken en dokumentation av Österledens fortsatta bruk.'
where not exists (select 1 from public.historical_sources where title like 'Kung Valdemars jordebok%');

-- tema-koppling: Resa & färd
insert into public.relationship (subject_id, predicate, object_id, source_ref, confidence)
select s.id, 'has_theme', t.id, 'kurerad (Österled-bygget 2026-07-19)', 'certain'
from public.historical_sources s, public.themes t
where s.title like 'Kung Valdemars jordebok%' and t.slug = 'voyage'
on conflict (subject_id, predicate, object_id) do nothing;

commit;
