-- Metaller & proveniens — Fas 1 datapopulering (verifieringspass). Kör EFTER 20260728160000.
-- Se docs/metaller-proveniens-design.md. Alla värden käll-verifierade i denna pass:
--   * Koordinater: Wikidata P625 (EntityData-JSON), hämtade 2026-07-27. Point vs region flaggat.
--   * Great Orme isotope_signature: Williams 2014 (Historical Metallurgy 47(1):93-110), primärläst, n=3.
--   * Bedale metal_analyses: Kershaw et al. 2025 (Archaeometry, doi:10.1111/arcm.70031), Tabell 1,
--     öppen CC-BY-fulltext (Oxford ORA), solution MC-ICP-MS @ BGS.
-- Övriga malmkällors isotope_signature LÄMNAS NULL (ingen publicerad/primärläst kvot funnen) —
-- notes bär citat till rätt källa för nästa pass. Ingen kant sourced_from dras: Bedales slutsats
-- är ström-nivå (västeuropeiskt/islamiskt silver), ej gruv-nivå → skulle övertolka.
-- Idempotent (UPDATE = fasta värden; metal_analyses guardad med NOT EXISTS).

begin;

-- ---------- 1. Koordinater (Wikidata P625) + käll-pekare i note ----------
update public.ore_sources set lat = 38.721111, lng = -5.219444,
  note = 'Koordinat = kommuncentrum Cabeza del Buey (Wikidata Q1100433, P625); bronsålders-gruvdistriktet ligger runt orten, ej exakt gruvläge. isotope_signature: Ling Moving Metals II–IV + Klein et al. 2009 Sierra Morena (DOI 10.5209/JIGE.33882) som regionalt SW-Iberiskt fält.'
  where name = 'Cabeza del Buey (Extremadura)';

update public.ore_sources set lat = 53.330984, lng = -3.847961,
  isotope_signature = '{"206Pb/204Pb":[18.317,19.917],"207Pb/204Pb":[15.632,15.697],"208Pb/204Pb":[38.344,38.702],"207Pb/206Pb":[0.788,0.853],"n":3,"source":"Williams 2014, Historical Metallurgy 47(1):93-110 (Pentrwyn-malm, NIGL)","caveat":"n=3 malmprov; fullständigt fält i Williams & Le Carlier de Veslud 2019 (Antiquity, DOI 10.15184/aqy.2019.130) supplement"}'::jsonb,
  note = 'Koordinat = Great Orme Copper Mines (Wikidata Q85941086, P625), exakt gruvläge. isotope_signature primärläst ur Williams 2014 (n=3 malmprov, ej fullt fält).'
  where name = 'Great Orme';

update public.ore_sources set lat = 60.604722, lng = 15.630833,
  note = 'Koordinat = Falu gruva (Wikidata Q636194, P625), exakt läge. Ingen publicerad Pb-isotopsignatur för Faluns malm funnen i öppen litteratur — ej fabricerad, lämnas NULL.'
  where name = 'Falu gruva (Stora Kopparberg)';

update public.ore_sources set lat = 34.916667, lng = 32.833333,
  note = 'Koordinat = Troodosmassivets centroid (Wikidata Q466628, P625), regionskala ej enskild gruva. isotope_signature: OXALID/GlobaLID (Klein et al. 2022, DOI 10.1111/arcm.12762) + Stos-Gale et al. 1997 (Archaeometry, DOI 10.1111/j.1475-4754.1997.tb00792.x).'
  where name = 'Troodos (Cypern)';

update public.ore_sources set lat = 50.136111, lng = -5.383611,
  note = 'Koordinat = Cornwall & West Devon Mining Landscape-centroid (Wikidata Q464566, P625), regionskala (WHS = 10 spridda områden, minst precis i setet). Sn-isotoper: Berger et al. 2019 (PLOS ONE, doi:10.1371/journal.pone.0218326, ingotvärden) + Mason/Powell malm-δ124Sn (ej kvot-verifierad).'
  where name = 'Cornwall & Devon';

update public.ore_sources set lat = 50.5, lng = 13.0,
  note = 'Koordinat = Erzgebirges centroid (Wikidata Q4198, P625), regionskala. Sn/Ag: Berger et al. 2019 (PLOS ONE) + Mason/Powell malm-δ124Sn (ej verifierad).'
  where name = 'Erzgebirge';

update public.ore_sources set lat = 46.2833, lng = 11.5667,
  note = 'Koordinat = Val di Fiemme-centroid (Wikidata Q256454, P625), regionskala (Trentino bronsålders-kopparfält). isotope_signature: Artioli et al. 2016 (JAS, DOI 10.1016/j.jas.2016.09.005, Padova-databasen).'
  where name = 'Italienska Alperna (Trentino)';

update public.ore_sources set lat = 46.221944, lng = -0.145,
  note = 'Koordinat = Melle kommuncentrum (Wikidata Q634108, P625); karolingiska silvergruvorna (Mines d''argent des rois francs) ligger i orten, ej separat gruvpunkt.'
  where name = 'Melle';

-- ---------- 2. Bedale metal_analyses (Kershaw 2025, Tabell 1, verifierat) ----------
-- Bedale-skatten är EN coins-rad (hoard) → per-ingot-värden sub-identifieras i note (York-accession).
with b as (select id from public.coins where name ilike 'Bedale%' limit 1)
insert into public.metal_analyses
  (object_type, object_id, system, value, unit, method, lab, source, confidence, note)
select 'coin', b.id, v.system, v.value, 'ratio', 'solution MC-ICP-MS',
       'British Geological Survey (Nu Plasma MC-ICP-MS; NBS 981)',
       'Kershaw et al. 2025, Archaeometry, doi:10.1111/arcm.70031 (Tabell 1)',
       'certain', v.note
from b cross join (values
  ('Pb206_204', 18.5913, 'Bedale obj 30 (York Museums Trust 2014.149.35), avlång tacka 126 g; grupp: östlig/islamisk'),
  ('Pb207_204', 15.6660, 'Bedale obj 30 (York Museums Trust 2014.149.35)'),
  ('Pb208_204', 38.6952, 'Bedale obj 30 (York Museums Trust 2014.149.35)'),
  ('Pb207_206', 0.84263, 'Bedale obj 30 (York Museums Trust 2014.149.35)'),
  ('Pb208_206', 2.08130, 'Bedale obj 30 (York Museums Trust 2014.149.35)'),
  ('Pb206_204', 18.5415, 'Bedale obj 4 (York Museums Trust 2014.149.9), avlång tacka 100 g; grupp: islamisk'),
  ('Pb206_204', 18.6431, 'Bedale obj 7 (York Museums Trust 2014.149.12), avlång tacka 48 g; grupp: islamisk')
) as v(system, value, note)
where b.id is not null
  and not exists (
    select 1 from public.metal_analyses m
    where m.object_type = 'coin' and m.object_id = b.id
      and m.system = v.system and m.value = v.value
      and m.source like 'Kershaw%');

commit;

-- Kontroll:
--   select name, lat, lng, isotope_signature is not null as has_sig from public.ore_sources order by name;
--   select system, value, note from public.metal_analyses where source like 'Kershaw%' order by system, value;
-- Efter apply: supabase migration repair --status applied 20260728161000
-- Bedales publicerade slutsats (för framtida kurering, EJ som gruv-kant): blandat silver —
-- dominant västeuropeiskt (karolingiskt/anglosaxiskt raidbyte) + signifikant islamisk dirham-
-- komponent (Kershaw et al. 2025). Ström-nivå, ej gruv-nivå → ingen sourced_from-kant dras här.
