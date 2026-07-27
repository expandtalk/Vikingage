-- Sölve Göranssons vårdböte-undersökning (Öland + Kalmarsund). Han märkte ut vårdkasplatser där
-- termen "vårdböte" är belagd: ~23 längs Ölands ÖSTKUST, 13 på västra Öland, 8 längs Kalmarsunds-
-- kusten, + 1 på södra Kalmar (Stensö udde). Ingen längst i söder. Vi har hans ANTAL/zoner men inte de
-- enskilda koordinaterna → 45 punkter kan ej plottas utan hans karta. Lagrar totalerna som källbelagd
-- sammanfattning + Stensö udde (enda namngivna, approximativ koord). Inga påhittade enskilda lägen.
begin;

-- Stensö udde (S om Kalmar) — approximativ (Stensö-halvön; exakt uddspets ej publikt verifierad).
insert into public.beacon_sites (name, landscape, municipality, parish, lat, lng, source_uri)
select 'Vårdböte, Stensö udde (S om Kalmar, approx.)', 'Småland', 'Kalmar', 'Kalmar', 56.6280, 16.3350,
  'Sölve Göransson, vårdböte-undersökning (Öland/Kalmarsund)'
where not exists (select 1 from public.beacon_sites b where b.name like 'Vårdböte, Stensö udde%');

-- Göranssons totaler som sammanfattning på böte-elementet (dokumenterad omfattning, ej enskilda belägg).
update public.ortnamn_element_config
  set note = note || ' Sölve Göranssons undersökning: vårdböte belagt vid ~23 vårdkasplatser längs Ölands östkust, 13 på västra Öland och 8 längs Kalmarsundskusten, samt 1 på södra Kalmar (Stensö udde); inga längst i söder. Enskilda koordinater kräver Göranssons karta (ej ingestad) — endast Stensö udde + 3 K-samsök-belagda (Källa/Egby/Gräsgård) är hittills punktsatta.'
  where element_key = 'böte';

commit;
