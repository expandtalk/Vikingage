-- Enrichment: Birger jarls grav-symboler (ring + porträttrelief) — "fingerprint"-element
-- (plats + längd + gravutformning + symboler). Landeskrone (Gotland) där Erik av
-- Mecklenburg dog 1397 — koordinat ur källan (57.39773, 18.17393), ej gissad.
-- Fyllig Varnhem-beskrivning (fyra kungar, drottning, hertig, riksjarl, rikskansler).

-- 1) Birger jarl: ringen (grave_goods) + porträttreliefen (burial_context).
UPDATE public.genetic_individuals SET
  grave_goods = ARRAY[
    'Fingerring av silverblandat guld (funnen vid gravöppningen 1920). Osliten → sannolikt tillverkad för begravningen; storleken visar att den tillhört en av männen i graven. Utställd (kopia) på Västergötlands museum.'
  ],
  burial_context = burial_context ||
    ' Ett stenporträtt (relief) av Birger sitter på en pelare i kyrkan — Sveriges FÖRSTA kända avbildning av en historisk person, sannolikt hugget under hans livstid. Vid gravöppningen 2002 visade sig reliefen vara porträttlik mot kraniet.'
WHERE sample_id = 'VARNHEM-BirgerJarl';

-- 2) Landeskrone — medeltida fäste vid Klintehamn där tronpretendenten Erik av
--    Mecklenburg (son till kung Albrekt) dog i pesten sommaren 1397.
INSERT INTO public.archaeological_sites (name, location, parish, county, country, coordinates, geom, period, burial_type, description)
SELECT 'Landeskrone (Klintehamn)', 'Klintehamn, Gotland', 'Klinte', 'Gotland', 'Sweden',
       point(18.17393, 57.39773), ST_SetSRID(ST_MakePoint(18.17393, 57.39773), 4326),
       'Medeltid (1390-tal)', NULL,
       'Medeltida jordvallsfäste (ca 110×75 m, vall + vallgrav) uppfört av Erik av Mecklenburg. Här dog tronpretendenten Erik (son till kung Albrekt av Mecklenburg) i pesten sommaren 1397. Bränt av Tyska Orden strax efter; vall och grav bevarade, militärt återanvänt in på 1700-talet. Erik begravdes vid S:ta Maria (tyska kyrkan) i Visby — Gotlands hittills enda kungliga grav; en gavel ur hans gravmonument sattes 1913 upp i Stora kapellet i Visby domkyrka (Mecklenburgs tjurhuvud-vapen).'
WHERE NOT EXISTS (SELECT 1 FROM public.archaeological_sites WHERE name = 'Landeskrone (Klintehamn)');

-- 3) Varnhem — fyllig nekropol-beskrivning.
UPDATE public.archaeological_sites SET
  description = 'Cistercienskt kloster (grundat mitten av 1100-talet, donation av Sigrid), kunglig gravkyrka: fyra svenska kungar, en drottning, en hertig, en hertiginna, en regerande riksjarl och en rikskansler. Erikska ätten: Knut Eriksson (+1196), Erik Knutsson (+1216), Erik Eriksson "läspe och halte" (+1250). Stenkilsätten: Inge den äldre (+ ca 1100, flyttad hit). Bjälboätten (framför Heliga korsets altare): Birger jarl (+1266), hertig Erik (+1275) och drottning Mechtild (+1288) — deras grav öppnad 2002 och DNA-bekräftad. Senare: rikskansler M.G. De la Gardie (+1686) med familj. Stenporträtt av Birger i kyrkan = Sveriges första kända bild av en historisk person.'
WHERE name = 'Varnhem';
