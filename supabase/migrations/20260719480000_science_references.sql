-- 20260719480000_science_references.sql
-- Syfte: Stärka vetenskapligheten genom att registrera tre akademiska verk i
-- historical_sources och koppla citerbara, ATTRIBUERADE rön till relevanta
-- poster i folk_groups och historical_periods.
--
-- UPPHOVSRÄTT: Ingen prosa har kopierats från källorna. Endast fakta/rön
-- (ej upphovsrättsskyddade) återges med egna ord och attribuering
-- (författare, år, sida/avsnitt). Omdiskuterade påståenden markeras.
--
-- Migrationen är idempotent: INSERT sker via NOT EXISTS och textutökningar
-- sker endast om attribueringstoken saknas (NOT LIKE-vakter).

-- =====================================================================
-- 1. KÄLLOR (historical_sources)
-- =====================================================================

-- A) McColl, Kroonen, Willerslev m.fl. 2024 (bioRxiv-preprint)
INSERT INTO historical_sources
  (title, title_en, author, written_year, covers_period_start, covers_period_end,
   reliability, language, work_type, collection, description)
SELECT
  'Steppe Ancestry in western Eurasia and the spread of the Germanic Languages',
  'Steppe Ancestry in western Eurasia and the spread of the Germanic Languages',
  'Hugh McColl, Guus Kroonen, Eske Willerslev m.fl.',
  2024, -3000, 1100,
  'secondary', 'Engelska', 'studie',
  'bioRxiv preprint (doi:10.1101/2024.03.13.584607)',
  $desc$Tvärvetenskaplig arkeogenetisk studie (bioRxiv-preprint, ej peer-granskad i denna version) som kombinerar populationsgenomik, arkeologi, lingvistik och historiska källor för att modellera de germanska språkens ursprung och spridning. Bygger på 710 nysekvenserade fornDNA-genom från västra Eurasien, analyserade tillsammans med 3 940 tidigare publicerade genom. Behandlar stäpprelaterad ancestry, bronsålderns befolkningsrörelser i Skandinavien samt järnålderns och folkvandringstidens migrationer bakom bildandet av nord-, väst- och östgermansktalande populationer.$desc$
WHERE NOT EXISTS (
  SELECT 1 FROM historical_sources
  WHERE title = 'Steppe Ancestry in western Eurasia and the spread of the Germanic Languages'
);

-- B) Kaliff & Oestigaard 2025 (monografi)
INSERT INTO historical_sources
  (title, title_en, author, written_year, covers_period_start, covers_period_end,
   reliability, language, work_type, collection, description)
SELECT
  'Early Indo-European Silk Roads: Ecologies of Cattle, Waterways and Winter Migrations',
  'Early Indo-European Silk Roads: Ecologies of Cattle, Waterways and Winter Migrations',
  'Anders Kaliff & Terje Oestigaard',
  2025, -3500, 1100,
  'secondary', 'Engelska', 'studie',
  'Occasional Papers in Archaeology 90, Uppsala universitet',
  $desc$Arkeologisk monografi (Occasional Papers in Archaeology 90, Uppsala universitet) som föreslår en ekologisk modell för tidiga indoeuropeiska migrationer. Utgår från boskapsskötselns villkor och argumenterar för att Eurasiens nord-sydligt flytande floder och långa, hårda vintrar var avgörande: sommartid utgjorde de breda floderna barriärer, men när de frös blev de vinterleder som möjliggjorde snabba öst-västliga förflyttningar av stora hjordar. Syntetiserar fornDNA, arkeologi och historiska handelsvägar (med Sidenvägen som tolkningsram).$desc$
WHERE NOT EXISTS (
  SELECT 1 FROM historical_sources
  WHERE title = 'Early Indo-European Silk Roads: Ecologies of Cattle, Waterways and Winter Migrations'
);

-- C) Kaliff & Oestigaard 2024 (bokkapitel)
INSERT INTO historical_sources
  (title, title_en, author, written_year, covers_period_start, covers_period_end,
   reliability, language, work_type, collection, description)
SELECT
  'Fighting the winter: Indo-European rituals and cosmogony in cold climates',
  'Fighting the winter: Indo-European rituals and cosmogony in cold climates',
  'Anders Kaliff & Terje Oestigaard',
  2024, -1700, 1900,
  'secondary', 'Engelska', 'studie',
  'Kap. 9 i Larsson, Olander & Jørgensen (red.), Indo-European Interfaces, Stockholm University Press',
  $desc$Bokkapitel i den vetenskapliga antologin Indo-European Interfaces (Stockholm University Press). Analyserar hur den skandinaviska vinterns extrema säsongsekologi strukturerade indoeuropeisk rituell tradition och kosmogoni. Behandlar jordbrukskosmologi, vattnets roll i föreställningar om snösmältning samt skeid-traditionen (hästkamp) från bronsåldern till sent 1800-tal, med arkeologiskt och etnografiskt material.$desc$
WHERE NOT EXISTS (
  SELECT 1 FROM historical_sources
  WHERE title = 'Fighting the winter: Indo-European rituals and cosmogony in cold climates'
);

-- =====================================================================
-- 2. RÖN KOPPLADE TILL historical_periods
-- =====================================================================

-- Vikingatid: nordlig återmigration formar de nordgermanska danerna (omdiskuterat)
UPDATE historical_periods
SET genetic_characteristics = coalesce(genetic_characteristics,'') ||
  $t$

Forngenomisk analys knyter vikingatidens nordgermansktalande befolkning i Danmark och södra Sverige till en tidigare okänd nordlig återmigration in i södra Skandinavien under folkvandringstiden (ca 1575-1200 BP), som delvis ersatte äldre invånare och motsvarar de historiskt belagda danerna. Ursprunget till och karaktären hos dessa förvikingatida förändringar är dock omdiskuterade (McColl et al. 2024, bioRxiv, sammanfattning).$t$
WHERE name = 'Vikingatid'
  AND coalesce(genetic_characteristics,'') NOT LIKE '%McColl et al. 2024%';

-- Förvikingatid: västgermanska utvandringar från blandad sydskandinavisk population
UPDATE historical_periods
SET genetic_characteristics = coalesce(genetic_characteristics,'') ||
  $t$

Enligt fornDNA-modellering utgick de västgermanska folkvandringarna (anglosaxare till Britannien, langobarder söderut) under folkvandringstiden från en strukturerad, blandad sydskandinavisk population; parallellt skedde en nordlig migration tillbaka in i södra Skandinavien som bidrog till den förvikingatida befolkningens sammansättning (McColl et al. 2024, bioRxiv, sammanfattning).$t$
WHERE name = 'Förvikingatid'
  AND coalesce(genetic_characteristics,'') NOT LIKE '%McColl et al. 2024%';

-- =====================================================================
-- 3. RÖN KOPPLADE TILL folk_groups
-- =====================================================================

-- Daner
UPDATE folk_groups
SET historical_significance = coalesce(historical_significance,'') ||
  $t$

FornDNA kopplar danernas bildande till en nordlig återmigration in i södra Skandinavien under folkvandringstiden, vilken delvis ersatte tidigare invånare och formade den nordgermansktalande vikingatida befolkningen. Det förvikingatida ursprunget är omdiskuterat (McColl et al. 2024, bioRxiv, sammanfattning).$t$
WHERE name = 'Daner'
  AND coalesce(historical_significance,'') NOT LIKE '%McColl et al. 2024%';

-- Götar (Goths)
UPDATE folk_groups
SET historical_significance = coalesce(historical_significance,'') ||
  $t$

FornDNA visar att Wielbark-populationen i Polen huvudsakligen bar östskandinavisk ancestry, vilket stöder ett skandinaviskt (svenskt) ursprung för de östgermanska grupperna. De senare kulturella arvtagarna öst- och västgoterna var däremot övervägande av sydeuropeisk härkomst, vilket antyder att gotisk kultur i hög grad övertogs snarare än fördes med migranter. Det förvandringstida ursprunget är omdiskuterat (McColl et al. 2024, bioRxiv, sammanfattning).$t$
WHERE name = 'Götar'
  AND coalesce(historical_significance,'') NOT LIKE '%McColl et al. 2024%';

-- Tidiga gotiska stammar
UPDATE folk_groups
SET historical_significance = coalesce(historical_significance,'') ||
  $t$

FornDNA anger att Wielbark-populationen i Polen huvudsakligen bar östskandinavisk ancestry, vilket stöder ett skandinaviskt ursprung för de östgermanska (gotiska) grupperna (McColl et al. 2024, bioRxiv, sammanfattning).$t$
WHERE name = 'Tidiga gotiska stammar'
  AND coalesce(historical_significance,'') NOT LIKE '%McColl et al. 2024%';

-- Sydskandinaviska migranter (västgermansk expansion)
UPDATE folk_groups
SET historical_significance = coalesce(historical_significance,'') ||
  $t$

FornDNA knyter de västgermanska anglosaxiska migrationerna till Britannien och langobardernas rörelse söderut under folkvandringstiden (ca 1575-1200 BP) till en strukturerad, blandad sydskandinavisk population (McColl et al. 2024, bioRxiv, sammanfattning).$t$
WHERE name = 'Sydskandinaviska migranter'
  AND coalesce(historical_significance,'') NOT LIKE '%McColl et al. 2024%';

-- Langobarderna
UPDATE folk_groups
SET historical_significance = coalesce(historical_significance,'') ||
  $t$

Enligt fornDNA härrör langobardernas migration till södra Europa under folkvandringstiden från en blandad sydskandinavisk population av germansktalande (McColl et al. 2024, bioRxiv, sammanfattning).$t$
WHERE name = 'Langobarderna'
  AND coalesce(historical_significance,'') NOT LIKE '%McColl et al. 2024%';

-- Protogermanska stammar
UPDATE folk_groups
SET historical_significance = coalesce(historical_significance,'') ||
  $t$

Proto-germanska utvecklades ur paleo-/förgermanska via en uppsättning definierande ljudskiften omkring mitten av det 3:e årtusendet BP; talgemenskapen placeras i södra Skandinavien och norra Tyskland under förromersk järnålder, varefter kontinuumet delades i öst-, nord- och västgermanska (nord och väst utgör sannolikt en gemensam undergren) (McColl et al. 2024, bioRxiv, inledning).$t$
WHERE name = 'Protogermanska stammar'
  AND coalesce(historical_significance,'') NOT LIKE '%McColl et al. 2024%';

-- Paleogermanska stammar
UPDATE folk_groups
SET historical_significance = coalesce(historical_significance,'') ||
  $t$

Ett tidigare okänt östskandinaviskt genetiskt kluster framträder först ca 800 år efter snörkeramikkulturens ankomst (den första stäpprelaterade populationen i Nordeuropa), vilket talar för en sen snarare än mellanneolitisk ankomst av den germanska språkgruppen till Skandinavien. Klustrets icke-lokala jägar-samlar-ancestry pekar på en tvärbaltisk sjövägsentré snarare än en sydskandinavisk landväg (McColl et al. 2024, bioRxiv, sammanfattning).$t$
WHERE name = 'Paleogermanska stammar'
  AND coalesce(historical_significance,'') NOT LIKE '%McColl et al. 2024%';

-- Förhistoriska indoeuropeer (Kaliff & Oestigaard 2025 - ekologisk modell + stäpp)
UPDATE folk_groups
SET historical_significance = coalesce(historical_significance,'') ||
  $t$

Kaliff & Oestigaard föreslår en ekologisk modell där tidig indoeuropeisk spridning drevs av storskalig boskapsskötsel: Eurasiens nord-sydliga floder var barriärer sommartid men blev vinterleder när de frös, vilket möjliggjorde snabba öst-västliga migrationer av stora hjordar. Snörkeramikkulturens västliga expansion från ca 2950 f.Kr. förde stäpprelaterad ancestry och den manliga Y-haplogruppen R1a in i Nordeuropa, medan R1b förknippas med en tidigare, sydligare stäppvåg (Kaliff & Oestigaard 2025, s. 25, 104-105).$t$
WHERE name = 'Förhistoriska indoeuropeer'
  AND coalesce(historical_significance,'') NOT LIKE '%Kaliff & Oestigaard 2025%';

-- Nordiska bronsåldersstammar (Kaliff & Oestigaard 2025 - stäppancestry/avskogning)
UPDATE folk_groups
SET historical_significance = coalesce(historical_significance,'') ||
  $t$

Snörkeramikkulturens västliga expansion (från ca 2950 f.Kr.) förde in den stäpprelaterade Y-haplogruppen R1a-Z283 till Mellaneuropa och R1a-Z284 till Skandinavien; den yamnaya-relaterade pastorala ekonomin bidrog till omfattande avskogning och öppna betesmarker, t.ex. på Jylland (Kaliff & Oestigaard 2025, s. 25).$t$
WHERE name = 'Nordiska bronsåldersstammar'
  AND coalesce(historical_significance,'') NOT LIKE '%Kaliff & Oestigaard 2025%';

-- Nordiska bronsåldersstammar (Kaliff & Oestigaard 2024 - vinterekologi/kosmogoni)
UPDATE folk_groups
SET historical_significance = coalesce(historical_significance,'') ||
  $t$

Den skandinaviska vinterekologin strukturerade från bronsåldern en indoeuropeisk jordbrukskosmologi och rituell tradition. Hit hör skeid-traditionen med hästkamp, en av de mest långlivade rituella traditionerna, med sista utlöpare på sent 1800-tals landsbygd i Norge och Sverige (Kaliff & Oestigaard 2024, s. 165-167).$t$
WHERE name = 'Nordiska bronsåldersstammar'
  AND coalesce(historical_significance,'') NOT LIKE '%Kaliff & Oestigaard 2024%';
