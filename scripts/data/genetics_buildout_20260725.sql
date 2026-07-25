-- Genetik-utbyggnad 2026-07-25 — ENBART publicerade fynd, källa på varje rad.
-- Källor: Rodríguez-Varela et al. 2023, Cell ("The genetic history of Scandinavia
-- from the Roman Iron Age to the present"); Malmström et al. 2020, Am. J. Phys.
-- Anthropol. (gropkeramisk vs stridsyxekultur, Ajvide/Atlas-projektet).
-- Idempotent (NOT EXISTS-guards). Inga påhittade siffror; ancestry beskrivs
-- kvalitativt så som källorna anger. Inga koordinater där källan saknar punkt.
BEGIN;

-- === 1. Tre genetiskt distinkta stenålderskulturer (folk_groups, djuptidslager) ===
INSERT INTO folk_groups (name, name_en, main_category, sub_category, active_period_start, active_period_end, description, description_en, historical_significance, language_subfamily, dna_profile, coordinates)
SELECT 'Trattbägarkultur', 'Funnel Beaker Culture (TRB)', 'other', 'Neolitiska jordbrukare', -4000, -2800,
 'Skandinaviens första bondekultur (odling och tamboskap), känd för megalitgravar. Bar huvudsakligen anatolisk/kontinentaleuropeisk bondehärkomst och skiljer sig genetiskt från jägarstenålderns tidigare jägar-samlare.',
 'The first farming culture in Scandinavia (cultivation and livestock), known for megalithic tombs. Carried predominantly Anatolian/Continental European farmer ancestry, genetically distinct from earlier hunter-gatherers.',
 'Anatolisk bondehärkomst (Malmström et al. 2020, Am. J. Phys. Anthropol.).', 'Neolitiska', '{}'::jsonb, POINT(13.5, 58.2)
WHERE NOT EXISTS (SELECT 1 FROM folk_groups WHERE name='Trattbägarkultur');

INSERT INTO folk_groups (name, name_en, main_category, sub_category, active_period_start, active_period_end, description, description_en, historical_significance, language_subfamily, dna_profile, coordinates)
SELECT 'Gropkeramisk kultur', 'Pitted Ware Culture (PWC)', 'other', 'Neolitiska jägare-fiskare', -3500, -2300,
 'Kust- och ökultur (Gotland, Öland, Åland) som livnärde sig på säljakt och fiske. Genetiskt lik jägarstenålderns skandinaviska jägar-samlare. Tog upp stridsyxekulturens gravskick och yxor UTAN genetisk inblandning — kulturell kontakt via handel/utbyte, inte migration.',
 'Coastal and island culture (Gotland, Öland, Åland) subsisting on seal hunting and fishing. Genetically similar to earlier Scandinavian hunter-gatherers. Adopted Battle Axe culture burial customs and axes WITHOUT genetic admixture — cultural contact via trade/exchange, not migration.',
 'Ingen genetisk koppling till stridsyxekulturen trots kulturella influenser; 25 analyserade individer (Malmström et al. 2020, Am. J. Phys. Anthropol.).', 'Neolitiska', '{}'::jsonb, POINT(18.2, 57.29)
WHERE NOT EXISTS (SELECT 1 FROM folk_groups WHERE name='Gropkeramisk kultur');

INSERT INTO folk_groups (name, name_en, main_category, sub_category, active_period_start, active_period_end, description, description_en, historical_significance, language_subfamily, dna_profile, coordinates)
SELECT 'Stridsyxekultur', 'Battle Axe / Corded Ware Culture', 'other', 'Neolitiska herdar', -2800, -2300,
 'Blandad herde- och bondekultur (snörkeramik) uppkallad efter sina karakteristiska yxor. Bar en ny genetisk komponent med koppling till östliga steppherdar — en grupp som inte finns hos trattbägar- eller gropkeramisk kultur.',
 'Mixed pastoralist and farming culture (Corded Ware) named for its characteristic axes. Carried a new genetic component linked to eastern steppe herders — a group absent from Funnel Beaker and Pitted Ware peoples.',
 'Ny invandrad steppherde-komponent, tidigare frånvarande i området (Malmström et al. 2020, Am. J. Phys. Anthropol.).', 'Neolitiska', '{}'::jsonb, POINT(14.5, 58.4)
WHERE NOT EXISTS (SELECT 1 FROM folk_groups WHERE name='Stridsyxekultur');

-- === 2. Genflöde/migration som händelser (historical_events, eventlinjen) ===
-- Neolitiska (Malmström et al. 2020). Diffusa processer -> inga koordinater.
INSERT INTO historical_events (event_name, event_name_en, year_start, year_end, event_type, significance_level, description, description_en, region_affected, sources)
SELECT 'Anatolisk bondehärkomst når Skandinavien', 'Anatolian farmer ancestry reaches Scandinavia', -4000, -2800, 'migration', 'high',
 'Neolitiseringen: jordbrukare med anatolisk/kontinentaleuropeisk härkomst etableras (trattbägarkultur), genetiskt skilda från de tidigare jägar-samlarna.',
 'The Neolithic transition: farmers of Anatolian/Continental European ancestry establish themselves (Funnel Beaker culture), genetically distinct from earlier hunter-gatherers.',
 ARRAY['Sydskandinavien','Skåne','Västergötland'], ARRAY['Malmström et al. 2020, Am. J. Phys. Anthropol.']
WHERE NOT EXISTS (SELECT 1 FROM historical_events WHERE event_name='Anatolisk bondehärkomst når Skandinavien');

INSERT INTO historical_events (event_name, event_name_en, year_start, year_end, event_type, significance_level, description, description_en, region_affected, sources)
SELECT 'Steppherde-härkomst når Skandinavien', 'Steppe herder ancestry reaches Scandinavia', -2800, -2300, 'migration', 'high',
 'En ny genetisk komponent med koppling till östliga steppherdar anländer med stridsyxe-/snörkeramisk kultur — frånvarande hos trattbägar- och gropkeramisk kultur.',
 'A new genetic component linked to eastern steppe herders arrives with the Battle Axe/Corded Ware culture — absent among Funnel Beaker and Pitted Ware peoples.',
 ARRAY['Sydskandinavien','Mellansverige'], ARRAY['Malmström et al. 2020, Am. J. Phys. Anthropol.']
WHERE NOT EXISTS (SELECT 1 FROM historical_events WHERE event_name='Steppherde-härkomst når Skandinavien');

-- Vikingatida genflöde (Rodríguez-Varela et al. 2023). Diffusa -> inga koordinater.
INSERT INTO historical_events (event_name, event_name_en, year_start, year_end, event_type, significance_level, description, description_en, region_affected, sources)
SELECT 'Vikingatida genflöde från Brittiska öarna', 'Viking-age gene flow from the British-Irish Isles', 750, 1050, 'migration', 'very_high',
 'British-Irish härkomst blir utbredd över hela Skandinavien under vikingatiden. Genflödet toppar under perioden.',
 'British-Irish ancestry becomes widespread across Scandinavia during the Viking Age. Gene flow peaks in this period.',
 ARRAY['Skandinavien'], ARRAY['Rodríguez-Varela et al. 2023, Cell']
WHERE NOT EXISTS (SELECT 1 FROM historical_events WHERE event_name='Vikingatida genflöde från Brittiska öarna');

INSERT INTO historical_events (event_name, event_name_en, year_start, year_end, event_type, significance_level, description, description_en, region_affected, sources)
SELECT 'Vikingatida öst-baltiskt genflöde', 'Viking-age eastern-Baltic gene flow', 750, 1050, 'migration', 'very_high',
 'Öst-baltisk härkomst når Skandinavien men — till skillnad från den utbredda British-Irish-härkomsten — främst Gotland och centrala Sverige.',
 'Eastern-Baltic ancestry reaches Scandinavia but — unlike the widespread British-Irish ancestry — mainly Gotland and central Sweden.',
 ARRAY['Gotland','Mellansverige'], ARRAY['Rodríguez-Varela et al. 2023, Cell']
WHERE NOT EXISTS (SELECT 1 FROM historical_events WHERE event_name='Vikingatida öst-baltiskt genflöde');

INSERT INTO historical_events (event_name, event_name_en, year_start, year_end, event_type, significance_level, description, description_en, region_affected, sources)
SELECT 'Vikingatida genflöde från södra Europa', 'Viking-age gene flow from southern Europe', 750, 1050, 'migration', 'high',
 'Studien spårar även genflöde från södra Europa till Skandinavien under vikingatiden.',
 'The study also traces gene flow from southern Europe into Scandinavia during the Viking Age.',
 ARRAY['Skandinavien'], ARRAY['Rodríguez-Varela et al. 2023, Cell']
WHERE NOT EXISTS (SELECT 1 FROM historical_events WHERE event_name='Vikingatida genflöde från södra Europa');

INSERT INTO historical_events (event_name, event_name_en, year_start, year_end, event_type, significance_level, description, description_en, region_affected, sources)
SELECT 'Nordlig uralisk härkomst i Skandinavien', 'Northern Uralic ancestry in Scandinavia', 900, 1100, 'migration', 'high',
 'En jämförelsevis sen uralisk härkomstkomponent definierar mycket av norra Skandinaviens genpool; belagd senast under senvikingatid, förknippad med den nord-sydliga genetiska gradienten.',
 'A comparatively recent Uralic ancestry component defines much of the northern Scandinavian gene pool; attested by the late Viking period at the latest, associated with the north-south genetic gradient.',
 ARRAY['Norra Skandinavien','Norra Sverige','Norra Norge'], ARRAY['Rodríguez-Varela et al. 2023, Cell']
WHERE NOT EXISTS (SELECT 1 FROM historical_events WHERE event_name='Nordlig uralisk härkomst i Skandinavien');

COMMIT;
