-- SDHK 1233 (tryck DS 888), "efter 1283": prosten W på Öland kungör cathedraticum för Ölands kyrkor.
-- Brevet ger de LATINSKA MEDELTIDSFORMERNA för 34 öländska socknar/kyrkor — en PRIMÄRKÄLLA för äldsta
-- belägg (Isofs kort citerar ofta just DS 888). Daniel: "här har vi ju faktiskt äldre namn på dem."
--
-- KÄLLKRITIK — TIDIGAST ÖVER KÄLLOR: earliest_attestation_year = LEAST(befintligt, 1283). Där Isof redan
-- har ETT ÄLDRE år (t.ex. Kastlösa 1271, Ottenby 1279) behålls det året och dess form; charter-formen
-- skrivs bara när charter är tidigast-eller-lika (>=1283 eller tomt). Form + källa hör ihop med det år
-- som faktiskt är äldst. Latinsk form återgiven verbatim ur brevtexten (edition DS 888, PD).

with charter(modern, form) as (values
  ('Högby','høghaby'), ('Persnäs','pescnes'), ('Köping','køpunge'), ('Gärdslösa','gersløso'),
  ('Runsten','Runasteen'), ('Kastlösa','kasterløso'),
  ('Böda','bødhum'), ('Föra','fyrum'), ('Alböke','alboeke'), ('Bredsättra','brechaseche'),
  ('Långlöt','langaløøt'), ('Långnäs','langanæss'), ('Stenåsa','stenhusom'), ('Hulterstad','hulterstadhum'),
  ('Gräsgård','gresgardhe'), ('Möckleby','Myklaby'), ('Torslunda','thorslundom'), ('Algutsrum','asgustzrume'),
  ('Glömminge','gløminge'), ('Räpplinge','ræplinge'),
  ('Källa','keldo'), ('Löt','løøt'), ('Egby','ekby'), ('Sandby','sandby'), ('Segerstad','siexstadhum'),
  ('Ventlinge','wentlinge'), ('Smedby','smidhaby'), ('Mörbylånga','Myriby'), ('Resmo','rysme'),
  ('Vickleby','wekulby'), ('Högsrum','høsgrume'),
  ('Borg','borgh'), ('Gårdby','gorby'), ('Ås','aas')
)
update public.place_names p set
  attested_form = case when coalesce(p.earliest_attestation_year, 9999) >= 1283 then c.form else p.attested_form end,
  attestation_source = case when coalesce(p.earliest_attestation_year, 9999) >= 1283
      then 'SDHK 1233 (tryck DS 888), efter 1283 — prosten W:s cathedraticum-brev för Ölands kyrkor; latinsk form ur brevtexten'
      else p.attestation_source end,
  earliest_attestation_year = least(coalesce(p.earliest_attestation_year, 9999), 1283),
  updated_at = now()
from charter c
where p.lat between 56.18 and 57.40 and p.lng between 16.36 and 17.13
  and lower(p.name) = lower(c.modern);
