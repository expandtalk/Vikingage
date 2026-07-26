-- Två DNA/osteologi-identifierade individer (Norge) → genetic_individuals, som Stora Karlsö.
-- Gokstadmannen (ID via ANTROPOLOGI, ej DNA) + Brunnmannen ur Sverres saga (ID via DNA ur tand).

-- Platser
INSERT INTO public.archaeological_sites (name, location, parish, county, country, coordinates, geom, period, dating, burial_type, description)
SELECT 'Gokstadhaugen', 'Gokstad, Sandefjord', NULL, 'Vestfold', 'Norway', point(10.2246,59.0885),
  ST_SetSRID(ST_MakePoint(10.2246,59.0885),4326), 'Vikingatid', 'ca 900 e.Kr.', 'skeppsgrav (hög)',
  'Vikingatida skeppsgrav (Gokstadskeppet, dendro ~890). Gravkammare med en kraftig man; en av de rikaste vikingaskeppsgravarna.'
WHERE NOT EXISTS (SELECT 1 FROM public.archaeological_sites WHERE name='Gokstadhaugen');

INSERT INTO public.archaeological_sites (name, location, parish, county, country, coordinates, geom, period, dating, burial_type, description)
SELECT 'Sverresborg (Trondheim)', 'Sverresborg, Trondheim', NULL, 'Trøndelag', 'Norway', point(10.3630,63.4130),
  ST_SetSRID(ST_MakePoint(10.3630,63.4130),4326), 'Medeltid', '1197', 'brunn (stupad vid belägring)',
  'Kung Sverres borg; belägrad 1197 (Kung Sverres saga). Skelett i brunnen ("Brunnmannen").'
WHERE NOT EXISTS (SELECT 1 FROM public.archaeological_sites WHERE name='Sverresborg (Trondheim)');

-- Gokstadmannen
INSERT INTO public.genetic_individuals
  (site_id, sample_id, individual_label, genetic_sex, age, period_from, period_to, stature_cm, ancestry, burial_context, source)
SELECT (SELECT id FROM public.archaeological_sites WHERE name='Gokstadhaugen' LIMIT 1),
  'Gokstadmannen', 'Gokstadmannen', 'XY', '40–50 år', 890, 910, 182, NULL,
  'Kraftigt byggd man, 181–183 cm, i skeppsgravens gravkammare. Föreslagen hövding/kung (ev. Olav Gudrødsson) men OSÄKERT. Identifiering via ANTROPOLOGI, ej DNA (inga publika stora DNA-analyser, till skillnad från Oseberg-kvinnorna).',
  'Gokstad-utgrävningen (Nicolaysen 1882); senare osteologiska analyser'
WHERE NOT EXISTS (SELECT 1 FROM public.genetic_individuals WHERE sample_id='Gokstadmannen');

-- Brunnmannen (Sverres saga)
INSERT INTO public.genetic_individuals
  (site_id, sample_id, individual_label, genetic_sex, age, period_from, period_to, radiocarbon, ancestry, burial_context, source)
SELECT (SELECT id FROM public.archaeological_sites WHERE name='Sverresborg (Trondheim)' LIMIT 1),
  'Brunnmannen', 'Brunnmannen (Sverres saga)', 'XY', '30–40 år', 1190, 1200,
  'C14 bekräftar tiden då Sverres saga skrevs (~1197)',
  '{"ursprung": "Agder (sydvästra Norge)", "fenotyp": "blont hår, blå ögon, ljus hudton"}'::jsonb,
  'Kastad i brunnen vid belägringen av Sverresborg 1197 (Kung Sverres saga). Skelett funnet 1938 (ej upptaget), återfunnet 2014/2018. DNA gick EJ ur benen (tomma) → extraherat ur en TAND (som förstördes). Första gången en person ur en nordisk saga identifierats via DNA.',
  'Petersen et al. / NIKU 2024; Kung Sverres saga'
WHERE NOT EXISTS (SELECT 1 FROM public.genetic_individuals WHERE sample_id='Brunnmannen');
