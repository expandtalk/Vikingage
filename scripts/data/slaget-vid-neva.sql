-- Slaget vid Neva (15 juli 1240) — militär historisk händelse.
-- Battles hanteras i historical_events (event_type='military'), renderas som kartmarkör
-- (useHistoricalEventMarkers) + gate 'historical_events'. Källkritisk framställning.

-- OBS: geom är en GENERERAD kolumn (auto från lat/lng) — sätts ej explicit.
insert into historical_events
  (year_start, year_end, event_name, event_name_en, event_type, significance_level,
   region_affected, sources, description, description_en, lat, lng)
select 1240, 1240, 'Slaget vid Neva', 'Battle of the Neva', 'military', 'high',
  '{"Ingermanland","Novgorod","Ryssland"}',
  '{"Novgorodkrönikan","Alexander Nevskij-legenden"}',
  'Slag 15 juli 1240 vid Nevas strand (Ust-Izjora) mellan en svensk styrka och Republiken Novgorod under Alexander (senare helgonförklarad som Nevskij). Nästan osynligt i svenska källor men centralt i rysk historieskrivning. Sannolikt lett av biskop Thomas av Åbo — inte Birger jarl (som troligen var hemma i Östergötland; sonen Valdemar föddes 1239, ett argument som dock vilar på antagandet att Birger var fadern). Del av de svensk-novgorodska krigen; svenskt syfte att kontrollera Nevas mynning och Ladoga — nyckeln till "vägen från varjagerna till grekerna". Nederlaget bidrog till biskop Thomas fall 1245. Det yttre trycket österifrån är samma slags hot som föranledde försvarsvallar som Götavirke.',
  'Battle on 15 July 1240 at the Neva (Ust-Izhora) between a Swedish force and the Republic of Novgorod under Alexander (later Nevsky). Marginal in Swedish sources but central in Russian historiography. Probably led by Bishop Thomas of Turku, not Birger Jarl. Part of the Swedish–Novgorodian wars over control of the Neva mouth and Ladoga.',
  59.8000, 30.5800
where not exists (select 1 from historical_events where event_name = 'Slaget vid Neva');
