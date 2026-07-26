-- Vreta klosterkyrka: två mycket långväxta män (1,98 & 2,02 m) funna i kyrkan.
-- Enligt tradition TROLIGEN kung Filip Halstensson (d. 1118) och hans bror Inge den
-- yngre (d. ~1125), Stenkilsätten — men attributionen är OSÄKER och vilket skelett
-- som är vem är okänt. Därför INGEN hård king_id-länk; osäkerheten står i kontexten.
-- Koordinat Nominatim-verifierad (58.4821, 15.5179).

INSERT INTO public.archaeological_sites (name, location, parish, county, country, coordinates, geom, period, burial_type, description)
SELECT 'Vreta klosterkyrka', 'Vreta kloster, Linköping', 'Vreta kloster', 'Östergötland', 'Sweden',
       point(15.5179, 58.4821), ST_SetSRID(ST_MakePoint(15.5179, 58.4821), 4326),
       'Medeltid', 'kyrkograv',
       'Klosterkyrka (grundad av Inge den äldre m.fl.). I kyrkan påträffades två mycket långväxta manliga skelett, enligt tradition troligen Stenkilsättens Filip och Inge den yngre.'
WHERE NOT EXISTS (SELECT 1 FROM public.archaeological_sites WHERE name = 'Vreta klosterkyrka');

INSERT INTO public.genetic_individuals
  (sample_id, individual_label, king_id, site_id, archaeological_sex, age, stature_cm,
   pathology, dental_status, grave_number, burial_context, period_from, period_to, source)
SELECT v.sample_id, v.label, NULL,
       (SELECT id FROM public.archaeological_sites s WHERE s.name = 'Vreta klosterkyrka' LIMIT 1),
       'male', NULL, v.stature, NULL, NULL, NULL,
       'En av två mycket långväxta män (1,98 och 2,02 m) funna i Vreta klosters kyrka. Enligt tradition TROLIGEN kung Filip Halstensson (d. 1118) och hans bror Inge den yngre (d. ca 1125), Stenkilsätten — men identifieringen är osäker och det är okänt vilket skelett som tillhör vem. Den ovanliga kroppslängden stämmer med uppgiften att Stenkilsätten var långväxt.',
       1100, 1125,
       'Wikipedia: Filip (kung) / Vreta klosters kyrka. Attribution osäker (ej DNA-bekräftad).'
FROM (VALUES
  ('VRETA-kyrka-A', 'Vreta klosterkyrka — långväxt man ~2,02 m (Stenkilsätten; möjligen Filip el. Inge d.y.)', 202::numeric),
  ('VRETA-kyrka-B', 'Vreta klosterkyrka — långväxt man ~1,98 m (Stenkilsätten; möjligen Filip el. Inge d.y.)', 198::numeric)
) AS v(sample_id, label, stature)
WHERE NOT EXISTS (SELECT 1 FROM public.genetic_individuals g WHERE g.sample_id = v.sample_id);
