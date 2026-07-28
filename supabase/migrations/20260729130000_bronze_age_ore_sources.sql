-- Bronsålderns europeiska kopparkällor → ore_sources. Källa: Nørgaard, Pernicka & Vandkilde 2021,
-- "Shifting networks and mixing metals", PLOS ONE 16(6):e0252376 (CC-BY). Norden bröt INGEN egen
-- koppar under bronsåldern — allt importerades, betalt med bärnsten (som nådde Mykene ~1600 f.Kr.).
-- Koordinater = region-centroider (gruvregioner), markeras som sådana. Great Orme finns redan.

insert into public.ore_sources (name, name_en, region, country, lat, lng, metals, ore_type, isotope_signature, period_from, period_to, period_text, evidence, source, note)
values
 ('Mitterberg', 'Mitterberg', 'Salzburg (Östalperna)', 'Österrike', 47.417, 13.083, ARRAY['copper']::text[], 'chalcopyrit',
  '{"note":"låg-orenad chalkopyrit-koppar, Ni≈As","Pb206_204":"~18.1–18.5"}'::jsonb, -1600, -1300, 'NBA IB–II (1600–1300 f.Kr.)',
  'Storskalig bronsålders-koppargruva; dominerande alpin källa för nordisk koppar 1600–1500 f.Kr.', 'Nørgaard et al. 2021 (PLOS ONE, CC-BY)', 'Östalpin koppar; skiljs från Slovakien via spårämnen (Ag/Sb).'),
 ('Inn Valley (Buchberg)', 'Inn Valley', 'Tyrolen (Östalperna)', 'Österrike', 47.30, 11.50, ARRAY['copper']::text[], 'fahlerz',
  '{"note":"låg-Ni fahlerz-koppar, Ösenhalsring-form"}'::jsonb, -2100, -1700, 'LN II (2100–1700 f.Kr.)',
  'Tidig östalpin fahlerz-koppar, bland de första till Norden via Únětice-navet.', 'Nørgaard et al. 2021 (PLOS ONE, CC-BY)', null),
 ('Slovakiska malmbergen (Špania Dolina/Hron)', 'Slovakian Ore Mountains', 'Hron-dalen', 'Slovakien', 48.80, 19.10, ARRAY['copper']::text[], 'fahlerz + chalcopyrit',
  '{"note":"fahlerz (hög orenhet) + senare låg-orenad chalkopyrit"}'::jsonb, -2100, -1300, 'LN II–NBA II',
  'Långvarig kopparleverantör; efter Únětice-kollapsen ~1600 f.Kr. fick Norden direktaccess via Karpaterbäckenet.', 'Nørgaard et al. 2021 (PLOS ONE, CC-BY)', null),
 ('Alto Adige/Trentino/Veneto (AATV)', 'AATV (Italian Alps)', 'Sydtyrolen/Trentino', 'Italien', 46.20, 11.20, ARRAY['copper']::text[], 'chalcopyrit',
  '{"note":"206Pb/204Pb < 18.25; 207Pb/204Pb > 15.63","dominant":"NBA II"}'::jsonb, -1500, -1300, 'NBA II (1500–1300 f.Kr.)',
  'Norditaliens alpina koppar dominerar (>60 %) från 1450 f.Kr. — transalpin bärnstenstrafik åt andra hållet.', 'Nørgaard et al. 2021 (PLOS ONE, CC-BY)', 'Sammanfaller med amber-för-metall via Alperna → Po → Adriatiska kusten.'),
 ('Majdanpek/Rudna Glava', 'Majdanpek/Rudna Glava', 'Östserbiens kopparbälte', 'Serbien', 44.42, 21.94, ARRAY['copper']::text[], 'arsenik-koppar',
  '{"note":"radiogent bly; SÖ-europeisk chalkolitisk koppar"}'::jsonb, -3800, -2300, 'Neolitikum/chalkolitikum',
  'Äldsta kopparen till Norden (trattbägar-flatyxor) kom via SÖ-Europa (Serbien/Bulgarien) genom Mondsee-Österrike.', 'Nørgaard et al. 2021 (PLOS ONE, CC-BY)', null),
 ('Ai Bunar (Stara Zagora)', 'Ai Bunar', 'Stara Zagora', 'Bulgarien', 42.43, 25.63, ARRAY['copper']::text[], 'arsenik-koppar',
  '{"note":"206Pb/204Pb ~18.56; chalkolitisk gruvdrift"}'::jsonb, -4500, -3500, 'Chalkolitikum',
  'Belagd chalkolitisk kopparbrytning; matchar de äldsta danska flatyxornas signatur.', 'Nørgaard et al. 2021 (PLOS ONE, CC-BY)', null),
 ('Alderley Edge', 'Alderley Edge', 'Cheshire', 'Storbritannien', 53.30, -2.22, ARRAY['copper']::text[], 'chalcopyrit',
  '{"note":"Ni-As-koppar; brittisk källa NBA IB"}'::jsonb, -1600, -1500, 'NBA IB',
  'Engelsk kopparkälla vid sidan av Great Orme; brittisk metall central i nordisk produktion.', 'Nørgaard et al. 2021 (PLOS ONE, CC-BY)', null)
on conflict do nothing;

-- Bärnstensvägen som distant-connection-tema (Mykene som resmål).
insert into public.historical_events (event_name, event_name_en, year_start, year_end, description, event_type, significance_level, region_affected, sources, location_status, location_note)
values ('Bärnstensvägen: nordisk bärnsten når Mykene', 'The Amber Road: Nordic amber reaches Mycenae', -1600, -1300,
  'Baltisk/jylländsk bärnsten ("Nordens guld") nådde de mykenska kungagravarna (Gravcirkel A) och Pylos ~1600–1500 f.Kr., i utbyte mot koppar. Bärnsten färdades via östliga (Karpaterna→Egeiska havet) och senare transalpina rutter. Konkret handelsväg bakom likheterna mellan nordisk bronsålderskonst och Egeiska världen.',
  'handel/kontakt', 'hög', ARRAY['Norden','Centraleuropa','Grekland']::text[],
  ARRAY['Nørgaard et al. 2021 (PLOS ONE, CC-BY)','Nationalmuseet Danmark']::text[],
  'belagd', 'Ursprung: Östersjön/Jylland (t.ex. Understed, 3,3 kg obearbetad bärnsten ~1400 f.Kr.). Resmål: Mykene, Pylos.')
on conflict do nothing;
