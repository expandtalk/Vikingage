-- Dela uncertainty_level i två rena begrepp (datakvalitet, docs/ontology.md §4).
-- Fältet blandar ihop: (a) tolkningskonfidens (confirmed/high/low/uncertain),
-- (b) skick (Fragmentarisk), (c) daterings-fritext (Säker/Osäker datering) — och
-- 'medium' (2926) är en betydelselös bulk-default. Vi lägger till TVÅ kanoniska
-- kolumner och härleder. Original `uncertainty_level` BEVARAS (icke-destruktivt).
-- Kör i SQL-editorn, sedan: supabase migration repair --status applied 20260718190000

alter table public.runic_inscriptions
  add column if not exists interpretation_confidence text,  -- certain | uncertain | unknown
  add column if not exists condition text;                  -- intact | fragmentary | lost | unknown

-- interpretation_confidence: kollapsa till certain/uncertain/unknown.
-- 'medium' + daterings-/skick-fritext bär ingen tolkningssignal → unknown.
update public.runic_inscriptions
set interpretation_confidence = case
    when uncertainty_level in ('confirmed', 'high')                      then 'certain'
    when uncertainty_level in ('low', 'uncertain', 'Osäker tolkning')    then 'uncertain'
    else 'unknown'
  end;

-- condition: skick. Fragmentariskt härleds ur uncertainty_level OCH object_category.
update public.runic_inscriptions
set condition = case
    when uncertainty_level = 'Fragmentarisk' or object_category = 'fragment' then 'fragmentary'
    else 'unknown'
  end;

-- Verifiering (kör separat):
-- select interpretation_confidence, count(*) from runic_inscriptions group by 1 order by 2 desc;
-- select condition, count(*) from runic_inscriptions group by 1 order by 2 desc;
