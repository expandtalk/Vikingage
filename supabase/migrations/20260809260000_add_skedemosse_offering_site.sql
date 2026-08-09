-- Skedemosse (Gärdslösa sn, Öland) — en av Sveriges största järnåldersoffer­platser; saknades.
-- Koordinat verifierad (Wikidata Q1678429 P625, lokalitetsnivå). Häst-/vapen-/människooffer +
-- guld = BELAGT; Kvinnön-fornborg + Freja-tillskrivning = TOLKNING (Jan-Henrik Fallgren, film).
insert into heritage_sites (name, raa_type, landscape, municipality, parish, lat, lng, period, description, source_uri, evidence_class)
values (
  'Skedemosse (offerplats)', 'offerplats', 'Öland', 'Borgholm', 'Gärdslösa', 56.8398, 16.7606,
  'Förromersk järnålder–sen vikingatid (ca 400 f.Kr.–1100-tal)',
  'En av Sveriges största järnåldersoffer­platser. BELAGT: häst- och vapenoffer (huvuden/skinn av häst dominerar djurbenen), 7 guldringar (~1,3 kg), ~30 människooffer; förromersk järnålder–sen vikingatid. TOLKNING (ej belagt i standardkällor): fornborg på Kvinnön + Freja-tillskrivning (Jan-Henrik Fallgren, film) — kräver primärkälla/Fornsök-koord.',
  'https://www.wikidata.org/wiki/Q1678429', 'belagt')
on conflict do nothing;
