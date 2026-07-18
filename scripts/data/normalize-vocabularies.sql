-- Normalisering av kontrollerade vokabulärer (datakvalitet, per docs/ontology.md §4).
-- RENA normaliseringar utan informationsförlust (stavning/versal/språk). Kör i SQL-editorn.
-- Tvetydiga rune_type-värden (fuþark/nordic/runor/Bildsten, 25 st) lämnas för manuell
-- granskning — de går inte att klassificera säkert. object_type + uncertainty_level
-- hanteras separat (kräver mappningstabell resp. kolumndelning).

begin;

-- 1. country: normalisera svensk/dansk form till kanonisk engelsk (431 rader).
update public.runic_inscriptions set country = 'Sweden'  where country = 'Sverige';
update public.runic_inscriptions set country = 'Denmark' where country = 'Danmark';

-- 2. complexity_level: sv → en (4 rader).
update public.runic_inscriptions set complexity_level = 'complex'
where lower(complexity_level) in ('komplex', 'mycket komplex');

-- 3. rune_type: tydliga varianter → 5 kanoniska (104 rader). Ambiguösa lämnas.
update public.runic_inscriptions set rune_type = case
    when rune_type in ('Äldre futhark', 'urnordiska_runor')                 then 'elder_futhark'
    when rune_type in ('yngre futhark', 'Yngre futhark', 'yngre_runor')     then 'younger_futhark'
    when rune_type = 'medeltida_runor'                                      then 'medieval_runes'
    when rune_type in ('okänd', 'Okänd', '')                                then 'unknown'
    else rune_type
  end
where rune_type in ('Äldre futhark','urnordiska_runor','yngre futhark','Yngre futhark',
                    'yngre_runor','medeltida_runor','okänd','Okänd','');

-- 4. coord_source: konsolidera ad-hoc "... location lookup" → 'manual' (29 rader);
--    kanonisera user/exact-etiketter.
update public.runic_inscriptions set coord_source = 'manual'
where coord_source ilike '%location lookup%';
update public.runic_inscriptions set coord_source = 'user_provided_exact'
where coord_source = 'User provided exact coordinates';
update public.runic_inscriptions set coord_source = 'exact_source'
where coord_source = 'Exact coordinates from source';

commit;

-- Efterkontroll (kör separat):
-- select country, count(*) from runic_inscriptions group by 1 order by 2 desc;
-- select rune_type, count(*) from runic_inscriptions group by 1 order by 2 desc;
-- select coord_source, count(*) from runic_inscriptions group by 1 order by 2 desc;
