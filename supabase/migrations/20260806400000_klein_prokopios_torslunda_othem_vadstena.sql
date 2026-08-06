-- Klein 1931-batch: Prokopios (källa), Torslunda-stansarna + Othem-spänne (museum_objects),
-- samt namn-berikning av Vadstenabrakteaten (Ög 178). Fakta fria; Kleins text paraphraserad;
-- bilder pending CC0/CC. Koordinater utelämnas där de inte är verifierade (ingen gissning).
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.

-- 5. Prokopios från Caesarea — grekisk primärkälla för 500-talets Norden (Thule/13 stammar).
INSERT INTO public.historical_sources (title, title_en, author, written_year, covers_period_start, covers_period_end,
  reliability, language, kind, rights, work_type, description)
SELECT
  'Om goterkriget (Bellum Gothicum)', 'The Gothic War (De Bello Gothico)', 'Prokopios från Caesarea',
  553, 535, 554, 'primary', 'grekiska', 'publication', 'public_domain', 'historieverk',
  'Grekisk historiker (ca 500–565), sekreterare åt fältherren Belisarios. Under goterkrigen i Italien vid mitten av 500-talet inhämtade han uppgifter om Norden och beskrev Thule (Thoulē) som en väldig ö, bebodd av tretton talrika stammar som var och en styrdes av sin egen kung. En av de tidigaste skriftliga primärkällorna som berör Skandinavien.'
WHERE NOT EXISTS (SELECT 1 FROM public.historical_sources s WHERE s.author = 'Prokopios från Caesarea');

-- 7b. Torslunda-stansarna (Björnhovda, Torslunda sn, Öland) — bronsmatriser för hjälmpressbleck, SHM.
INSERT INTO public.museum_objects (name, title, description, category, material, period, find_landscape, find_socken, find_place, source, attribution)
SELECT 'Torslunda-stansarna (Björnhovda)', 'Torslunda-stansarna',
  'Fyra bronsmatriser (patriser/stansar) för att prägla tunna hjälmbleck, funna vid Björnhovda i Torslunda socken på Öland. Motiven — bl.a. en krigare mellan två björnar/odjur, en man med hornhjälm och en galtprydd hjälmbärare — återkommer på vendeltidens pressbleck och knyts till samma hjälte- och sagovärld som den fornengelska Beowulfdikten. Förvaras i Statens historiska museum.',
  'stans/matris', 'brons', 'vendeltid', 'Öland', 'Torslunda', 'Björnhovda',
  'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; exakt koord pending (Fornsök); bild pending CC0/CC'
WHERE NOT EXISTS (SELECT 1 FROM public.museum_objects m WHERE m.name = 'Torslunda-stansarna (Björnhovda)');

-- 8. Spänne från Othem, Gotland (vendelstil), SHM.
INSERT INTO public.museum_objects (name, title, description, category, material, period, find_landscape, find_socken, source, attribution)
SELECT 'Spänne från Othem (vendelstil)', 'Spänne från Othem',
  'Praktspänne i vendelstil funnet i Othem socken på Gotland. Förvaras i Statens historiska museum.',
  'spänne', 'brons', 'vendeltid', 'Gotland', 'Othem',
  'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; fyndplats socken-nivå; koord/bild pending CC0/CC'
WHERE NOT EXISTS (SELECT 1 FROM public.museum_objects m WHERE m.name = 'Spänne från Othem (vendelstil)');

-- 1. Vadstenabrakteaten (Ög 178): namn saknades → sätt för sökbarhet + kort faktarad i translation_sv.
UPDATE public.runic_inscriptions
SET name = 'Vadstenabrakteaten',
    translation_sv = COALESCE(NULLIF(translation_sv,''),
      'C-brakteat i guld (500-tal), funnen 1774 i Vadstenatrakten. Bär hela den äldre runraden (futhark) föregången av ordet tuwatuwa. Stulen från SHM 1938 och försvunnen; en stampidentisk dublett (Mariedammbrakteaten) är bevarad.')
WHERE signum = 'Ög 178' AND (name IS NULL OR name = '');
