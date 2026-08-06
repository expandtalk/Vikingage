-- Faunahistoria per art: inhemsk / införd / invasiv, med belagd tidpunkt + källa.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
-- Kopplar an till jakt/djur-temat. Sökvolym ur Ahrefs (SE) — INGEN jägareförbundslänk.
-- Tidpunkter på århundradesnivå (belagt), inga gissade exakta årtal.
CREATE TABLE IF NOT EXISTS public.fauna_species (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_sv text NOT NULL,
  name_en text,
  scientific_name text,
  category text CHECK (category IN ('mammal','bird')),
  status text NOT NULL CHECK (status IN ('native','introduced','invasive','reintroduced','extirpated')),
  first_record_text text,
  origin text,
  hunting_group text CHECK (hunting_group IN ('skog','rovdjur','kust','fagel')),
  search_volume integer,
  source text,
  source_url text,
  license text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name_sv)
);
ALTER TABLE public.fauna_species ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fauna_species_read ON public.fauna_species;
CREATE POLICY fauna_species_read ON public.fauna_species FOR SELECT USING (true);
GRANT SELECT ON public.fauna_species TO anon, authenticated;

INSERT INTO public.fauna_species
  (name_sv, name_en, scientific_name, category, status, first_record_text, origin, hunting_group, search_volume, source, note)
VALUES
  ('Älg','Moose','Alces alces','mammal','native','förhistorisk tid',NULL,'skog',13000,'Artdatabanken (SLU)','Central bytesart genom hela förhistorien.'),
  ('Rådjur','Roe deer','Capreolus capreolus','mammal','native','förhistorisk tid (med senare svängningar)',NULL,'skog',13000,'Artdatabanken (SLU)','Nästan utrotad på 1800-talet, återhämtad 1900-tal.'),
  ('Vildsvin','Wild boar','Sus scrofa','mammal','reintroduced','inhemsk t.o.m. 1600-tal; åter frilevande sent 1900-tal',NULL,'skog',17000,'Artdatabanken (SLU)','Ursprungligen inhemsk, utrotad, åter etablerad ur hägn på 1970–80-talet.'),
  ('Räv','Red fox','Vulpes vulpes','mammal','native','förhistorisk tid',NULL,'skog',13000,'Artdatabanken (SLU)',NULL),
  ('Grävling','Badger','Meles meles','mammal','native','förhistorisk tid',NULL,'skog',24000,'Artdatabanken (SLU)',NULL),
  ('Utter','Otter','Lutra lutra','mammal','native','förhistorisk tid',NULL,'kust',23000,'Artdatabanken (SLU)','Kraftig nedgång 1900-tal, återhämtning senare.'),
  ('Skogsmård','Pine marten','Martes martes','mammal','native','förhistorisk tid',NULL,'skog',24000,'Artdatabanken (SLU)','Pälsdjur; mårdskinn viktig handelsvara under vikingatid/medeltid.'),
  ('Iller','European polecat','Mustela putorius','mammal','native','förhistorisk tid',NULL,'skog',22000,'Artdatabanken (SLU)',NULL),
  ('Hermelin','Stoat','Mustela erminea','mammal','native','förhistorisk tid',NULL,'skog',7900,'Artdatabanken (SLU)',NULL),
  ('Vessla','Least weasel','Mustela nivalis','mammal','native','förhistorisk tid',NULL,'skog',7300,'Artdatabanken (SLU)',NULL),
  ('Varg','Wolf','Canis lupus','mammal','native','förhistorisk tid',NULL,'rovdjur',19000,'Artdatabanken (SLU)','Hunden domesticerades ur vargen; nordiska spetsar är gamla jakthundstyper.'),
  ('Björn','Brown bear','Ursus arctos','mammal','native','förhistorisk tid',NULL,'rovdjur',9700,'Artdatabanken (SLU)',NULL),
  ('Lodjur','Lynx','Lynx lynx','mammal','native','förhistorisk tid',NULL,'rovdjur',11000,'Artdatabanken (SLU)',NULL),
  ('Järv','Wolverine','Gulo gulo','mammal','native','förhistorisk tid',NULL,'rovdjur',11000,'Artdatabanken (SLU)',NULL),
  ('Säl','Seal','Halichoerus/Phoca','mammal','native','förhistorisk tid',NULL,'kust',7000,'Artdatabanken (SLU)','Säljakt belagd från stenålder (t.ex. gropkeramisk kultur).'),
  ('Tjäder','Western capercaillie','Tetrao urogallus','bird','native','förhistorisk tid',NULL,'fagel',8400,'Artdatabanken (SLU)',NULL),
  ('Trana','Common crane','Grus grus','bird','native','förhistorisk tid',NULL,'fagel',15000,'Artdatabanken (SLU)',NULL),
  ('Havsörn','White-tailed eagle','Haliaeetus albicilla','bird','native','förhistorisk tid',NULL,'kust',12000,'Artdatabanken (SLU)',NULL),
  ('Storskarv','Great cormorant','Phalacrocorax carbo','bird','native','inhemsk; stark återetablering sent 1900-tal',NULL,'kust',11000,'Artdatabanken (SLU)','Underarten sinensis expanderade kraftigt i Sverige från 1980-talet.'),
  ('Fasan','Common pheasant','Phasianus colchicus','bird','introduced','utsatt från 1700-talet, frilevande 1800-tal','Kaukasus/Asien via Europa','fagel',6800,'Artdatabanken (SLU); Wikipedia','Införd för jakt; frilevande bestånd först på 1800-talet.'),
  ('Dovhjort','Fallow deer','Dama dama','mammal','introduced','sent 1500-tal','Medelhavsområdet/Mindre Asien','skog',7900,'Artdatabanken (SLU); Wikipedia','Införd till kungliga hägn (bl.a. Djurgården).'),
  ('Mufflon','Mouflon','Ovis musimon','mammal','introduced','1900-talet','Sardinien/Korsika','skog',8800,'Artdatabanken (SLU)','Införd som viltart i hägn/frilevande.'),
  ('Vildkanin','European rabbit','Oryctolagus cuniculus','mammal','introduced','förvildad 1900-tal','Iberiska halvön','skog',13000,'Artdatabanken (SLU)','Förvildade tamkaniner; lokala bestånd.'),
  ('Amerikansk mink','American mink','Neovison vison','mammal','invasive','rymningar från 1920–30-talet','Nordamerika','kust',16000,'Artdatabanken (SLU); Naturvårdsverket','Invasiv; härstammar från pälsfarmsrymlingar. Hot mot sjöfågel/utter.'),
  ('Mårdhund','Raccoon dog','Nyctereutes procyonoides','mammal','invasive','etablering sent 1900-/2000-tal','Östra Asien via Finland/Ryssland','skog',13000,'Naturvårdsverket; Jägareförbundets mårdhundsprojekt (fakta)','Invasiv främmande art under nationell bekämpning.')
ON CONFLICT (name_sv) DO NOTHING;
