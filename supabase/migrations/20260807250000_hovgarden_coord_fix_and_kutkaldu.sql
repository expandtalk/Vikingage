-- (1) Hovgården-kungsgården (estate) låg på 17.481 — ~3 km väster om verkligt läge. U 11
--     Hovgårdsstenen är verifierad (Wikipedia) till 59.3601/17.534 och står VID Hovgården →
--     ankra estaten dit. U 11:s egen koordinat var redan rätt (rörs ej).
-- (2) Kutkäldu (Kuttu), Tingstäde sn, N Gotland — helig källa med källrå-tradition. Fanns EJ i DB.
--     Läggs i cult_sites (folktro/kult; christian_sites vägrade — period-constraint tillåter bara
--     kristna perioder). Fakta ur guteinfo/Enderborg + Wikipedia; SÄGEN märkt; koordinat APPROX
--     (sockennivå) — exakt läge ej verifierat mot Fornsök. Applicerad via MCP; fil = spegling. 2026-08-07.
update public.estates
set lat = 59.3601, lng = 17.534,
    geom = ST_SetSRID(ST_MakePoint(17.534, 59.3601), 4326),
    source = coalesce(source,'') || ' | koord ankrad till Hovgårdsstenen U 11 (verifierat Wikipedia 2026-08-07); tidigare 17.481 låg ~3 km fel'
where name ilike 'Hovgården%';

insert into public.cult_sites (id, name, lat, lng, type, deity, established_period, region, evidence, sources, description)
select 'kutkaldu-tingstade', 'Kutkäldu (Kuttu), Tingstäde', 57.735, 18.611,
  'helig källa / källrå', 'källrå (kvinnligt väsen)', 'odaterad (folktradition)', 'Gotland',
  ARRAY['folktradition','informationsskylt'],
  ARRAY['guteinfo.com (Bernt Enderborg)','sv.wikipedia.org/wiki/Kutkäldu','informationsskylt vid källan'],
  'Källa i skogen i Tingstäde socken, norra Gotland; sköts av Tingstäde hembygdsförening (Årets källa 2001). Det äldre namnet '
  'Kuttu återges enligt lokal tradition (informationsskylt; guteinfo/Bernt Enderborg) som ett gotländskt ord för "det hemliga '
  'stället på kvinnor" — knutet till kvinnans sköte och livets ursprung. SÄGEN: förr troddes ett källrå (kvinnligt väsen) råda '
  'över källan. KÄLLKRITIK: folketymologi/folktro, ej språkhistoriskt belagd. KOORDINAT APPROXIMATIV (sockennivå, Tingstäde) — '
  'exakt källläge (skogen nära Polhemsgården) EJ verifierat mot Fornsök.'
where not exists (select 1 from public.cult_sites where id='kutkaldu-tingstade' or name ilike 'Kutkäldu%');
