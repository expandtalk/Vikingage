-- Koordinatförfining efter källor från Daniel (2026-07-22). Applicerad via MCP execute_sql;
-- fil = proveniens.
--  * Ajvide (Eksta sn, Gotland, RAÄ 171): EXAKT ur grävrapport-källa 57°16'54"N 18°9'27"Ö
--    = 57.28167, 18.1575 (ersätter approx 57.30/18.15). Uppdaterar även gropkeramik-eventet.
--  * Norje Sunnansund (Ysane sn, Sölvesborg): sv.wikipedia kartposition 56°7'N 14°40'E
--    = 56.117, 14.667 (bågminut-precision, vid f.d. sjön Vesan N om Norje by). Ersätter
--    felaktig 56.06/14.55 som hamnade uppe i Ryssberget.
update public.species_introductions set lat=57.28167, lng=18.1575 where site_name ilike 'ajvide%';
update public.historical_events set lat=57.28167, lng=18.1575 where event_name ilike 'gropkeramisk%';
update public.historical_events set lat=56.117, lng=14.667 where event_name ilike 'fiskeekonomi%';
