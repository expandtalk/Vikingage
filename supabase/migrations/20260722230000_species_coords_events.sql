-- Koordinatsättning + Stora Karlsö-vargar + svartråtta + händelse-dimension (pest/klimat).
-- Applicerad via MCP execute_sql; fil = proveniens. Koordinater = Wikidata-lokalitet (CC0),
-- verifierade; Tanum UTELÄMNAD (norsk homonym 59.89,10.48), Ajvide saknas i Wikidata.
-- Källor: Girdland-Flink, Bergström et al. 2025 (PNAS, Stora Karlsö-vargar); Yu et al. 2022
-- (Nat Commun 13:2399, svartråtta); Rascovan et al. 2019 (Cell, neolitisk pest); Wagner 2014/
-- Feldman 2016 (justinianska); Spyrou 2019/Bos 2011 (digerdöden); Büntgen 2016 + Gräslund &
-- Price 2012 (536/fimbulvinter); kvartärgeologi (deglaciation, Storegga).

update public.species_introductions set lat=55.5414, lng=13.2703 where site_name='Bökeberg';
update public.species_introductions set lat=58.3167, lng=13.5500 where site_name='Hornborgasjön';
update public.species_introductions set lat=47.7454, lng=8.6936  where site_name='Kesslerloch';
update public.species_introductions set lat=39.7939, lng=9.0070  where site_name='Genoni';

insert into public.species_introductions (entity,category,proxy_type,site_name,region,landscape,lat,lng,date_text,date_from,date_to,uncertainty,confidence,source,note) values
('varg (mänsklig kontroll?)','djur','adna','Stora Förvar, Stora Karlsö (G.7)','Sverige','Gotland',57.2855,17.9724,'mellanneolitikum, 4804–4601 cal BP',-2860,-2640,'normal','trolig','Girdland-Flink, Bergström et al. 2025, PNAS','Varg-ancestry (ej hund). Ön saknar landdäggdjur → förd dit av människor (båt). Marin diet, liten storlek, låg heterozygositet → möjlig mänsklig kontroll.'),
('varg (mänsklig kontroll?)','djur','adna','Stora Förvar, Stora Karlsö (G.11)','Sverige','Gotland',57.2855,17.9724,'bronsålder, 3304–3094 cal BP',-1360,-1140,'normal','trolig','Girdland-Flink, Bergström et al. 2025, PNAS','Varghona; lägre heterozygositet än 72 forntida vargar; humerus-patologi; marin diet.'),
('svartråtta','djur','adna','Europa (romerskt handelsnät)','Europa',null,null,null,'romersk expansion → nedgång efter Roms fall → återkomst med medeltida handel',1,1400,'normal','belagd','Yu et al. 2022, Nat Commun 13:2399','Rattus rattus: flera introduktioner knutna till handeln. Pest-vektor; samma nät som katten.')
on conflict do nothing;

-- Händelser → befintliga historical_events (year_start/year_end/event_name/event_type/
-- significance_level/region_affected[]/sources[]). Ingen koordinatkolumn i den tabellen.
insert into public.historical_events (year_start,year_end,event_name,event_name_en,description,event_type,significance_level,region_affected,sources) values
(-2900,-2900,'Neolitisk pest (Gökhem)','Neolithic plague (Gökhem)','Bland äldsta Y. pestis-beläggen, i neolitisk kvinna i Frälsegården, Gökhem — samma plats som den omdaterade vikingatida hunden.','epidemic','very_high',array['Skandinavien','Västergötland'],array['Rascovan et al. 2019, Cell 176:295']),
(541,549,'Justinianska pesten','Plague of Justinian','Första pestpandemin (Y. pestis); sammanfaller med LALIA/536.','epidemic','very_high',array['Medelhavet','Europa'],array['Wagner et al. 2014','Feldman et al. 2016']),
(1347,1351,'Digerdöden','Black Death','Andra pestpandemin; Sverige 1350, ~1/3 av Europa dog.','epidemic','very_high',array['Europa','Sverige'],array['Spyrou et al. 2019','Bos et al. 2011']),
(536,660,'Fimbulvintern / 536 e.Kr. stoftslöja (LALIA)','Fimbulwinter / 536 CE dust veil (LALIA)','Vulkanisk stoftslöja → kraftig avkylning; missväxt/ödegårdar i Skandinavien; kopplas till Fimbulvinter-myten (tolkning).','climate','very_high',array['Norra halvklotet','Skandinavien'],array['Büntgen et al. 2016','Gräslund & Price 2012']),
(-9700,-9700,'Senaste istidens slut','End of the last Ice Age','Inlandsisen drar sig tillbaka; Skandinavien koloniseras.','climate','very_high',array['Skandinavien'],array['Kvartärgeologi']),
(-6200,-6200,'Storeggaskredet & tsunami','Storegga slide & tsunami','Undervattensskred utanför Norge → tsunami över Doggerland/mesolitiska kuster.','catastrophe','high',array['Nordatlanten','Doggerland'],array['Bondevik et al.'])
on conflict do nothing;

insert into public.ontology_entity_types (code,label_sv,label_en,physical_table,coord_kind,provenance_columns,status,description) values
('event','Händelse (klimat/epidemi)','Event (climate/epidemic)','historical_events','none','sources,significance_level','active','Pestutbrott, klimatchocker (fimbulvinter, istid), katastrofer.')
on conflict (code) do update set physical_table='historical_events', status='active', description=excluded.description;
