-- Kungsgård-gazetteer ur Wikidata (rena P625-koordinater). Namngivna kungsgårdar/
-- kungsladugårdar; brus (kyrkor/gator/skolor) + husaby (redan i place_names) bortfiltrerat.
-- OBS: ägande/tid + epok ej fastställt per gård (blandar medeltid + Vasa-avelsgårdar).
-- Idempotent på source. geom via kolumn (trigger sätter den också).
DELETE FROM public.estates WHERE source='Wikidata';
INSERT INTO public.estates (name, estate_type, lat, lng, geom, description, source, confidence) VALUES
  ('Alvastra kungsgård', 'kungsgård', 58.295944444, 14.656277777, ST_SetSRID(ST_MakePoint(14.656277777,58.295944444),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Alvhems kungsgård', 'kungsgård', 57.9985, 12.1831, ST_SetSRID(ST_MakePoint(12.1831,57.9985),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Billesholms kungsgård', 'kungsgård', 56.0658, 12.9744, ST_SetSRID(ST_MakePoint(12.9744,56.0658),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Borgholms kungsgård', 'kungsgård', 56.86732, 16.65866, ST_SetSRID(ST_MakePoint(16.65866,56.86732),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Dalby kungsgård', 'kungsgård', 55.66472222, 13.34333333, ST_SetSRID(ST_MakePoint(13.34333333,55.66472222),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Drottningholms kungsgård', 'kungsgård', 59.32777778, 17.87833333, ST_SetSRID(ST_MakePoint(17.87833333,59.32777778),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Flyinge kungsgård', 'kungsgård', 55.749281775, 13.351039658, ST_SetSRID(ST_MakePoint(13.351039658,55.749281775),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Gudhems kungsgård', 'kungsgård', 58.2387, 13.5588, ST_SetSRID(ST_MakePoint(13.5588,58.2387),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Götala kungsgård', 'kungsgård', 58.38138889, 13.48361111, ST_SetSRID(ST_MakePoint(13.48361111,58.38138889),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Hjälmshults kungsgård', 'kungsgård', 56.12732, 12.68896, ST_SetSRID(ST_MakePoint(12.68896,56.12732),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Horns Kungsgård', 'kungsgård', 57.1931, 16.9322, ST_SetSRID(ST_MakePoint(16.9322,57.1931),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Kungsbergs kungsgård', 'kungsgård', 59.43923, 16.93589, ST_SetSRID(ST_MakePoint(16.93589,59.43923),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Kungsgården Uranienborg', 'kungsgård', 55.90509, 12.69703, ST_SetSRID(ST_MakePoint(12.69703,55.90509),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Kungsladugården Biskopstorp', 'kungsgård', 56.761548, 12.848061, ST_SetSRID(ST_MakePoint(12.848061,56.761548),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Kungslena kungsgård', 'kungsgård', 58.22779, 13.80339, ST_SetSRID(ST_MakePoint(13.80339,58.22779),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Lillö kungsgård', 'kungsgård', 56.03415, 14.1186, ST_SetSRID(ST_MakePoint(14.1186,56.03415),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Lindhovs kungsgård', 'kungsgård', 57.142113, 12.26368, ST_SetSRID(ST_MakePoint(12.26368,57.142113),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Näs kungsgård', 'kungsgård', 60.37725, 16.05088889, ST_SetSRID(ST_MakePoint(16.05088889,60.37725),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Ottenby kungsgård', 'kungsgård', 56.23416667, 16.41055556, ST_SetSRID(ST_MakePoint(16.41055556,56.23416667),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Roma kungsgård', 'kungsgård', 57.516001, 18.458989, ST_SetSRID(ST_MakePoint(18.458989,57.516001),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Rävsnäs kungsgård', 'kungsgård', 59.30722222, 17.25, ST_SetSRID(ST_MakePoint(17.25,59.30722222),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Rönö kungsgård', 'kungsgård', 58.45081, 16.743189, ST_SetSRID(ST_MakePoint(16.743189,58.45081),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Sköldnora kungsgård', 'kungsgård', 59.49094444, 17.95927778, ST_SetSRID(ST_MakePoint(17.95927778,59.49094444),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Starby kungsgård', 'kungsgård', 58.440083333, 14.877583333, ST_SetSRID(ST_MakePoint(14.877583333,58.440083333),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Stora Kungsladugården', 'kungsgård', 58.74516944, 16.96928889, ST_SetSRID(ST_MakePoint(16.96928889,58.74516944),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Strömsholms kungsladugård', 'kungsgård', 59.51948877, 16.238771399, ST_SetSRID(ST_MakePoint(16.238771399,59.51948877),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Tomarps kungsgård', 'kungsgård', 56.1492, 13.0614, ST_SetSRID(ST_MakePoint(13.0614,56.1492),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Tuna kungsgård', 'kungsgård', 58.48029, 15.68241, ST_SetSRID(ST_MakePoint(15.68241,58.48029),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Vadstena kungsgård', 'kungsgård', 58.4513, 14.8911, ST_SetSRID(ST_MakePoint(14.8911,58.4513),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Väsby kungsgård', 'kungsgård', 59.92388889, 16.59277778, ST_SetSRID(ST_MakePoint(16.59277778,59.92388889),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Vättak Kungsgården', 'kungsgård', 58.0956, 13.8728, ST_SetSRID(ST_MakePoint(13.8728,58.0956),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable'),
  ('Åsklosters kungsgård', 'kungsgård', 57.22556389, 12.21966667, ST_SetSRID(ST_MakePoint(12.21966667,57.22556389),4326), 'Kungsgård/kungsladugård (Wikidata; ägande/tid + epok ej fastställt).', 'Wikidata', 'probable');
