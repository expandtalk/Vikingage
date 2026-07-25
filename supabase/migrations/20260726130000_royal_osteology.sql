-- Kunglig osteologi: utöka individ-modellen (genetic_individuals) med kroppslängd,
-- patologi, tandstatus, källa och koppling till regent (historical_kings). Lägg in
-- kända gravöppningar (Riddarholmskyrkan, Uppsala domkyrka; Varnhem finns) och
-- Karl Knutsson-piloten (Vretemarks osteologiska profil).
-- Princip: en individ = en nod (osteo/isotop/aDNA), se projektminne osteology-gis.

-- 1) Schema-utökning (additivt, idempotent).
ALTER TABLE public.genetic_individuals
  ADD COLUMN IF NOT EXISTS individual_label text,
  ADD COLUMN IF NOT EXISTS stature_cm numeric,
  ADD COLUMN IF NOT EXISTS pathology text,
  ADD COLUMN IF NOT EXISTS dental_status text,
  ADD COLUMN IF NOT EXISTS king_id uuid REFERENCES public.historical_kings(id),
  ADD COLUMN IF NOT EXISTS source text;

COMMENT ON COLUMN public.genetic_individuals.stature_cm IS 'Rekonstruerad kroppslängd (osteologisk skattning eller ur dräkt/rustning)';
COMMENT ON COLUMN public.genetic_individuals.pathology IS 'Osteologiska patologiska förändringar (artros, skador, läkta frakturer m.m.)';
COMMENT ON COLUMN public.genetic_individuals.king_id IS 'Länk till regent i historical_kings när individen är identifierad';

-- 2) Gravplatser (arkeologiska platser). geom sätts explicit (ej genererad kolumn).
INSERT INTO public.archaeological_sites (name, location, parish, county, country, coordinates, geom, period, burial_type, description)
SELECT 'Riddarholmskyrkan', 'Riddarholmen, Stockholm', 'Stockholm', 'Stockholm', 'Sweden',
       point(18.0646, 59.3247), ST_SetSRID(ST_MakePoint(18.0646, 59.3247), 4326), -- Nominatim-verifierad
       'Medeltid–nutid', 'kyrkograv/kungagravar',
       'Kunglig gravkyrka på Riddarholmen. Korgravarna grävdes ut 1915 (bl.a. Karl Knutssons skelett).'
WHERE NOT EXISTS (SELECT 1 FROM public.archaeological_sites WHERE name = 'Riddarholmskyrkan');

INSERT INTO public.archaeological_sites (name, location, parish, county, country, coordinates, geom, period, burial_type, description)
SELECT 'Uppsala domkyrka', 'Uppsala', 'Uppsala', 'Uppsala', 'Sweden',
       point(17.6336, 59.8582), ST_SetSRID(ST_MakePoint(17.6336, 59.8582), 4326), -- Nominatim-verifierad
       'Medeltid–nutid', 'kyrkograv/kungagravar',
       'Domkyrka med kungliga gravar, bl.a. Gustav Vasa (Vasakoret).'
WHERE NOT EXISTS (SELECT 1 FROM public.archaeological_sites WHERE name = 'Uppsala domkyrka');

-- 3) PILOT: Karl Knutsson (Bonde) — osteologisk profil (Maria Vretemark).
INSERT INTO public.genetic_individuals
  (sample_id, individual_label, king_id, site_id, archaeological_sex, age, stature_cm, pathology, dental_status,
   grave_number, burial_context, period_from, period_to, source)
SELECT
  'RIDD-korgraven-KarlKnutsson',
  'Karl Knutsson (Bonde) — korgraven, Riddarholmskyrkan',
  (SELECT id FROM public.historical_kings WHERE name ILIKE 'Karl Knutsson%' LIMIT 1),
  (SELECT id FROM public.archaeological_sites WHERE name = 'Riddarholmskyrkan' LIMIT 1),
  'male', '~60 år', 178,
  'Artros i halskotor och ländrygg samt i nyckelbenens leder mot skulderbladen (åldersrelaterat, sannolikt stel i nacken). Läkt skada i vänster fotled — flera små ben med spår av inflammatorisk process, sammansmälta.',
  'Förlorade visdomständer men i övrigt fullständig tanduppsättning (ovanligt för en så gammal person på medeltiden); slitna tänder utan karies.',
  'Korgraven (1915)',
  'Välbevarat skelett i träkista överst i korgraven; rester av begravningsdräkt, läderskor, pälshår från sobelbräm, frön och växtdelar från väldoftande örter — hög status, datering 1400-tal.',
  1409, 1470,
  'Osteologisk analys: Maria Vretemark. Utgrävning 1915. Ref: magnusladulas.blogg.se (2012).'
WHERE NOT EXISTS (
  SELECT 1 FROM public.genetic_individuals
  WHERE individual_label = 'Karl Knutsson (Bonde) — korgraven, Riddarholmskyrkan'
);
