-- Royal Chronicles — steg c–f: region-städning, dynastier, 11 rättelser, dedup
-- (2026-07-18). Kör EFTER migration 20260718200000, FÖRE 02-import.sql.
-- Granska innan körning. Ren data-SQL (ingen migration repair behövs).
-- Bakgrund: scripts/data/royal-chronicles/SCHEMA-MAPPING.md + README.md.

begin;

-- =====================================================================
-- (c) REGION-STÄDNING — kanonisera till engelska enkel-token.
-- Unionsmonarker (Norge/Danmark/Sverige, Sverige/Danmark/Norge) LÄMNAS —
-- ingen enskild region är korrekt för dem.
-- =====================================================================
update public.historical_kings set region='Denmark'
  where region in ('Danmark','Danmark/Jylland','Danmark/Öresund','Danmark/Östersjön');
update public.historical_kings set region='Norway'
  where region in ('Norge','Norge/Nordsjön','Norge/Northumbria');

-- =====================================================================
-- (f-1) DYNASTIER: döp om till korrekta vetenskapliga namn.
-- =====================================================================
update public.royal_dynasties set name='Stenkilska ätten'  where name='Stenkilsätten';
update public.royal_dynasties set name='Erikska ätten', name_en='Erik Dynasty'      where name='Eriksätten';
update public.royal_dynasties set name='Sverkerska ätten', name_en='Sverker Dynasty' where name='Sverkerätren';  -- rättelse #9 (stavfel)

-- (f-2) DYNASTIER: skapa saknade (idempotent).
insert into public.royal_dynasties (name, name_en, region, description)
select v.name, v.name_en, v.region, v.description
from (values
  ('Vasaätten','Vasa Dynasty','Sweden','Svensk kungaätt från 1523 (Gustav Vasa).'),
  ('Munsöätten','Munsö Dynasty','Sweden','Erik Segersälls ätt. Leden FÖRE Erik Segersäll är genealogisk rekonstruktion ur 1200-talskällor (osäker).'),
  ('Estridska ätten','Estrid Dynasty','Denmark','Dansk kungaätt från Sven Estridsen (1047).'),
  ('Ladejarlarna','Lade Jarls','Norway','Norska jarlar, de facto-härskare ca 900–1030.'),
  ('Uí Ímair','Uí Ímair (Ivar Dynasty)','Västerleden','Skandinavisk dynasti i Dublin/York, ca 850–1095.'),
  ('Crovan-dynastin','Crovan Dynasty','Västerleden','Kungar av Man och Öarna, ca 1079–1265.'),
  ('Olof-dynastin','Olof Dynasty (Hedeby)','Denmark','Svensk dynasti i Hedeby, ca 900–936 (Vedelspang-stenarna).'),
  ('Polotsk-linjen','Polotsk Line','Kievrus','Äldsta sekundära Rurikid-linjen (Rogvolod/Rognéd).'),
  ('Wessex-dynastin','Wessex Dynasty','England','Anglosaxisk kungaätt, enade England.'),
  ('Godwin-ätten','Godwin Dynasty','England','Harold Godwinsons ätt.'),
  ('Oxenstierna','Oxenstierna','Sweden','Svensk frälseätt; riksföreståndare 1400-talet.'),
  ('Tott','Tott','Sweden','Svensk/dansk frälseätt (Axelssönerna).'),
  ('Sjöbladsätten','Sjöblad Dynasty','Sweden','Sten Sture den äldres agnatiska ätt.'),
  ('Natt och Dag','Natt och Dag','Sweden','Svensk frälseätt (belagd fr. 1280-talet); Svante/Sten Sture d.y.'),
  ('Trolle','Trolle','Sweden','Svensk frälseätt.'),
  ('Gyllenstierna','Gyllenstierna','Sweden','Svensk frälseätt; Kristina Nilsdotter.'),
  ('Oldenburg','Oldenburg','Denmark','Dansk-norsk kungahus (Kristian I framåt).'),
  ('Ätten Grip','Grip','Sweden','Bo Jonsson Grips ätt (drots 1300-talet).')
) as v(name, name_en, region, description)
where not exists (select 1 from public.royal_dynasties d where d.name = v.name);

-- =====================================================================
-- (d) 11 RÄTTELSER (bekräftade IDs).
-- =====================================================================
-- #1 Gustav Vasa: Bjälboätten -> Vasaätten
update public.historical_kings set dynasty_id=(select id from public.royal_dynasties where name='Vasaätten' limit 1)
  where id='279b632e-6b31-407b-9e6e-3b1d286f61ba';
-- #2 Magnus Eriksson: Eriksätten/Erikska -> Bjälboätten
update public.historical_kings set dynasty_id=(select id from public.royal_dynasties where name='Bjälboätten' limit 1)
  where id='87abac81-000c-4d8b-b858-c07f3ef31f9a';
-- #3 Sigrid Storråda + Astrid Olofsdotter: ta bort anakronistisk Bjälbo-ätt; Astrid datering
update public.historical_kings set dynasty_id=null
  where id in ('9f9714e2-0c18-47aa-a564-0d4026d40c5a','39e97c03-af7f-4ca3-b822-09301e9b4634');
update public.historical_kings set reign_start=1015, reign_end=1035
  where id='39e97c03-af7f-4ca3-b822-09301e9b4634';  -- Astrid (gift m. Olav den helige d.1030)
-- #4 Ragnhild Eriksdotter: felaktig relation
update public.historical_kings
  set description='Dotter till Erik Blodyx och Gunnhild kongemor. (Harald Gråfälls mor var Gunnhild kongemor — inte Ragnhild.)'
  where id='a82d1c66-7d42-479e-a59b-e8c63816aa4a';
-- #5 Beatrix av Wittelsbach: kopplad till FEL Erik Magnusson
update public.historical_kings
  set description='Gift med Erik (XII) Magnusson (d. 1359), son till Magnus Eriksson. (Ej hertig Erik Magnusson d. 1318 — han var gift med Ingeborg Håkansdotter.) Dotter till Ludwig av Bayern.',
      reign_start=1356, reign_end=1359
  where id='6bab89ec-e33f-4f8e-b7aa-8ee62be18feb';
-- #6 Toke/Björn/Sibir-klustret: flagga spekulativ rekonstruktion (behåll runstensbelagt).
update public.historical_kings
  set description = coalesce(description,'') || ' [OBS: regentskap, årtal och slaget vid Halör 984 är modern spekulativ rekonstruktion utan källstöd.]'
  where id in ('83101388-02ee-4ec4-bf2a-0c0bc4639eb4',  -- Björn Jarl
               '4bd515c8-7cca-463e-b098-0cbee3ab4f58'); -- Sibir Fultarsson
update public.historical_kings
  set description = coalesce(description,'') || ' [Notera: Toke Gormsson är runstensbelagd (DR 295 Torna Hällestad, "hulda drott"); de detaljerade årtalen/exilen är dock rekonstruktion.]'
  where id='1bd961dc-efe5-4da7-827a-e55e5976b05b';  -- Toke Gormsson
-- #7 Ingvar Vittfarne: expeditionsledare, ej kung (kallas aldrig konung på ~26 Ingvarsstenar)
update public.historical_kings set role='Expeditionsledare', de_facto_ruler=false
  where id='c4830573-6d52-4a04-8dde-aed44fbc7086';
-- #11 Ynglingar -> Munsöätten (historiska); Ynglingaätten reserveras för legendariska (Adils/Ottar)
update public.historical_kings set dynasty_id=(select id from public.royal_dynasties where name='Munsöätten' limit 1)
  where id in ('53153467-9302-4754-8ee2-676b662d1e05',  -- Erik Segersäll
               '8d8f9ccd-ba45-4643-a204-11a6f9eb6391',  -- Olof Skötkonung
               '5ec127f0-837c-403f-93a8-c44776e163a2'); -- Anund Jakob

-- #10 Olof III (dataartefakt, null reign, oidentifierbar) — VERIFIERA, avkommentera för att radera:
-- delete from public.historical_kings where id='5e99ed64-9a6e-4479-923d-439c0840afe0';
-- "Ragnhild" (b682be14, disputed, gender male, null reign) — trolig artefakt, verifiera:
-- delete from public.historical_kings where id='b682be14-4467-4bb2-8ded-e33b931d4678';

-- =====================================================================
-- (e) DEDUP (rättelse #8). Behåll kanonisk rad (dynasty + längst beskrivning), radera övriga.
-- OBS: "Håkan Magnusson ×2" är INTE dubbletter (1093–1094 vs 1362–1380 = olika personer,
-- Håkan Magnusson av Norge resp. Håkan VI). Lämnas orörda.
-- =====================================================================
delete from public.historical_kings where id in (
  '9d1391b2-dace-4976-afc8-6bc8f1c09bcf',  -- Gorm den gamle (behåll dad80e7c m. dynasti)
  'cb88822e-984f-4ca1-b2a7-f5bf635d2899',  -- Gorm den gamle
  '4d844095-a41d-483e-929d-fb80e40fd86f',  -- Harald Blåtand (behåll 11e1bca1 m. dynasti)
  '68f95a7f-cbca-4565-8efd-79faf5d564a9',  -- Magnus Haraldsson (behåll c4ed8d94, längre desc)
  'cec27557-c2c5-4768-907e-6778bd757185'   -- Olav Kyrre (behåll 883c257f, längre desc)
);

commit;
