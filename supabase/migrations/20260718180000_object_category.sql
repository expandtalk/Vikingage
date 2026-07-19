-- Kanonisk objektkategori (datakvalitet, per docs/ontology.md §4).
-- object_type har ~100 okontrollerade fritextvarianter (sv/en, versaler). Istället för
-- att skriva över originalet lägger vi till en KANONISK facett `object_category` via
-- nyckelordsregler. Original `object_type` bevaras. Icke-destruktivt, går att köra om.
-- Kör i SQL-editorn, sedan: supabase migration repair --status applied 20260718180000

alter table public.runic_inscriptions
  add column if not exists object_category text;

-- Reglerna prövas uppifrån och ned — SPECIFIKA före generella
-- (t.ex. "Fragment av gravhäll" → grave_slab, inte fragment).
update public.runic_inscriptions
set object_category = case
    when object_type is null or btrim(object_type) = ''                              then 'unknown'
    when lower(object_type) ~ 'gravhäll|grave slab|gravkist|gravsten|grave_slab'      then 'grave_slab'
    when lower(object_type) ~ 'putsinskrift|kalkristning|plaster'                     then 'plaster_inscription'
    when lower(object_type) ~ 'byggnadsinskrift|building|door|dörr|lintel|wall|chamber|gavel' then 'building_inscription'
    when lower(object_type) ~ 'brakteat|bracteate'                                    then 'bracteate'
    when lower(object_type) ~ 'dopfunt|baptismal font|sundial|dryckeshorn'            then 'liturgical_object'
    when lower(object_type) ~ 'kors|cross'                                            then 'cross'
    when lower(object_type) ~ 'runhäll|hällristning|rock|runsten i bildstensform'     then 'rock_carving'
    when lower(object_type) ~ 'fragment|skärva|stenfragment'                          then 'fragment'
    when lower(object_type) ~ 'runsten|runestone|runristning|runic inscription|runic_plate|ristad sten|bildsten|förmodad runsten|church stone|wall stone|^sten$|^stone$' then 'runestone'
    when lower(object_type) ~ 'trä|wood|stav|stick|yxskaft|pilskaft|planka|amulet'    then 'wood'
    when lower(object_type) ~ 'fibula|spänne|brooch|kam|comb|kniv|knife|blad|spets|bleck|sheet|trissa|whorl|beslag|ring|bone|ben|seal|casket|ask|skål|krukskärva|figur|statyett|lejon|lion|medalj|sköld|shield|pärla|pommel|munbleck|doppsko|metsänke|grepp|grindstolpe|toy|mold|weight|fish|walrus|skifferplatta|föremålsinskrift' then 'portable_object'
    else 'other'
  end;

-- Verifiering (kör separat):
-- select object_category, count(*) from runic_inscriptions group by 1 order by 2 desc;
-- select object_type from runic_inscriptions where object_category='other' group by 1;
