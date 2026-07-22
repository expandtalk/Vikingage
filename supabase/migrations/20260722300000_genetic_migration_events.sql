-- Djuptids-humangenetik/migrationshändelser → historical_events (event_type 'migration').
-- Applicerad via MCP execute_sql; fil = proveniens. Utvecklar focus=geneticEvents (var stub)
-- till en riktig djup tidslinje (~9500 f.Kr.→). Källor: Günther 2018 (PLoS Biol), Skoglund
-- 2012/2014 (Science), Coutinho 2020, Haak 2015 (Nature), Allentoft 2015/2024 (Nature).
insert into public.historical_events (year_start,year_end,event_name,event_name_en,description,event_type,significance_level,region_affected,sources,lat,lng) values
(-9500,-8000,'Jägar-samlare koloniserar Skandinavien','Hunter-gatherers colonise Scandinavia',
 'Mesolitiska jägar-samlare invandrar söderifrån + via nordöstlig rutt, möts och blandas (SHG). Genetiskt distinkta från senare bönder.',
 'migration','very_high',array['Skandinavien'],array['Günther et al. 2018, PLoS Biology','Skoglund et al. 2014, Science'],null,null),
(-4000,-3300,'Neolitiska bönder (anatolisk härkomst)','Neolithic farmers (Anatolian ancestry)',
 'Jordbruket når Skandinavien med anatolisk/egeisk härkomst (TRB); delvis utbyte, delvis blandning med jägar-samlarna.',
 'migration','very_high',array['Skandinavien'],array['Skoglund et al. 2012, Science','Skoglund et al. 2014, Science'],null,null),
(-3300,-2300,'Gropkeramisk kultur — jägarsamlare kvarlever','Pitted Ware Culture — foragers persist',
 'PWC (Gotland/Ajvide) lever kvar parallellt med bönderna — bland de sista med förjordbruks-genetik i Europa; även deras hundar behöll mesolitisk härkomst.',
 'migration','high',array['Gotland','Skandinavien'],array['Coutinho et al. 2020','Skoglund et al. 2014, Science'],57.30,18.15),
(-2800,-2300,'Stäpp-migration → stridsyxekultur (Yamnaya)','Steppe migration → Battle Axe (Yamnaya)',
 'Massiv Yamnaya-invandring → stridsyxe-/snörkeramikkultur, ~indoeuropeiskt språk; stäpp-härkomst i nästan alla nutida européer. Sammanfaller med pest-spridning.',
 'migration','very_high',array['Europa','Skandinavien'],array['Haak et al. 2015, Nature','Allentoft et al. 2015/2024, Nature'],null,null)
on conflict do nothing;
