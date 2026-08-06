-- 1) Snäckstaviken (Färjestaden, Öland) → place_names med snäck-led. Koord transformerad ur
--    Lantmäteriets SWEREF99TM-referens (approx vid viken). Hypotes om ledungshamn.
-- 2) medieval_castles: nytt lager för medeltidsborgar/riksborgar (skilt från fornborgar).
--    Namn/kategori/region ur Wikipedia-listan; KOORDINATER pending Wikidata-verifiering (ingen gissning).
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.

INSERT INTO public.place_names (name, lat, lng, element_keys, element_category, feature_type, source, attestation_source)
SELECT 'Snäckstaviken (Färjestaden)', 56.6698, 16.4410, ARRAY['snack'], 'power', 'vik',
  'Lantmäteriet (Färjestaden, Öland); läge approximativt (Lantmäteriet-referens vid viken)',
  'Snäck-namn — hypotes om ledungshamn vid Färjestaden (jfr I. Olsson 1972 om gotländska snäck-namn)'
WHERE NOT EXISTS (SELECT 1 FROM public.place_names p WHERE p.name = 'Snäckstaviken (Färjestaden)');

CREATE TABLE IF NOT EXISTS public.medieval_castles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  region text,
  country_now text,
  lat double precision,
  lng double precision,
  coord_status text NOT NULL DEFAULT 'pending',
  period text,
  source text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.medieval_castles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY medieval_castles_read ON public.medieval_castles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO public.medieval_castles (name, category, region, country_now, source, note)
SELECT v.name, v.category, v.region, v.country_now,
  'Wikipedia: Lista över borgar i Sverige och Finland (svagt källbelagd)', v.note
FROM (VALUES
  ('Slottet Tre Kronor','riksborg','Uppland','Sverige','kungamaktens borg (Stockholm)'),
  ('Kalmar slott','riksborg','Småland','Sverige',NULL),
  ('Gripsholms slott','riksborg','Södermanland','Sverige',NULL),
  ('Älvsborg','riksborg','Västergötland','Sverige',NULL),
  ('Borgholms slott','riksborg','Öland','Sverige',NULL),
  ('Kronobergs slott','riksborg','Småland','Sverige',NULL),
  ('Jönköpings slott','riksborg','Småland','Sverige',NULL),
  ('Näs slott','riksborg','Visingsö, Småland','Sverige','Sveriges äldsta riksborg (1100-tal)'),
  ('Vadstena slott','riksborg','Östergötland','Sverige',NULL),
  ('Linköpings slott','riksborg','Östergötland','Sverige',NULL),
  ('Stegeborgs slott','riksborg','Östergötland','Sverige',NULL),
  ('Johannisborg','riksborg','Östergötland','Sverige',NULL),
  ('Gälakvist','riksborg','Västergötland','Sverige',NULL),
  ('Skaraborg','riksborg','Västergötland','Sverige',NULL),
  ('Lödösehus','riksborg','Västergötland','Sverige',NULL),
  ('Örebro slott','riksborg','Närke','Sverige','Örebrohus'),
  ('Nyköpingshus','riksborg','Södermanland','Sverige',NULL),
  ('Alsnö hus','riksborg','Uppland','Sverige',NULL),
  ('Västerås slott','riksborg','Västmanland','Sverige',NULL),
  ('Uppsala slott','riksborg','Uppland','Sverige',NULL),
  ('Gävle slott','riksborg','Gästrikland','Sverige',NULL),
  ('Dalaborg','riksborg','Dalsland','Sverige',NULL),
  ('Borganäs','riksborg','Dalarna','Sverige',NULL),
  ('Falkenbergs slott','dansk_riksborg','Halland','Sverige',NULL),
  ('Helsingborgs slott (Kärnan)','dansk_riksborg','Skåne','Sverige','kärntorn; tidigast som trelleborg, sent 900-tal'),
  ('Landskrona citadell','dansk_riksborg','Skåne','Sverige',NULL),
  ('Malmöhus slott','dansk_riksborg','Skåne','Sverige',NULL),
  ('Sölvesborgs slott','dansk_riksborg','Blekinge','Sverige',NULL),
  ('Varbergs fästning','dansk_riksborg','Halland','Sverige',NULL),
  ('Bohus fästning','norsk','Bohuslän','Sverige',NULL),
  ('Kastelholms slott','finland','Åland','Finland',NULL),
  ('Korsholms slott','finland','Österbotten','Finland',NULL),
  ('Kustö biskopsborg','finland','Egentliga Finland','Finland',NULL),
  ('Olofsborg','finland','Savolax','Finland','Olavinlinna'),
  ('Raseborgs slott','finland','Nyland','Finland',NULL),
  ('Sibbesborg','finland','Nyland','Finland',NULL),
  ('Svartholms fästning','finland','Nyland','Finland',NULL),
  ('Sveaborg','finland','Nyland','Finland','Suomenlinna'),
  ('Tavastehus slott','finland','Tavastland','Finland','Häme'),
  ('Uleåborgs slott','finland','Österbotten','Finland','Oulu'),
  ('Kajaneborg','finland','Kajanaland','Finland',NULL),
  ('Braheslott','finland','Finland','Finland',NULL),
  ('Haga borg','finland','Nyland','Finland',NULL),
  ('Junkarsborg','finland','Nyland','Finland',NULL),
  ('Qvidja','finland','Egentliga Finland','Finland',NULL),
  ('Åbo slott','finland','Egentliga Finland','Finland','Turku'),
  ('Kexholm','ryssland','Karelen','Ryssland','Priozersk'),
  ('Viborgs slott','ryssland','Karelen','Ryssland','Vyborg')
) AS v(name, category, region, country_now, note)
WHERE NOT EXISTS (SELECT 1 FROM public.medieval_castles m WHERE m.name = v.name);
