-- Göta landsväg: av-hårdkoda hållpunkterna. Flyttar den kurerade nod-sekvensen från
-- src/pages/GotaLandsvag.tsx (NODES) in i road_waypoints som enda källa, och exponerar en
-- RPC som returnerar lat/lng separat (klienten slipper parsa point-typen).
--
-- INGEN GISSNING: raderna är en verbatim-kopia av den redan verifierade koden. De 15 punkterna
-- ersätter de 10 äldre, avvikande raderna för vägen (koden är den nyare, kurerade sanningen).
-- road_id = Göta landsväg i viking_roads.
--
-- OBS: road_waypoints.waypoint_type har en check-constraint (path/bridge/ford/landmark/junction).
-- Sidans presentationstyp (endpoint/bridge/thing/rune/church/fort) lagras därför i en egen kolumn
-- `kind`; waypoint_type sätts till närmaste tillåtna värde (bridge→bridge, övriga→landmark).

-- 1) Utöka schemat med fält koden behöver (som saknades i tabellen).
alter table public.road_waypoints add column if not exists name_en text;
alter table public.road_waypoints add column if not exists kind text;
alter table public.road_waypoints add column if not exists signum text;
alter table public.road_waypoints add column if not exists church_name text;
alter table public.road_waypoints add column if not exists off_route boolean not null default false;

-- 2) RPC: läs vägens waypoints med lat/lng utplockade ur point-typen (point[0]=lng, point[1]=lat).
create or replace function public.get_road_waypoints(p_road_id uuid)
returns table (
  waypoint_order integer,
  name text,
  name_en text,
  kind text,
  note text,
  lat double precision,
  lng double precision,
  signum text,
  church_name text,
  off_route boolean
)
language sql
stable
as $fn$
  select
    w.waypoint_order,
    w.name,
    w.name_en,
    coalesce(w.kind, w.waypoint_type) as kind,
    w.description as note,
    w.coordinates[1] as lat,
    w.coordinates[0] as lng,
    w.signum,
    w.church_name,
    coalesce(w.off_route, false) as off_route
  from public.road_waypoints w
  where w.road_id = p_road_id
  order by w.waypoint_order
$fn$;

grant execute on function public.get_road_waypoints(uuid) to anon, authenticated;

-- 3) Reseed: ersätt vägens waypoints med den kurerade 15-nod-sekvensen (N→S).
delete from public.road_waypoints where road_id = '97b4a769-7eed-4d64-b97e-978d5b957e7d';

insert into public.road_waypoints (road_id, waypoint_order, waypoint_type, kind, name, coordinates, description, signum, church_name, off_route) values
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 1, 'landmark', 'endpoint', 'Björns trädgård – Allmänningsvägen (start, approx.)', point(18.07389, 59.31528), $wp$Trolig nordlig utgångspunkt vid övre Götgatsbacken (Björns trädgård, intill Medborgarplatsen). Stadsmuseet grävde 2003 fram rester av gator som övergavs vid gaturegleringen på 1640-talet; den bredaste tolkas som Allmänningsvägen — den gamla utfartsvägen söderut ur staden. Källa: Stockholmskällan / Fennö 2004 (CC-BY). Ändpunkt approximativ.$wp$, null, null, false),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 2, 'landmark', 'endpoint', 'Skanstull (infart Södermalm, approx.)', point(18.0765, 59.3045), $wp$Vägen gick från Götgatan över Skanstull och vidare söderut i ungefär dagens Johanneshovsvägens sträckning — det är den historiska linjen. (Strandvägen längs Årstaviken/Årstavägen är ett modernt, naturskönt promenadalternativ, inte den gamla vägen.) Strax utanför tullen låg stadens galgbacke, avrättningsplats in på 1800-talet. Läge approximativt.$wp$, null, null, false),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 3, 'bridge', 'bridge', 'Årstafältet – Valla å', point(18.0450, 59.2907), $wp$Bäst bevarade sträckan (RAÄ Brännkyrka 34:1), ~730 m över fältet; korsade Valla å (rekonstruerad stenvalvbro 1998). Band samman järnåldersgårdarna Valla/Bägersta och Östberga/Ersta. OBS: gc-vägen över fältet är permanent avstängd sedan 2 juni 2025 pga stadsbygget — anvisad omledning via Åbyvägen och söder om Östbergavägen (över Östberga); Vallastråket öppnar tidigast hösten 2026.$wp$, null, null, false),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 4, 'landmark', 'church', 'Brännkyrka kyrka', point(18.02306, 59.28194), $wp$Medeltida sockenkyrka. Brännkyrka socken låg i Svartlösa härad t.o.m. 1913.$wp$, null, 'Brännkyrka kyrka', false),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 5, 'landmark', 'rune', 'Glömstahällen (Sö 300)', point(17.9146, 59.2347), $wp$"Sverker lät göra bron efter Ärengunn, sin goda moder" — ett brobyggnadsmonument som daterar vägen över den sanka Glömstadalen till minst 1000-talet. RAÄ Huddinge 24:1.$wp$, 'Sö 300', null, false),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 6, 'bridge', 'bridge', 'Flottsbro (flottbron)', point(17.88083, 59.23139), $wp$Här tvingas vägen ned till det smalaste sundet mellan Albysjön (norr) och Tullingesjön (söder) — två långsmala sprickdalssjöar i berggrundens förkastningslinjer, typiska för Mälarlandskapet, där bergsryggarna faller brant mot vattnet. Resenärerna fördes över på en flottbro (flytande bro), i bruk till 1660-talet; 1669 flyttades vägen till Fittjanäset.$wp$, null, null, false),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 7, 'landmark', 'thing', 'Svartlötens tingsplats', point(17.83639, 59.2400), $wp$Häradsting för Svartlösa härad (RAÄ Botkyrka 389:1), vid Alby/Hallunda. Ligger idag delvis under E4/E20 — därför löper vägen här parallellt med motorvägen. Föregångaren kallades Tingsvägen just för att den ledde hit.$wp$, null, null, false),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 8, 'landmark', 'church', 'Botkyrka kyrka', point(17.81839, 59.23908), $wp$Medeltidskyrka i S:t Botvid-miljön (härifrån Botkyrkamonumentet Sö 286). Ungefär halvvägs Stockholm–Södertälje — ofta första dagsetappen.$wp$, null, 'Botkyrka kyrka', false),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 9, 'landmark', 'church', 'Salems kyrka', point(17.77046, 59.21852), $wp$Medeltida sockenkyrka; vägen viker sedan förbi Aspen och öster/söder om Bornsjön.$wp$, null, 'Salems kyrka', false),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 10, 'landmark', 'rune', 'Bornsjön – Söderbystenen (Sö 306)', point(17.7798, 59.2173), $wp$Vid Söderby fornminnesområde söder om Bornsjön. En av två runstenar i Bornsjöbygden längs vägen (den andra är Oxelbystenen Sö 304). Koordinat Rundata "high".$wp$, 'Sö 306', null, false),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 11, 'landmark', 'rune', 'Bornsjön – Oxelbystenen (Sö 304)', point(17.6941, 59.2339), $wp$Vägen gick öster/söder om Bornsjön, förbi Söderby fornminnesområde; här står runstenen Oxelbystenen.$wp$, 'Sö 304', null, false),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 12, 'landmark', 'church', 'Sankta Ragnhilds kyrka', point(17.6261, 59.1985), $wp$Efter en sväng sydväst norr om sjön Tullan kom vägen in i Södertälje från öster, ca ett kvarter söder om kyrkan, och slutade vid Stora Torget.$wp$, null, 'Sankta Ragnhilds kyrka', false),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 13, 'landmark', 'rune', 'Holmfast-ristningarna (Sö 311 & Sö 312)', point(17.6134, 59.196), $wp$Vid Kvarnbacken i Södertälje-änden. Sö 312: "Holmfast lät röja väg och göra bro efter Gamal, sin far, som bodde i Näsby." Tillsammans med Sö 300 vid Glömsta det starkaste vittnesbördet om att stråket var en organiserad väg- och broled redan på 1000-talet. Koordinat Rundata "high".$wp$, 'Sö 312', null, false),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 14, 'landmark', 'fort', 'Ragnhildsborg / Telge hus (kringmål)', point(17.6100, 59.2181), $wp$Medeltida borglämning (RAÄ Östertälje 220:1) på Slottsholmen i Linasundet, ca 2,5 km norr om Stora Torget. Anlagd på 1300-talet, bränd 1445, återuppförd 1448 (Karlsborg). Kontrollerade Tälje sund — "låset till Mälaren" för den som ville sjövägen in i Mälaren. Landsvägen och borgen är två sidor av samma strategiska nod vid Tälje-näset; ett kort kringmål norrut från vägens slut. Funktionstolkning, ej primärkällecitat; medeltida — ej vikingatida.$wp$, null, null, true),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 15, 'landmark', 'endpoint', 'Södertälje – Stora Torget (slut, approx.)', point(17.6253, 59.1955), $wp$Vägens södra ände vid Tälje-näset — den obligatoriska passagen mellan Mälaren och Östersjön. Ändpunkt approximativ.$wp$, null, null, false);
