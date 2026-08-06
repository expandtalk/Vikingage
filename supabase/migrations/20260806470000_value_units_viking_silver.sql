-- Vikingatida/medeltida värdeenheter för /prices-konverteraren. Gemensam nämnare = gram fint
-- silver (den vägda silverekonomin). Ratios BELAGDA (landskapslagar: 1 mark=8 öre=24 örtugar=
-- 192 penningar); absoluta gramvikter TROLIGA (varierade 24–26 g/öre; medeltida mark 210,6 g).
-- Källor: Stockholms universitet (runisk prisstudie), numismatisk standardlitteratur.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
CREATE TABLE IF NOT EXISTS public.value_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name_sv text NOT NULL,
  name_en text,
  category text NOT NULL,
  era text,
  silver_grams numeric,
  confidence text NOT NULL DEFAULT 'trolig',
  source text,
  note text,
  sort_order int NOT NULL DEFAULT 100
);
ALTER TABLE public.value_units ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY value_units_read ON public.value_units FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO public.value_units (key, name_sv, name_en, category, era, silver_grams, confidence, source, note, sort_order)
SELECT * FROM (VALUES
  ('mark',    'Mark',    'Mark',    'silver_weight', 'vikingatid–medeltid', 200.0, 'trolig',
    'Landskapslagar; Stockholms universitet (runisk prisstudie); numismatisk standard',
    'Räkne-/viktenhet = 8 öre = 24 örtugar = 192 penningar (belagt). Vikt ca 200 g fint silver; medeltida standardmark 210,6 g.', 10),
  ('ore',     'Öre',     'Öre (ounce)', 'silver_weight', 'vikingatid–medeltid', 25.0, 'trolig',
    'Stockholms universitet; so-rummet; numismatisk standard',
    '1 öre ≈ 25 g silver (vägdes på våg; varierade 24–26 g). 1 mark = 8 öre.', 20),
  ('ortug',   'Örtug',   'Örtug',   'silver_weight', 'vikingatid–medeltid', 8.33, 'trolig',
    'Landskapslagar; numismatisk standard',
    '1 örtug = 1/3 öre = 1/24 mark. Präglades som mynt först 1370 (ca 1,3 g, 81% silver).', 30),
  ('penning', 'Penning', 'Penny',   'silver_weight', 'vikingatid–medeltid', 1.04, 'trolig',
    'Landskapslagar; numismatisk standard',
    '1 penning = 1/8 örtug = 1/192 mark. Minsta enheten.', 40),
  ('dirham',  'Dirham',  'Dirham',  'coin', 'vikingatid (österled)', 3.0, 'trolig',
    'Skattfynd (islamiska silvermynt); numismatisk standard',
    'Islamiskt silvermynt, ~2,9–3,0 g. Infört via österledens handel; ofta klippt till hacksilver och vägt.', 50)
) AS v(key,name_sv,name_en,category,era,silver_grams,confidence,source,note,sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.value_units u WHERE u.key = v.key);
