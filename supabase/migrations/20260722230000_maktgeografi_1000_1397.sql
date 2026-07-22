-- Maktgeografi 1000–1397: maktcentrats vandring + fiskala vändpunkter fram till Kalmarunionen.
-- Kuraterad (nyckelsäten + styrande ätter + fiskala hållpunkter), EJ varje regent (de bor i
-- historical_kings/chronicle-vyn). Holdings via name-join mot befintliga kungar/ätter — matchar
-- ingen rad → ingen holding (säkert). Idempotent på estate-namn. Danska tråden inkluderad.
DELETE FROM public.estates WHERE name IN
  ('Gamla Uppsala','Lödöse','Stockholm','Näs (Visingsö)','Kalmar (slott)','Jelling (DK)','Trelleborg (DK)');

INSERT INTO public.estates (name, estate_type, lat, lng, first_attested, description, source, confidence) VALUES
  ('Gamla Uppsala', 'uppsala_öd', 59.8977, 17.6336, 500, 'Gammalt kult- och kungasäte (Uppsala öd); Svearnas centrum före Sigtuna/Östra Aros.', 'Adam av Bremen; arkeologi', 'certain'),
  ('Lödöse', 'handelsplats', 58.0328, 12.1503, 1100, 'Västkustens handels- och myntort; Karl Sverkersson lät prägla brakteater här ~1160.', 'myntfynd', 'probable'),
  ('Stockholm', 'kungsgård', 59.3251, 18.0711, 1252, 'Grundat ~1250 av Birger Jarl vid Söderström; blir rikets maktcentrum. Kontrollerade sjövägen in i Mälaren.', 'Erikskrönikan; brev', 'certain'),
  ('Näs (Visingsö)', 'borg', 57.9767, 14.3339, 1150, 'Bjälboättens kungaborg på Visingsö i Vättern; Magnus Ladulås dog här 1290.', 'arkeologi', 'probable'),
  ('Kalmar (slott)', 'mötesplats', 56.6614, 16.3628, 1200, 'Gränsstad mot Danmark; central mötesplats — Kalmarunionen beseglas här 1397.', 'unionsbrevet 1397', 'certain'),
  ('Jelling (DK)', 'kungsgård', 55.7563, 9.4192, 950, 'Danmark: Jelling-dynastins säte (Gorm den gamle, Harald Blåtand); Jellingstenarna.', 'Jellingstenarna; Adam av Bremen', 'certain'),
  ('Trelleborg (DK)', 'borg', 55.3928, 11.2660, 980, 'Danmark: en av Harald Blåtands ringborgar (~980) av Trelleborgstyp — militär-fiskal maktdemonstration (våldskapital). Unescos världsarv 2023.', 'dendrokronologi', 'certain');

-- Innehav (dynasti-nivå) via subquery på ätt-namn.
INSERT INTO public.estate_holdings (estate_id, holder_kind, dynasty_id, holder_name, role, period_start, period_end, fiscal_system, confidence, source, note)
SELECT e.id, 'dynasty', (SELECT id FROM public.royal_dynasties WHERE name = d.dname LIMIT 1), d.dname, d.role, d.ps, d.pe, d.fisc, 'probable', d.src, d.note
FROM public.estates e
JOIN (VALUES
  ('Gamla Uppsala','Stenkilska ätten','kontroll',1060,1130,'ledung','Adam av Bremen','Övergångstid; kungamakt förankrad i det gamla Uppsala öd.'),
  ('Näs (Visingsö)','Bjälboätten','kontroll',1250,1364,'land_skatt','Erikskrönikan','Folkungaätten; rikets styrande ätt, maktcentrum flyttar mot Stockholm/Mälaren.'),
  ('Jelling (DK)','Jelling-dynastin','kontroll',930,1042,'ledung','Jellingstenarna','Första historiskt belagda danska kungaätten; sjömakt.')
) AS d(ename,dname,role,ps,pe,fisc,src,note) ON TRUE
JOIN public.estates e2 ON e2.name=d.ename AND e2.id=e.id;

-- Innehav (individ-nivå) via name-join mot historical_kings.
INSERT INTO public.estate_holdings (estate_id, holder_kind, king_id, holder_name, role, period_start, period_end, fiscal_system, confidence, source, note)
SELECT e.id, 'king', k.id, k.name, r.role, r.ps, r.pe, r.fisc, 'probable', 'runstenar; myntfynd; krönikor', r.note
FROM public.estates e
JOIN (VALUES
  ('Gamla Uppsala','Ulf Fase','kontroll',1220,1247,'mynt','Ende jarl med egna mynt ("ULF DUX") — jarlens fiskala självständighet.'),
  ('Lödöse','Karl Sverkersson','kontroll',1160,1167,'mynt','Präglade brakteater i Lödöse.'),
  ('Sigtuna','Knut Eriksson','kontroll',1172,1196,'mynt','Återupptog myntningen efter den myntlösa perioden ~1030–1140.'),
  ('Stockholm','Birger Jarl','grundare',1248,1266,'land_skatt','Grundade Stockholm; siste riksjarl, de facto härskare (Bjälboätten).'),
  ('Stockholm','Magnus Ladulås','kontroll',1275,1290,'land_skatt','Alsnö stadga ~1280 — frälse/skattefrihet mot rusttjänst; steg mot landbaserad fiskal makt.'),
  ('Kalmar (slott)','Bo Jonsson Grip','kontroll',1371,1386,'land_skatt','Rikets störste godsinnehavare (drots); testamentet 1384. Kontrollerade bl.a. Kalmar.'),
  ('Kalmar (slott)','Erik av Pommern','kontroll',1396,1439,'land_skatt','Kalmarunionen 1397 — personalunion Danmark/Norge/Sverige.'),
  ('Jelling (DK)','Harald Blåtand','kontroll',958,986,'ledung','Sjökung; enade Danmark+Norge, kristnade danerna (Jellingstenen). Byggde ringborgarna.'),
  ('Trelleborg (DK)','Harald Blåtand','kontroll',980,986,'ledung','Ringborgarna ~980 — flott-/ledungsbaserad maktdemonstration.'),
  ('Jelling (DK)','Sven Tveskägg','kontroll',985,1014,'mynt','Förste danske kung att sätta sitt namn på mynt.')
) AS r(ename,kname,role,ps,pe,fisc,note) ON TRUE
JOIN public.historical_kings k ON k.name = r.kname
JOIN public.estates e2 ON e2.name=r.ename AND e2.id=e.id;
