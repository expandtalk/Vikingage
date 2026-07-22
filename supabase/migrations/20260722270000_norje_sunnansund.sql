-- Norje Sunnansund: fisk-dominerad mesolitisk ekonomi + världens äldsta fermenterings-
-- belägg → tidig bofasthet. Applicerad via MCP execute_sql; fil = proveniens.
-- Källa: Boethius, A. 2018, "Fishing for ways to thrive", Studies in Osteology 4 (avhandling,
-- Lunds universitet); Boethius & Ahlström 2018. Fisk ~50% av proteinet (Norje Sunnansund),
-- ~60% på Gotland; fiske stationärt → delayed-return-ekonomi, territorier, ökat våld.
insert into public.historical_events (year_start,year_end,event_name,event_name_en,description,description_en,event_type,significance_level,region_affected,sources) values
(-7250,-6650,'Fiskeekonomi & tidig bofasthet (Norje Sunnansund)','Fish economy & early sedentism (Norje Sunnansund)',
 'Mesolitisk sydskandinavisk kost var oväntat fisk-dominerad: Norje Sunnansund (Blekinge) ~50 % av proteinet från fisk, Gotland ~60 %. Världens äldsta kända fermenteringsbelägg (fermenterad fisk i grop). Fiske är stationärt → tidig bofasthet, territorier och ökade våldsspår. Reviderar bilden av mesolitikum som enbart mobila storviltjägare.',
 'Mesolithic southern Scandinavian diet was unexpectedly fish-dominated (~50% at Norje Sunnansund, ~60% on Gotland). Earliest known fermentation evidence. Fishing is stationary → early sedentism, territories and violence.',
 'settlement','high',array['Blekinge','Gotland','Sydskandinavien'],array['Boethius 2018, Studies in Osteology 4 (avhandling, Lund)','Boethius & Ahlström 2018'])
on conflict do nothing;
