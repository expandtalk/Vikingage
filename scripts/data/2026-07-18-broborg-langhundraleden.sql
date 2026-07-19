-- Data-berikning 2026-07-18: Broborg (fornborg) + Långhundraleden (farled)
-- Berikar den befintliga tunna Broborg-posten i swedish_hillforts och lägger
-- Långhundraleden som en river_systems-rutt (renderas av befintliga flod-lagret).
-- Vetenskaplig ärlighet: Beowulf-koppling = hypotes, Grimsa = sägen — märkt i texten.
-- Idempotent: UPDATE på känt id; Långhundraleden raderas + återinsätts.

-- 1. Berika Broborg (id 7eb178a4-6bb7-43af-875c-1e86894be20c)
update public.swedish_hillforts set
  parish = 'Husby-Långhundra',
  municipality = 'Knivsta',
  county = 'Uppsala län',
  landscape = 'Uppland',
  fortress_type = 'hillfort',
  status = 'confirmed',
  period = 'Folkvandringstid–vendeltid (ca 375–750 e.Kr.)',
  description = 'En av Upplands mest anmärkningsvärda fornborgar, på en bergshöjd intill den forntida sjöleden Långhundraleden, ca 10 km nordost om Knivsta. Anläggningen är 95×85 m med ringmur, dubbla vallar och två ingångar. Det unika är den omfattande förglasningen av ringmuren – stenen upphettades medvetet till över 1 100 °C och stelnade till ett hårt, glasartat material (en avsiktlig byggteknik, inte spår av brand). Under folkvandringstiden låg vattnet ca 6–7 m högre än idag; dalen nedanför var då en bred, segelbar farled och borgen reste sig ~40 m över vattenytan.',
  cultural_significance = 'Kontrollerade sjöleden mot Gamla Uppsala och fungerade sannolikt som utkik, tullstation och första länk i en signalkedja av vårdkasar mot maktcentrumet. Två byggfaser: borgen anlades under folkvandringstid (ca 375–550 e.Kr.), medan murens förglasning skedde under vendeltid (ca 550–750 e.Kr.). Hypotes (ej etablerad forskning): Bo Gräslund har föreslagit en koppling mellan Broborg, Beowulfkvädet och sveaväldets maktbas i Uppsala. Intill borgen ligger gravhögen Grimsahögen, förknippad med en sägen om en brand som syntes ända till Uppsala – folklig tradition, inte dokumenterad historia.',
  source_reference = 'RAÄ Husby-Långhundra 156:1. Utgrävningar 1982 (datering till folkvandringstid) och 2017–2018 (förglasad vall daterad till vendeltid). Vårdkasar omnämnda i Upplandslagen. Beowulf-hypotes: Bo Gräslund, Uppsala universitet.',
  updated_at = now()
where id = '7eb178a4-6bb7-43af-875c-1e86894be20c';

-- 2. Långhundraleden som farled (idempotent: rensa ev. tidigare + återinsätt)
delete from public.river_coordinates where river_system_id in
  (select id from public.river_systems where name = 'Långhundraleden');
delete from public.river_systems where name = 'Långhundraleden';

with led as (
  insert into public.river_systems
    (name, name_en, description, period, significance, historical_significance, color, width, importance, type, total_length_km)
  values (
    'Långhundraleden',
    'The Långhundra Route',
    'En ca 19 km lång forntida sjöled mellan Uppsala-området och Östersjön, via Vallentuna och Åkersberga. Under järnåldern en central kommunikations- och handelsled in mot Gamla Uppsala. Sträckningen här är schematisk, dragen mellan kända landmärken längs leden.',
    'Folkvandringstid–vikingatid',
    'Strategisk infartsled mot maktcentrumet Gamla Uppsala.',
    'Fornborgen Broborg vaktade en trång och svårnavigerad passage längs leden; den som kontrollerade Broborg kontrollerade vägen mot Gamla Uppsala.',
    '#0ea5e9', 4, 'primary', 'sailing_route', 19
  )
  returning id
)
insert into public.river_coordinates
  (river_system_id, sequence_order, latitude, longitude, name, name_en, description, is_trading_post, is_portage)
select led.id, v.seq, v.lat, v.lng, v.nm, v.nm_en, v.descr, false, false
from led, (values
  (1, 59.4558, 18.3600, 'Österskär (Trälhavet)', 'Österskär (Trälhavet)', 'Ledens mynning i Östersjön (Trälhavet/Tunafjärden).'),
  (2, 59.5642, 18.3536, 'Garnsviken (Brottby)', 'Garnsviken (Brottby)', 'Nordlig utgångspunkt för färd på leden.'),
  (3, 59.5790, 18.2088, 'Vada Sjökullar', 'Vada Sjökullar', 'Vikingatida gravfält vid leden i Vallentuna.'),
  (4, 59.7556, 17.9516, 'Broborg', 'Broborg', 'Förglasad fornborg som kontrollerade leden mot Gamla Uppsala.'),
  (5, 59.8600, 17.7000, 'Mot Gamla Uppsala (schematisk)', 'Toward Gamla Uppsala (schematic)', 'Ungefärlig nordlig ändpunkt vid maktcentrumet.')
) as v(seq, lat, lng, nm, nm_en, descr);
