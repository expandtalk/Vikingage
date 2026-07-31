-- Central-place-fingerprint: feature-vektor per centralplats så noder kan jämföras
-- KVANTITATIVT (inte bara beskrivas). Samma metod som fornborg-/maritim-fingerprint.
-- "Vikingastad" är inte en sak — kind spänner kult-centralplats → emporium → köping →
-- hamn → decentraliserat nät. sample_pct gör Stolpes urvals-begränsning explicit i st.f. dold.
-- region_solidi = folkvandringstida guld (SHM), ett ÄLDRE rikedomslager: visar tyngdpunkts-
-- förskjutningen (Öland/Gotland hade guldet, men emporiet blev Mälaren/Birka).
CREATE TABLE IF NOT EXISTS central_place_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind text NOT NULL,                 -- emporium | cult_central | koping | harbour | region_network | town
  region text, country text,
  lat double precision, lng double precision,
  period_start int, period_end int,
  graves_total int, graves_excavated int,
  sample_pct numeric,                 -- andel gravar/yta undersökt (Stolpe-effekten explicit)
  silver_hoards int,                  -- vikingatida silverskatter
  region_solidi int,                  -- folkvandringstida solidi i landskapet (äldre guldlager)
  black_earth_ha numeric,             -- bosättnings-/svartjordsyta
  has_harbour boolean, has_mint boolean,
  runestones int,
  cult_evidence text, imports text, successor text,
  sample_note text, significance text,
  solidi_landscape text,              -- join-nyckel mot solidi.landscape
  source text, confidence text,
  geom geometry(Point,4326) GENERATED ALWAYS AS (
    CASE WHEN lng IS NOT NULL AND lat IS NOT NULL
         THEN ST_SetSRID(ST_MakePoint(lng,lat),4326) END) STORED,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE central_place_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS central_places_read ON central_place_profiles;
CREATE POLICY central_places_read ON central_place_profiles FOR SELECT USING (true);

INSERT INTO central_place_profiles
 (name, kind, region, country, lat, lng, period_start, period_end, graves_total, graves_excavated, sample_pct,
  silver_hoards, black_earth_ha, has_harbour, has_mint, runestones, cult_evidence, imports, successor,
  sample_note, significance, solidi_landscape, source, confidence)
VALUES
 ('Birka','emporium','Uppland','Sweden',59.3360,17.5420,750,975,3000,1100,37,
   NULL,7,true,true,NULL,NULL,'Dorestad, frankiskt, orientaliskt (silver, siden)','Sigtuna',
   '~7 % av Svarta jorden + 1100/3000 gravar grävda (Stolpe 1871–95); stratigrafi svagt dokumenterad',
   'Kungligt Mälar-emporium, Ansgars mission 829; medveten omflyttning till Sigtuna ~970','Uppland',
   'Gräslund 1980; Ambrosiani; SBL (Stolpe)','litteratur'),
 ('Sigtuna','town','Uppland','Sweden',59.6170,17.7230,980,1200,NULL,NULL,NULL,
   NULL,NULL,true,true,NULL,NULL,'frankiskt, tyskt','—',
   'Planerad efterträdare till Birka','Kristen kungastad, Sveriges första myntort (Olof Skötkonung ~995)','Uppland',
   'litteratur','litteratur'),
 ('Uppåkra','cult_central','Skåne','Sweden',55.6600,13.1700,-100,1000,NULL,NULL,NULL,
   NULL,40,false,false,NULL,'kulthus, guldgubbar, vapendepåer (Larsson)','romerskt, frankiskt','Lund',
   'Metalldetektor-baserat; endast ringa yta utgrävd av ~40 ha','Lång-duration (~1100 år) inlands-kult/aristokraticentrum, föregångare till Lund','Skåne',
   'L. Larsson; Uppåkra-projektet','litteratur'),
 ('Köpingsvik','koping','Öland','Sweden',56.8850,16.7270,800,1200,NULL,NULL,NULL,
   NULL,NULL,true,false,89,NULL,'orientaliskt (via Öland)','—',
   'Runstensdominans: 89 av Ölands ~190 inom 4 km','Regional köping, långlivad, handel utan kungligt monopol','Öland',
   'Öland-modellen; Fornsök','ungefärlig'),
 ('Hedeby','emporium','Schleswig','Denmark',54.4910,9.5650,770,1066,NULL,NULL,NULL,
   NULL,24,true,true,NULL,NULL,'frankiskt, orientaliskt, frisiskt','Schleswig',
   'Delvis utgrävt; halvcirkelvall + hamn','Nordsjö–Östersjö-gångjärnet, den södra tvillingen till Birka','Skåne',
   'litteratur','litteratur'),
 ('Gotland (nätverk)','region_network','Gotland','Sweden',57.5000,18.5000,700,1150,NULL,NULL,NULL,
   700,NULL,true,false,NULL,NULL,'orientaliskt (störst silverimport i Norden)','—',
   'Paviken/Västergarn som hamnar; ingen enskild huvudort','Decentraliserad silverskatt-ekonomi — flest vikingatida skatter i Norden, men ingen Birka','Gotland',
   'SHM; Östergren','litteratur'),
 ('Söderköping','koping','Östergötland','Sweden',58.4800,16.3250,1000,1600,NULL,NULL,NULL,
   NULL,NULL,true,true,NULL,NULL,'tyskt (Hansa), frisiskt','—',
   'Vikingatida föregångare OMDISKUTERAD — ingen fast belagd ort (jfr Birka→Sigtuna som är säker). Del av "var låg Ansgars Birka"-debatten',
   'Medeltida Hansa-köpstad vid Slätbaken, Östergötlands utskeppningshamn','Östergötland',
   'litteratur (föregångare omtvistad)','omdiskuterad');

-- Solidus-koppling: folkvandringstida guld per landskap ur solidi-corpuset (äldre lager).
UPDATE central_place_profiles cp SET region_solidi = s.n
  FROM (SELECT landscape, count(*) n FROM solidi WHERE landscape IS NOT NULL GROUP BY landscape) s
 WHERE lower(cp.solidi_landscape) = lower(s.landscape);

NOTIFY pgrst, 'reload schema';
