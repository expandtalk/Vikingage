-- (1) Ärlig lägesflaggning av historiska händelser: location_status (belagd/omtvistad/legendarisk)
--     + location_note. Raderar INTE koordinater (Daniel: hellre ärligt flaggat) — frontend renderar
--     omtvistade/legendariska distinkt. (2) Disambiguera "Kalmar kyrka" som egentligen är Kalmar sn
--     i UPPLAND (lat 59.54), ej Kalmar i Möre — den maskerade sig som Möre-Kalmars kyrka.
begin;

alter table public.historical_events
  add column if not exists location_status text,
  add column if not exists location_note text;

update public.historical_events set location_status='belagd' where lat is not null;

update public.historical_events set location_status='legendarisk',
  location_note='Sagoslag (Sögubrot m.fl.) — platsen är okänd; traditionellt till Östergötland men ej belagd.'
  where event_name ilike 'Slaget på Bråvalla%';
update public.historical_events set location_status='omtvistad',
  location_note='Halvlegendariskt; brukar knytas till Fyrisvallarna vid Uppsala men exakt plats oviss.'
  where event_name ilike 'Slaget vid Fýrisvellir%';
update public.historical_events set location_status='omtvistad',
  location_note='Platsen omtvistad: kandidater är Öresund och södra Östersjön nära Rügen. Historiker pekar åt olika håll.'
  where event_name ilike 'Slaget vid Svolder%';
update public.historical_events set location_status='omtvistad',
  location_note='Läget vid Helgeå omtvistat (Skåne); exakt plats för slaget ej säkerställd.'
  where event_name ilike 'Slaget vid Helgeå%';
update public.historical_events set location_status='omtvistad',
  location_note='Exakt slagfält omtvistat (Västergötland).'
  where event_name in ('Slaget vid Lena','Slaget vid Gestilren');

-- (2) Kalmar-kyrkan som ligger i Uppland (lat 59.54) — disambiguera så den slutar visas som Möre-Kalmars kyrka.
update public.ecclesiastical_sites set
  name = 'Kalmar kyrka (Kalmar sn, Uppland)',
  historical_notes = coalesce(historical_notes||' ','') || 'OBS: detta är Kalmar socken i Uppland (ärkestiftet Uppsala), INTE Kalmar i Möre. Möre-Kalmars medeltida stadskyrka var Bykyrkan / S:t Nicolai (vid torget i gamla stan, byggd fr.o.m. tidigt 1200-tal, sprängd 1678) — se RAÄ-lämningen Kalmar 56:2.'
  where id = 'e5f3bbdf-b281-4783-b295-b32011affd3b';

commit;
