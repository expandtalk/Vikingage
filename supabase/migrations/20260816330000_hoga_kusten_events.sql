-- Höga kusten: lyft in de två flaggskepps-BERÄTTELSERNA som faktiska historical_events med
-- DB-verifierade koordinater (Lunde/Torsåker ur place_names/ecclesiastical_sites — ej ur minnet).
-- Siffror källkritiskt märkta. Story-vandringarnas enskilda stopp (10–15 koord/vandring) kräver
-- koordinater från projektet och läggs in när de finns — INGEN gissning här.

-- geom är en GENERERAD kolumn (ur lat/lng) → sätts INTE här.
insert into public.historical_events (event_name, event_name_en, year_start, year_end, event_type, lat, lng, description, description_en)
select v.sv, v.en, v.ys, v.ye, v.et, v.lat, v.lng, v.d, v.den
from (values
  ('Skotten i Lunde (Ådalen 1931)', 'The Ådalen shootings (1931)', 1931, 1931, 'social',
   62.8796, 17.8705,
   'Under arbetskonflikten i Ådalen sköt militär den 14 maj 1931 mot ett demonstrationståg i Lunde utanför Kramfors. Fem personer dödades (Eira Söderberg, Erik Bergström, Evert Nygren, Sture Larsson, Viktor Eriksson). Händelsen blev en vändpunkt i svensk arbetar- och politisk historia. Koordinat: Lunde (DB-verifierad ur place_names).',
   'During the Ådalen labour conflict, the military fired on a demonstration in Lunde near Kramfors on 14 May 1931. Five people were killed. The event became a turning point in Swedish labour and political history.'),
  ('Häxprocesserna i Ångermanland — Torsåker 1675', 'The Ångermanland witch trials — Torsåker 1675', 1674, 1675, 'religious',
   63.0798, 17.7416,
   'Trolldomskommissionen verkade i Ångermanland 1674–1675. Massavrättningen ägde rum på Bålberget vid Torsåker den 1 juni 1675 och räknas som en av Sveriges största enskilda häxavrättningar. Antalet avrättade (traditionellt ~65–71) är omdiskuterat bland historiker — redovisas som tradition, ej fastställt. Koordinat: Torsåkers kyrka (DB-verifierad).',
   'The witchcraft commission operated in Ångermanland 1674–1675. The mass execution took place at Bålberget near Torsåker on 1 June 1675, one of Sweden''s largest single witch executions. The number executed (traditionally ~65–71) is debated by historians — given as tradition, not established fact.')
) as v(sv, en, ys, ye, et, lat, lng, d, den)
where not exists (select 1 from public.historical_events he where he.event_name = v.sv);
