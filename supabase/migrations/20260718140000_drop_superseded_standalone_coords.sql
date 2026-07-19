-- Städa additional_coordinates: ta bort standalone-poster (inscription_id null)
-- vars signum REDAN finns i runic_inscriptions — direkt ELLER via alternative_signum.
-- Bakgrund (2026-07-18): additional_coordinates innehåller gamla Nominatim-/manual-
-- geokoder från 2025 som är superseder av rundata-crosswalken. 1393 matchar huvud-
-- tabellen direkt, 546 via alternative_signum (t.ex. Bautil "B 1" -> U 337 i Orkesta,
-- "B 100" -> U 285 i Hammarby). De 546 slapp igenom kartans signum-dedup och ritades
-- som DUBBLETTER på fel plats (bl.a. Uppland-stenar utsatta i Småland, Gotland).
-- runic_inscriptions har redan rätt koordinat/socken för alla dessa (coord_source
-- 'rundata_evighetsrunor'), så raderna tillför inget och är delvis felaktiga.
--
-- Behåller de ~499 genuint saknade (inte i huvudtabellen alls) — de importeras
-- separat (DB-TODO item 5) och kan då verifieras mot Runor/SNRD.
--
-- DESTRUKTIVT men reversibelt: raderna kan återskapas ur rundata/Nominatim.
-- Kör i SQL-editorn, sedan: supabase migration repair --status applied 20260718140000

-- Verifiera FÖRST (kör separat, ska ge ~1939):
-- select count(*) from public.additional_coordinates ac
-- where ac.inscription_id is null and ac.signum is not null
--   and (exists (select 1 from public.runic_inscriptions m
--                where lower(regexp_replace(m.signum,'\s+',' ','g'))
--                    = lower(regexp_replace(ac.signum,'\s+',' ','g')))
--     or exists (select 1 from public.runic_inscriptions m
--                where ac.signum = any(m.alternative_signum)));

begin;

delete from public.additional_coordinates ac
where ac.inscription_id is null
  and ac.signum is not null
  and (
    exists (
      select 1 from public.runic_inscriptions m
      where lower(regexp_replace(m.signum,'\s+',' ','g'))
          = lower(regexp_replace(ac.signum,'\s+',' ','g'))
    )
    or exists (
      select 1 from public.runic_inscriptions m
      where ac.signum = any(m.alternative_signum)
    )
  );

commit;

-- Efterkontroll (kör separat): kvarvarande standalone ska vara ~499.
-- select count(*) from public.additional_coordinates
-- where inscription_id is null and signum is not null;
