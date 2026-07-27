-- Öland-modellen: (1) rätta Färjestadskragens läge till Torslunda/landborgen (per lokal kännedom,
-- Daniel); (2) vy v_oland_model som samlar Ölands modell-lager med rena lat/lng för /sv/oland.
-- Runstenar via signum 'Öl%' (rent); övriga via ö-envelopp (lng 16.38–17.12, lat 56.20–57.37).
-- Viss Kalmarsund-/fastlandskant kan läcka in — medvetet (visar tvär-sunds-kontexten).

begin;

-- (1) Färjestadskragen → Färjestadens gård/skans vid färjeläget (kustnära, Torslunda sn).
update public.coins
set coordinates = point(16.462, 56.545),
    find_place = 'Färjestadens gård (skansen vid färjeläget), Torslunda socken, Öland',
    description = 'Guldhalskrage funnen 1860 av drängen Johan Peter Petersson vid Färjestadens gård, Torslunda sn — trolig fyndplats vid den gamla skansen strax innan färjeläget vid Kalmarsund. Fem guldringar (diam 18–22,6 cm), ~700 g, drak-/sirater i filigran, tillverkad på 400-talet; två motsvarigheter finns (båda Västergötland). Tolkas ha prytt en gudabild eller burits av Ölands mäktigaste hövding vid kulthandlingar. Guldrummet, Historiska museet (SHM 108870). Koordinat approximativ (Färjestaden/skansen).'
where name = 'Färjestadskragen';

-- (1b) Björnhovda solidusskatt — nod på E–V-vägen Färjestaden→Gråborg (Daniel: gammal väg,
-- passerar Gråborg). Ölands näst största solidusskatt. Koord approximativ (Björnhovda, Torslunda sn,
-- på vägen mellan Färjestaden 16.46 och Gråborg 16.60).
insert into public.coins (name, name_en, category, metal, denomination, period_start, period_end,
  find_place, coordinates, significance, description, sources)
select 'Björnhovda-skatten (solidi)', 'The Björnhovda hoard (solidi)', 'hoard', 'gold', 'solidus (36 st)',
  400, 500, 'Björnhovda, Torslunda socken, Öland', point(16.52, 56.60),
  'Ölands näst största solidusskatt: 36 solidi i en skinnpåse, yngsta myntet präglat tidigast 475',
  'Solidusskatt (36 mynt), ursprungligen i en skinnpåse, funnen i omgångar 1864–1870 vid plöjning i Björnhovda, Torslunda sn. Yngsta myntet präglat ≥475 → speglar guldflödets slut vid Västroms fall. Ligger på den gamla E–V-vägen Färjestaden→Gråborg. Källa: Ölands guldålder (Erlandsson/Aldestam); Historiska museet. Koordinat approximativ.',
  'Karl-Oskar Erlandsson & Gunnar Aldestam, "Ölands guldålder"; Historiska museet (SHM)'
where not exists (select 1 from public.coins where name = 'Björnhovda-skatten (solidi)');

-- (2) Modell-vy.
create or replace view public.v_oland_model as
  select 'runestone'::text kind, signum as name, coordinates[1] as lat, coordinates[0] as lng, coalesce(object_type,'') as note
  from public.runic_inscriptions where signum ilike 'Öl %' and coordinates is not null
  union all
  select 'hillfort', name, coordinates[1], coordinates[0], coalesce(fortress_type,'')
  from public.swedish_hillforts
  where coordinates[1] between 56.20 and 57.37 and coordinates[0] between 16.38 and 17.12
  union all
  select 'fro_name', name, lat, lng, 'Frö-namn'
  from public.place_names
  where lat between 56.20 and 57.37 and lng between 16.38 and 17.12
    and (name ilike 'frö%' or name ilike '%frö' or name ilike 'frös%' or name ilike '%frö %')
  union all
  select 'find', name, coordinates[1], coordinates[0], coalesce(denomination, category)
  from public.coins
  where coordinates is not null and coordinates[1] between 56.20 and 57.37 and coordinates[0] between 16.38 and 17.12
  union all
  select 'church', name, lat, lng, coalesce(built_from::text,'')
  from public.ecclesiastical_sites
  where lat between 56.20 and 57.37 and lng between 16.38 and 17.12;

grant select on public.v_oland_model to anon, authenticated;

commit;

-- Kontroll: select kind, count(*) from v_oland_model group by kind order by 2 desc;
