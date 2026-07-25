-- Linköping / Stångån — vikingatida ostgötsk innerbygd.
-- Proveniens: linkopingshistoria.se/jarnalder/vikingatid + Daniels gränssnittsnoteringar.
-- Applicerad via Supabase MCP execute_sql; denna fil = proveniens/återskapning.
--
-- Fyra saker:
--   1. TA BORT dubbletten "Vikingavägen Östergötland / Ostgoth waterway"
--      (river_system 2cd72995) — den grova Söderköping→Alvastra→Vättern-linjen.
--      "Vättern–Söderköping (Göta kanals föregångare)" (5c14d99b) är den korrekta.
--   2. FLYTTA Norsholm på den korrekta leden till verkligt läge (Roxens NÖ-infart
--      mot Asplången), 58.487/15.900 -> 58.529/15.983.
--   3. FÖRLÄNG den befintliga Stångån-leden (b9e4c0c4) från Linköping norrut via
--      Stångåns mynning till Roxen, så den södra grenen faktiskt möter huvudleden.
--   4. LÄGG IN vikingatida/järnålders platser i Linköpingsbygden i archaeological_sites
--      (runstenarna finns redan i runic_inscriptions — dubbleras EJ).

begin;

-- 1. Ta bort dubbletten (koordinater först, sedan systemet) --------------------
delete from river_coordinates
 where river_system_id = '2cd72995-adcb-4a90-9c3b-b7462c1aeb36';
delete from river_systems
 where id = '2cd72995-adcb-4a90-9c3b-b7462c1aeb36';

-- 2. Flytta Norsholm till verkligt läge (infarten till Roxen) ------------------
update river_coordinates
   set latitude = 58.529, longitude = 15.983,
       description = 'Norsholm — infarten till Roxen från öster; leden viker av mot Asplången (ej ned längs Motala ström mot Norrköping)'
 where river_system_id = '5c14d99b-3551-4103-ba46-b93bd8d64cb5'
   and name = 'Norsholm';

-- 3. Södra grenen: förläng Stångån från Linköping upp till Roxen --------------
-- Befintlig led slutar vid Linköping (sequence_order 7). Markera Linköping som
-- knutpunkt och lägg till mynningen + Roxen så grenen möter Vättern–Söderköping.
update river_coordinates
   set is_trading_post = true,
       description = 'Linköping (Liunga kauping) — centralort där häradsvägen mötte vattenvägen Stångån'
 where river_system_id = 'b9e4c0c4-8fa1-497e-a059-1c7498b8d6a3'
   and name = 'Linköping';

insert into river_coordinates
  (river_system_id, sequence_order, latitude, longitude, name, name_en, description, is_trading_post, is_portage)
values
  ('b9e4c0c4-8fa1-497e-a059-1c7498b8d6a3', 8, 58.452, 15.640,
   'Stångåns mynning i Roxen', 'Mouth of Stångån in Lake Roxen',
   'Stångån rinner ut i Roxen; via Stångebro (Liunga ting) förband den centralorten med den öst-västliga sjöleden', false, false),
  ('b9e4c0c4-8fa1-497e-a059-1c7498b8d6a3', 9, 58.486, 15.660,
   'Roxen (Stångåns anslutning)', 'Lake Roxen (Stångån junction)',
   'Anslutning till Vättern–Söderköping-leden i Roxen', false, false);

-- 4. Vikingatida/järnålders platser i Linköpingsbygden ------------------------
-- OBS dedup mot heritage_sites (RAÄ): skeppssättningen vid Stångebro finns REDAN
-- där (mislabeled "Grav- och boplatsområde") och berikas i steg 5 i stället för
-- att dubbleras. Linköping/Söderköping finns i viking_cities (steg 6).
-- Endast platser som SAKNAS i heritage_sites/viking_cities läggs in här.
-- period: 'Viking' resp. 'Migration' (folkvandringstid) i linje med befintliga rader.
insert into archaeological_sites
  (name, location, parish, county, country, period, dating, burial_type, description, geom, coordinates)
select v.name, v.location, v.parish, 'Östergötland', 'Sweden', v.period, v.dating, v.burial_type, v.description,
       ST_SetSRID(ST_MakePoint(v.lng, v.lat), 4326),  -- geom (PostGIS geometry)
       point(v.lng, v.lat)                            -- coordinates (native point)
from (values
  ('Vreta klosters vikingatida begravningsplats', 'Vreta kloster', 'Vreta kloster', 'Viking', '900–1000-tal',
   'kristen radgravplats',
   'Tidigare okänd gravplats vid Vreta klosters kyrkogård, män/kvinnor/barn i rad, mycket ytligt. Strontiumanalys: ~69 % lokala, övriga från bl.a. Tyskland och England. Barngrav med björnklo-amulett; två män med läkta skallskador (möjlig kungshird). Två stolphål antyder tidig träkyrka. Tidigt kristet centrum med internationella kontakter.',
   58.4817, 15.4808),
  ('Valla vikingagård', 'Valla (bakom Campushallen, universitetsområdet)', 'Kaga', 'Viking', 'ca 650–1050 (bebodd ~400 år)',
   'boplats/gård',
   'Fullständigt undersökt vikingatida gård — långhus ~150 m² på kulle, kokhus/vävstuga/smedja, trälbostäder i sluttningen. Odling av vete, havre, korn, råg, lin, ärtor, timjan. Fynd: engelskt silvermynt präglat i Stamford på 1020-talet, med inristade runor (samtida med Knut den store).',
   58.3985, 15.5760),
  ('Gumpekulla by', 'Gamla Stångebro (vid gamla ishallen)', 'Linköping', 'Viking', '1000-tal',
   'boplats',
   'Vikingatida by, kontinuerligt bebodd in i medeltid. Kulturlager och lösfynd: spännbucklor, nyckel, svärdsknapp, blå glaspärla, keramik. Gumpekullastenen (runsten) restes på höjden intill; fyra runstenar har funnits i området.',
   58.4160, 15.6400),
  ('Kareby (försvunnen by)', 'Väster om Stångån, nedanför Nykvarns vattenfall', 'Linköping', 'Viking', 'vikingatid–medeltid',
   'boplats',
   'Idag bortglömd by strategiskt placerad mittemot Stångebro, nedanför Nykvarns fall. Öppen plats nära stranden — möjlig handelsplats. "Karlar" (kungens män med vakt-/krigsfunktion) kan ha vaktat platsen.',
   58.4120, 15.6330),
  ('Tegneby', 'Tegneby (nära Roxens strand, N om Stångebro)', 'Rystad', 'Viking', 'vendeltid–vikingatid',
   'boplats',
   'Ortnamn på tegn/tegner — krigare knutna till storman eller kung, med ursprung i vendeltid (jfr karlar). Belägg för aristokratisk/militär organisation i bygden mellan Stångebro och Roxen.',
   58.4560, 15.6820),
  ('Hackefors halsring (fyndplats)', 'Hackefors', 'Linköping', 'Viking', '900-tal',
   'depåfynd',
   'Vid stubbrytning 1915 hittades en halsring av åtta hopflätade silvertrådar, diameter 22 cm, drygt 300 g. Motsvarigheter i Kiev och Spanien — troligt importföremål till en vikingahövding i södra Linköpingstrakten. Utställd på Östergötlands museum.',
   58.3830, 15.6650),
  ('Sättunahögen', 'Sättuna', 'Kaga', 'Migration', 'folkvandringstid',
   'gravhög',
   'Storhög från folkvandringstid nära Roxens sydvästra strand — del av bygdens maktmanifestation efter romarrikets sammanbrott.',
   58.4680, 15.5480),
  ('Ledbergs kulle', 'Ledberg', 'Ledberg', 'Migration', 'folkvandringstid',
   'gravhög',
   'Storhög från folkvandringstid vid Ledberg. Intill står den senare, rikt dekorerade Ledbergsstenen (Ög) med skepp, vikingar och Fenrisulven.',
   58.4000, 15.4700)
) as v(name, location, parish, period, dating, burial_type, description, lat, lng);

-- 5. Berika befintlig skeppssättning i heritage_sites (Stångebro / Liunga ting)
-- Rätta det generiska namnet och lägg storyn + runstensklustret (fyra Ög-stenar).
update heritage_sites
   set name = 'Stångebro skeppssättning (Liunga ting)',
       period = coalesce(period, '890–1030'),
       description = '50 m lång, 11 m bred skeppssättning med 46 resta stenar längs Stångån, utan begravning — noga placerad mellan bro och landsväg. Trolig plats för Liunga (Ljunga) landsting. Vid Stångebro fanns ett kluster om fyra runstenar (bl.a. Gumpekulla- och Kallerstadstenen, två inmurade i en fabriksgrund på 1880-talet) — koncentrationen markerar platsens betydelse.'
 where raa_type = 'skeppssättning'
   and parish = 'Linköping'
   and lat between 58.415 and 58.425
   and lng between 15.630 and 15.640;

-- 6. Berika Linköping i viking_cities (Liunga kauping — ting, köping, järn) ----
update viking_cities
   set description = 'Liunga kauping — centralort vid det enda broläget över Stångån där fyra härader möttes och häradsvägen korsade vattenvägen Stångån (mot Roxen och den öst-västliga sjöleden). Liunga ting (skeppssättningen vid Stångebro) hörde hit; orten blev civitas med biskop och stift. Namnet -köping visar marknads-/handelsfunktion.',
       historical_significance = coalesce(historical_significance,
         'Östgötsk centralort: ting + marknad + vattenväg + stift — nod i Bjälboättens maktbygge.')
 where name = 'Linköping' and region = 'Östergötland';

commit;
