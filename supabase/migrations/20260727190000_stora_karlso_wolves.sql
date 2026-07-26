-- Stora Karlsö-vargarna (Stora Förvar-grottan). Två canider med vargavstamning UTAN
-- hundinblandning, på en ö utan endemiska landdäggdjur → införda av människor; låg
-- heterozygositet + marin diet + liten storlek → trolig mänsklig kontroll (incipient
-- domesticering?). Källa: Girdland-Flink et al. 2025, PNAS 122(48):e2421759122.

-- 1) Plats (grottboplats på Stora Karlsö, Eksta sn, Gotland).
INSERT INTO public.archaeological_sites
  (name, location, parish, county, country, coordinates, geom, period, dating, burial_type, description)
SELECT 'Stora Förvar (Stora Karlsö)', 'Stora Karlsö, Östersjön (~5 km V om Gotland)',
  'Eksta', 'Gotland', 'Sweden', point(17.965, 57.285),
  ST_SetSRID(ST_MakePoint(17.965, 57.285), 4326),
  'Neolitikum–bronsålder', '~4800–3100 f.n.', 'grotta (antropogena kulturlager)',
  'Grottboplats på 2,5 km² kalkstensö väster om Gotland, aldrig landförbunden → inga endemiska landdäggdjur; all fauna införd av människor. ~8000 år kulturlager, dominerade av säl (säljakt, fågelfångst, fiske).'
WHERE NOT EXISTS (SELECT 1 FROM public.archaeological_sites WHERE name = 'Stora Förvar (Stora Karlsö)');

-- 2) Individ G.7 — mellanneolitikum, juvenil.
INSERT INTO public.genetic_individuals
  (site_id, sample_id, individual_label, genetic_sex, age, radiocarbon, period_from, period_to,
   ancestry, isotopes, burial_context, museums_inventory, source)
SELECT (SELECT id FROM public.archaeological_sites WHERE name='Stora Förvar (Stora Karlsö)' LIMIT 1),
  'G.7', 'Stora Förvar G.7 (varg)', NULL, 'juvenil',
  '4290±30 BP (Beta-440526); 4804–4601 cal BP / 2860–2640 f.Kr. (marin reservoarkorr. 162±30)',
  -2860, -2640,
  '{"grey_wolf": 100}'::jsonb,
  '{"d13C": -14.1, "d15N": 11.0, "diet": "marin, lågtrofisk (fisk)"}'::jsonb,
  'Metapodier, juvenil. Vargavstamning, ingen signifikant hundinblandning (enkälls-qpAdm mot Alvastra-varg ~5100 f.n.). Marin lågtrofisk diet (fisk) → trolig människoberoende resurstillgång. Ö utan landdäggdjur → införd av människor.',
  'Statens historiska museer (Stora Förvar, sekt. G.7)',
  'Girdland-Flink et al. 2025, PNAS 122(48):e2421759122'
WHERE NOT EXISTS (SELECT 1 FROM public.genetic_individuals WHERE sample_id='G.7'
  AND site_id=(SELECT id FROM public.archaeological_sites WHERE name='Stora Förvar (Stora Karlsö)' LIMIT 1));

-- 3) Individ G.11 — bronsålder, adult hona, lägst heterozygositet av 72 fornvargar.
INSERT INTO public.genetic_individuals
  (site_id, sample_id, individual_label, genetic_sex, age, radiocarbon, period_from, period_to,
   ancestry, isotopes, pathology, stature_cm, burial_context, museums_inventory, source)
SELECT (SELECT id FROM public.archaeological_sites WHERE name='Stora Förvar (Stora Karlsö)' LIMIT 1),
  'G.11', 'Stora Förvar G.11 (varg, hona)', 'XX', 'adult',
  '3140±30 BP (Beta-440525); 3304–3094 cal BP / 1360–1140 f.Kr.',
  -1360, -1140,
  '{"grey_wolf": 100}'::jsonb,
  '{"d13C": -17.2, "d15N": 13.0, "diet": "blandad terrestrisk + marin"}'::jsonb,
  'Patologiska lesioner i distala humerus (olecranongropen) — långvarigt, sannolikt nedsatt rörlighet.',
  NULL,
  'Distal humerus, adult hona. Vargavstamning utan hundinblandning (qpAdm P=0.37). LÄGST heterozygositet av 72 fornvargsgenom (jämförbar med hund → inavel/isolering, förenligt med flergenerations reproduktionskontroll). Liten storlek (humerus Bd 40,5 mm, nedre kanten av vargvariation). Trolig mänsklig kontroll.',
  'Statens historiska museer (Stora Förvar, sekt. G.11)',
  'Girdland-Flink et al. 2025, PNAS 122(48):e2421759122'
WHERE NOT EXISTS (SELECT 1 FROM public.genetic_individuals WHERE sample_id='G.11'
  AND site_id=(SELECT id FROM public.archaeological_sites WHERE name='Stora Förvar (Stora Karlsö)' LIMIT 1));

-- 4) Strukturerade isotopvärden (osteolog-lins). δ13C + δ15N per individ.
INSERT INTO public.isotope_measurements (individual_id, system, value, unit, tissue, method, lab, source, note)
SELECT gi.id, m.system, m.value, '‰', 'benkollagen', 'AMS/IRMS', 'Beta Analytic',
       'Girdland-Flink et al. 2025, PNAS', m.note
FROM public.genetic_individuals gi
JOIN (VALUES
  ('G.7', 'δ13C', -14.1, 'marin diet'),
  ('G.7', 'δ15N', 11.0, 'lågtrofisk (fisk)'),
  ('G.11','δ13C', -17.2, 'blandad diet'),
  ('G.11','δ15N', 13.0, 'blandad terrestrisk+marin')
) AS m(sample_id, system, value, note) ON m.sample_id = gi.sample_id
WHERE gi.site_id=(SELECT id FROM public.archaeological_sites WHERE name='Stora Förvar (Stora Karlsö)' LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM public.isotope_measurements im WHERE im.individual_id=gi.id AND im.system=m.system);
