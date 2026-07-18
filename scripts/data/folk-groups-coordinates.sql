-- #7 Folkgrupper på karta (2026-07-18)
-- 73 av 82 folkgrupper hade koordinater och ritades redan; dessa 9 saknade koordinat
-- och syntes därför inte på kartan. Approximativa hemvist-koordinater (folkgruppernas
-- kärnområde). Point-format = (lng, lat) — jfr Svear (17.6389, 59.3293).
-- Ren data-UPDATE, kör i SQL-editorn (ingen migration repair).

begin;

update public.folk_groups set coordinates = point(14.5, 49.8)  where name = 'Bojer';      -- Boii, Böhmen
update public.folk_groups set coordinates = point(-1.8, 54.0)  where name = 'Briganter';  -- Brigantes, norra England
update public.folk_groups set coordinates = point(24.9, 45.9)  where name = 'Daker';      -- Dacians, Dakien/Rumänien
update public.folk_groups set coordinates = point(11.5, 55.6)  where name = 'Daner';      -- Danes, Själland/Danmark
update public.folk_groups set coordinates = point(7.4, 46.8)   where name = 'Helveter';   -- Helvetii, Schweiz
update public.folk_groups set coordinates = point(18.5, 43.5)  where name = 'Illyrer';    -- Illyrians, västra Balkan
update public.folk_groups set coordinates = point(0.2, 49.2)   where name = 'Normander';  -- Normans, Normandie
update public.folk_groups set coordinates = point(25.5, 42.0)  where name = 'Thraker';    -- Thracians, Thrakien
update public.folk_groups set coordinates = point(14.8, 56.8)  where name = 'Virdar';     -- Värend, Kronoberg/Småland

commit;

-- Efterkontroll (ska ge 0): select count(*) from folk_groups where coordinates is null;
