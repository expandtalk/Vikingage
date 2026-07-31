-- Museidomän: se vilka museer som finns i närheten + deras aktiviteter. POI med praktisk info
-- (webbplats, telefon, adress, öppettider), viktiga sidor, events (aktiviteter, kopplar
-- säsongslagret) och geo. Kopplas in i nearby_features_ranked som feature_type 'museum'.
-- Praktisk info som telefon/öppettider seedas EJ (hittar ej på) — ingestas från källa.
CREATE TABLE IF NOT EXISTS museums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, name_en text,
  museum_type text,              -- läns | riks | arkeologi | friluft | fartyg | konst | lokal
  website text, domain text, phone text, email text,
  address text, postal_code text, city text, county text, landscape text,
  lat double precision, lng double precision,
  opening_hours jsonb, opening_hours_note text, admission text,
  key_pages jsonb,               -- [{label,url}] viktiga sidor
  description text, operator text,
  source text, source_url text, verified boolean DEFAULT false,
  geom geometry(Point,4326) GENERATED ALWAYS AS (
    CASE WHEN lng IS NOT NULL AND lat IS NOT NULL THEN ST_SetSRID(ST_MakePoint(lng,lat),4326) END) STORED,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS museum_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id uuid REFERENCES museums(id) ON DELETE CASCADE,
  title text NOT NULL, start_date date, end_date date,
  recurring text,                -- t.ex. 'sommar' | 'midsommar' | 'årlig'
  description text, url text, source text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE museums ENABLE ROW LEVEL SECURITY;
ALTER TABLE museum_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS museums_read ON museums; CREATE POLICY museums_read ON museums FOR SELECT USING (true);
DROP POLICY IF EXISTS museum_events_read ON museum_events; CREATE POLICY museum_events_read ON museum_events FOR SELECT USING (true);

-- Seed: kuraterade museer relevanta för plattformen (namn/webbplats/typ verifierade;
-- koordinater ungefärliga på ort-/adressnivå → verified=false tills exakt + öppettider ingestats).
INSERT INTO museums (name, museum_type, website, domain, city, county, landscape, lat, lng, description, source, verified) VALUES
 ('Kalmar läns museum','läns','https://www.kalmarlansmuseum.se','kalmarlansmuseum.se','Kalmar','Kalmar','Småland',56.6603,16.3670,'Länsmuseum, bl.a. regalskeppet Kronan.','kurerad',false),
 ('Historiska museet (Statens historiska museum)','riks','https://historiska.se','historiska.se','Stockholm','Stockholm','Uppland',59.3352,18.0930,'Sveriges historia; guld- och vikingasamlingar (SHM).','kurerad',false),
 ('Gotlands Museum','läns','https://www.gotlandsmuseum.se','gotlandsmuseum.se','Visby','Gotland','Gotland',57.6390,18.2940,'Bildstenar, silverskatter, medeltida Visby.','kurerad',false),
 ('Ölands museum Himmelsberga','friluft','https://www.olandsmuseum.se','olandsmuseum.se','Borgholm','Kalmar','Öland',56.6860,16.7350,'Friluftsmuseum, öländsk bygd.','kurerad',false),
 ('Foteviken Museum','friluft','https://www.foteviken.se','foteviken.se','Höllviken','Skåne','Skåne',55.3990,12.9490,'Vikingareservat, rekonstruerad handelsstad.','kurerad',false),
 ('Birka Vikingastaden','arkeologi','https://www.raa.se/birka','raa.se','Björkö','Stockholm','Uppland',59.3360,17.5420,'Museum vid Birka på Björkö (SHM/RAÄ).','kurerad',false),
 ('Uppåkra Arkeologiska Center','arkeologi','https://www.uppakra.se','uppakra.se','Staffanstorp','Skåne','Skåne',55.6580,13.1710,'Järnålderns centralplats, kulthus.','kurerad',false),
 ('Vikingamuseet','lokal','https://www.vikingamuseet.se','vikingamuseet.se','Stockholm','Stockholm','Uppland',59.3270,18.0980,'Vikingatidens Stockholm.','kurerad',false),
 ('Upplandsmuseet','läns','https://www.upplandsmuseet.se','upplandsmuseet.se','Uppsala','Uppsala','Uppland',59.8570,17.6380,'Upplands läns museum.','kurerad',false),
 ('Vasamuseet (Statens maritima museer)','fartyg','https://www.vasamuseet.se','vasamuseet.se','Stockholm','Stockholm','Uppland',59.3280,18.0915,'Regalskeppet Vasa.','kurerad',false),
 ('Lödöse museum','lokal','https://www.vastarvet.se/lodose','vastarvet.se','Lödöse','Västra Götaland','Västergötland',58.0300,12.1500,'Medeltidsstaden Lödöse.','kurerad',false),
 ('Trelleborgen','arkeologi','https://www.trelleborg.se/trelleborgen','trelleborg.se','Trelleborg','Skåne','Skåne',55.3750,13.1570,'Rekonstruerad vikingaborg.','kurerad',false),
 ('Eketorps borg','arkeologi','https://historiska.se/eketorp','historiska.se','Mörbylånga','Kalmar','Öland',56.2900,16.5000,'Rekonstruerad ölandsk fornborg.','kurerad',false),
 ('Blekinge museum','läns','https://www.blekingemuseum.se','blekingemuseum.se','Karlskrona','Blekinge','Blekinge',56.1610,15.5900,'Blekinges läns museum.','kurerad',false),
 ('Murberget Länsmuseet Västernorrland','läns','https://www.murberget.se','murberget.se','Härnösand','Västernorrland','Ångermanland',62.6350,17.9450,'Länsmuseum, friluftsmuseum.','kurerad',false);

-- Museer som sevärdheter i rank-signalerna.
INSERT INTO place_signals (entity_type, entity_id, signal, value, source)
  SELECT 'museum', id::text, 'sight', 1.0, 'museum' FROM museums
ON CONFLICT (entity_type, entity_id, signal) DO NOTHING;

NOTIFY pgrst, 'reload schema';
