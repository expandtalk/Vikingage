-- (1) fort_function='production' där fyndlagret visar produktion (Broborg glas, Gåseborg brons) — evidensbaserat.
-- (2) Öland-solidi reconcile: 547 (regionaggregat, ej källverifierat) märks mot publicerat ~360 katalogiserade.
-- (3) Dackefejden: Kronobergs slott (saknades) + Voxtorp-not + tema.

UPDATE swedish_hillforts h SET fort_function='production'
 WHERE fort_function IS NULL
   AND EXISTS (SELECT 1 FROM fortification_finds f WHERE f.fortification_id=h.id AND f.find_type='production');

UPDATE central_place_profiles
   SET source = 'Solidi-antal omdiskuterat: minst ~360 katalogiserade solidi från Öland (publicerat — fler än någon annan region; Fischer/Herschend, Antiquity 2018 Sandby borg). 547 här = bredare/äldre regionaggregat, EJ källverifierat — stäm av mot SHM/Fischers katalog.',
       confidence = 'low'
 WHERE solidi_landscape='Öland' AND region_solidi=547;

INSERT INTO heritage_sites (name, raa_type, register_system, municipality, parish, landscape, period, lat, lng, description, source_uri, evidence_class)
SELECT 'Kronobergs slott','Borg/slottslämning','RAÄ','Växjö','Växjö','Småland','medeltid',56.94194,14.79444,
  'Medeltida borg på en holme i Helgasjön norr om Växjö, ärkebiskoparnas i Växjö stift. Under Dackefejden intog Nils Dacke slottet 1542 och styrde det upproriska Småland därifrån; upproret krossades 1543, varefter Gustav Vasa byggde ut Kronoberg till befäst renässansslott. Källa: sv.wikipedia (CC BY-SA).',
  'https://sv.wikipedia.org/wiki/Kronobergs_slott','documented'
WHERE NOT EXISTS (SELECT 1 FROM heritage_sites WHERE name='Kronobergs slott' AND lat BETWEEN 56.93 AND 56.95);

UPDATE ecclesiastical_sites
   SET historical_notes = coalesce(historical_notes||' ','') || 'Dackefejden bröt ut i Voxtorps socken vid midsommar 1542, då Nils Dackes folk överföll fogdegården och dödade två fogdar — upprorets första väpnade dåd.'
 WHERE name='Voxtorps kyrka' AND lat BETWEEN 56.53 AND 56.54
   AND (historical_notes IS NULL OR historical_notes NOT LIKE '%Dackefejden%');

INSERT INTO themes (name, name_en, description, description_en, slug)
SELECT 'Dackefejden (1542–43)','The Dacke War (1542–43)',
  'Bondeupproret 1542–43 under Nils Dacke mot Gustav Vasa i Småland. Startade med överfallet på fogdegården i Voxtorps socken (midsommar 1542, två fogdar dödade). Dacke intog Kronobergs slott 1542 och styrde Småland därifrån; upproret krossades 1543.',
  'The 1542–43 peasant rebellion under Nils Dacke against Gustav Vasa in Småland; it began at Voxtorp parish (midsummer 1542) and Dacke ruled from Kronoberg Castle until crushed in 1543.',
  'dackefejden'
WHERE NOT EXISTS (SELECT 1 FROM themes WHERE slug='dackefejden');
