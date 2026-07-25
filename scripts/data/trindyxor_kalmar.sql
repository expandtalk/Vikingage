-- Trindyxor (neolitiska stenyxor) ur Kalmar läns museum (DigitaltMuseum), Norra Möre.
-- Källa: Kalmar stads historia + Kalmar läns museum / DigitaltMuseum. Koord på sockennivå.
-- geom är genererad kolumn (ur lat/lng) → sätts ej.
BEGIN;
INSERT INTO public.heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, period, description, source_uri)
SELECT 'trindyxa', 'Trindyxa (KLM 3702)', 'Småland', 'Kalmar', 'Ryssby', 56.8043, 16.3491, 'neolitikum',
  'Trindyxa, stenyxa utan skafthål, 12,5 cm. Funnen i Ryssby socken, Norra Möre. Godsägare C. J. Ekerots samling, inköpt 1891. Kalmar läns museum. Koord på sockennivå (Rockneby).',
  'https://digitaltmuseum.se/021029683908'
WHERE NOT EXISTS (SELECT 1 FROM public.heritage_sites WHERE source_uri='https://digitaltmuseum.se/021029683908');

INSERT INTO public.heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, period, description, source_uri)
SELECT 'trindyxa', 'Trindyxa (KLM 6860)', 'Småland', 'Kalmar', 'Åby', 56.7808, 16.2872, 'neolitikum',
  'Trindyxa med oval genomskärning och omslipad egg, 12 cm. Funnen i Åby, Åby socken, Norra Möre. Tidigare ägare Pikedala, Ryssby. Inköpt 1909. Kalmar läns museum. Koord = Åby sockencentrum.',
  'https://digitaltmuseum.se/0210214169206'
WHERE NOT EXISTS (SELECT 1 FROM public.heritage_sites WHERE source_uri='https://digitaltmuseum.se/0210214169206');
COMMIT;
