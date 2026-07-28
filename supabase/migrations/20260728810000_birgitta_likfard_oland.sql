-- Heliga Birgittas likfärd över Öland (1374) + Sikavarp/Kapelludden (Daniel). Källa: SHM/Historiska
-- museet (Birgitta-vitan: "med båt till Öland och vidare"), RAÄ Fornsök (Sankta Brita kapell
-- c17a164a). Platserna hör till Ölands kristnande-geografi (Birgitta = senmedeltida rikshelgon).

-- S:ta Britas kapell = Sikavarp/Kapelludden: berika med likfärds-kontext + koppla helgon Birgitta.
update public.ecclesiastical_sites set
  saint_code = 'birgitta',
  description = 'Kapellruin från 1200-talet vid den medeltida hamnplatsen Sikavarp (idag Kapelludden, Bredsättra sn). Hit, till Sveriges första hamn på färden, anlände skeppet med Heliga Birgittas kvarlevor 28 maj 1374; därifrån bars kistan över Öland till Köpingsvik och vidare söderut till Kyrkhamn. RAÄ Fornsök c17a164a.',
  dedication_source = 'namnform + Birgitta-vitan (SHM); RAÄ Fornsök'
 where name ilike '%brita%kapell%' and parish='Bredsättra';

-- Sikavarp som hamn (första landningsplats).
insert into public.harbors (name, name_en, harbor_type, period_start, period_end, lat, lng, description, sources)
values ('Sikavarp (Kapelludden)', 'Sikavarp (Kapelludden)', 'medeltida hamn', 1100, 1400, 56.8193, 16.8408,
  'Medeltida hamnplats på Ölands östkust (Bredsättra), idag Kapelludden. Sveriges första hamn där skeppet med Heliga Birgittas kvarlevor lade till 28 maj 1374. Kapellruin (Sankta Brita) från 1200-talet intill.',
  ARRAY['Historiska museet/SHM (Birgitta-vitan)','RAÄ Fornsök c17a164a']::text[])
on conflict do nothing;

-- Likfärden som händelse (route-noten i location_note; punkt vid Sikavarp).
insert into public.historical_events (event_name, event_name_en, year_start, year_end, description, event_type,
  significance_level, region_affected, sources, lat, lng, location_status, location_note)
values ('Heliga Birgittas likfärd till Öland', 'St Bridget''s funeral procession via Öland', 1374, 1374,
  'Skeppet med Heliga Birgittas kvarlevor (död i Rom 1373) landade vid Sikavarp/Kapelludden på Ölands östkust 28 maj 1374 — Sveriges första hamn på hemfärden. Kistan bars över ön till Köpingsvik och vidare söderut till Kyrkhamn vid södra udden, innan färden mot Vadstena fortsatte.',
  'religiös/kunglig', 'hög', ARRAY['Öland','Småland']::text[],
  ARRAY['Historiska museet/SHM (Birgitta-vitan)']::text[],
  56.8193, 16.8408, 'belagd',
  'Rutt över Öland: Sikavarp/Kapelludden (landning 28 maj) → Köpingsvik → Kyrkhamn (södra udden).')
on conflict do nothing;
