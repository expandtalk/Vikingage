-- Hallands kulturhistoriska museum (institution) + Getakärr myntskatt. Fyller Halland-luckan i
-- museums (0 museer i Halland). Fakta ur museets egna sidor/DigitaltMuseum, i egna ord. Koordinater
-- DB-verifierade: Varbergs fästning (place_names 57.1064,12.2379), Getakärrs kyrkoruin (heritage/
-- eccl 57.1125,12.2531 — RAÄ). INGEN bild rehostas (DigitaltMuseum per-objekt-licens) → länk ut.

-- 1) Museet som institution.
insert into public.museums (name, name_en, museum_type, website, city, county, landscape, lat, lng, description, operator, source, source_url, verified)
select
  'Hallands kulturhistoriska museum', 'Halland Museum of Cultural History',
  'kulturhistoriskt länsmuseum',
  'https://museumhalland.se', 'Varberg', 'Halland', 'Halland',
  57.1064, 12.2379,
  'Länsmuseum för Halland, beläget högst upp i den medeltida borgen på Varbergs fästning. Grundat 1916; '
  || 'samlingarna skildrar det halländska kulturarvet från förhistorisk tid till idag och omfattar bl.a. '
  || 'Bockstensmannen, fynd från den medeltida handelsstaden Getakärr och myntskatten från Getakärrs '
  || 'kyrkoruin. Samlingarna tillhör Stiftelsen Hallands länsmuseer (där även Hallands konstmuseum i '
  || 'Halmstad ingår). Föremåls- och fotosamlingar publiceras på DigitaltMuseum (ägarsignatur S-HKM). '
  || 'Kulturmiljö Halland, museets uppdragsverksamhet, utför arkeologiska och bebyggelseantikvariska uppdrag.',
  'Stiftelsen Hallands länsmuseer',
  'Hallands kulturhistoriska museum (museumhalland.se; DigitaltMuseum S-HKM)',
  'https://digitaltmuseum.se/owners/S-HKM', true
where not exists (select 1 from public.museums m where m.name = 'Hallands kulturhistoriska museum');

-- 2) Getakärr myntskatt (Getakärrs kyrkoruin, Varberg). Fakta: ~1000+ mynt ur 1930-talsutgrävningarna
--    av kyrkoruinen i den medeltida handelsstaden Getakärr (Varbergs föregångare); visar myntcirkulationen
--    i en medeltida handelsstad. Koordinat = Getakärrs kyrkoruin (RAÄ-verifierad).
insert into public.hoards (name, find_place, parish, landscape, coordinates, discovery_year, n_coins, dominant_metal, numismatic_phase, significance, description, sources, source_uri)
select
  'Getakärr myntskatt (Getakärrs kyrkoruin)', 'Getakärrs kyrkoruin, Varberg', 'Varberg', 'Halland',
  '(12.2531,57.1125)'::point, 1930, 1000, 'silver', 'medeltida',
  'Myntfynd ur en medeltida handelsstad (Getakärr, Varbergs föregångare) — belyser myntcirkulationen i stadsmiljö.',
  'Samling med drygt tusen mynt ur utgrävningarna av Getakärrs kyrkoruin i Varberg på 1930-talet. Getakärr '
  || 'var den medeltida handelsstad som föregick nuvarande Varberg. Fynden speglar myntcirkulationen i en '
  || 'medeltida handelsstad. Antalet anges av museet som drygt 1 000 mynt (n_coins här satt till 1000 som '
  || 'nedre uppskattning — exakt antal kräver verifiering mot museets katalog). Föremålen förvaras vid '
  || 'Hallands kulturhistoriska museum. Fakta återgivet i egna ord; bilder rehostas ej (DigitaltMuseum-licens) — länk ut.',
  'Hallands kulturhistoriska museum; DigitaltMuseum samling "Myntfynden - Getakärrs kyrkoruin" (S-HKM)',
  'https://digitaltmuseum.se/0210915698253/myntfynden-getakarrs-kyrkoruin'
where not exists (select 1 from public.hoards h where h.name = 'Getakärr myntskatt (Getakärrs kyrkoruin)');
