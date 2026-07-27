-- Berikning av Ölands fornborgar + Skedemosse (källförd; Fallgren 2021/2023, Hagberg 1967,
-- Lidén, SVT/Kalmar läns museum). Rättar Sörby borgs koordinat till exakt (Wikipedia/Fornsök).
-- Lägger kult-/offerplatser i v_oland_model + Skedemosses guldringar som fynd.

begin;

-- Sörby borg — Ölands största, återupptäckt 2021. Exakt koord 56.84733/16.76494.
update public.swedish_hillforts
set coordinates = point(16.76494, 56.84733),
    period = coalesce(period, 'järnålder'),
    cultural_significance = 'Ölands största fornborg. Omnämnd 1703 av prästen Nicholaus Vallinus ("Om Öland"), därefter bortglömd i ~300 år; återupptäckt 2021 av arkeologen Jan-Henrik Fallgren. Ligger på Kvinnö — en forntida ö i den heliga sjön/offerplatsen Skedemosse. Markundersökning visar radiella husgrunder bakom ringmuren + ett centralt kvarter.',
    source_reference = 'Fallgren 2023, "Nyfunnen - återfunnen fornborg på Kvinnö" (Öländska horisonter); SVT Nyheter 2021-08-01; Kalmar läns museum'
where name = 'Sörby borg';

-- Bårby borg — västra Öland, landborgen, två faser.
update public.swedish_hillforts
set cultural_significance = 'En av få fornborgar på västra Öland: stor, halvcirkelformad, i unikt krönläge uppe på landborgen. Fynd tyder på två användningsfaser — folkvandringstid och medeltid — liksom Eketorps borg.',
    source_reference = coalesce(source_reference, 'Kerstin Lidén m.fl.; Kalmar läns museum')
where name = 'Bårby borg';

-- Skedemosse — Sveriges största vapenoffermosse.
update public.cult_sites
set description = 'Sveriges största ansamling av vapenoffer. Utgrävt 1959–1962 (Ulf Erik Hagberg). Vid offren en igenväxande sjö — föremålen troligen offrade från båt. Spjut/lansspetsar vanligast, även sköldar, pilspetsar, yxor; stora mängder djurben (mest häst — hudar/huvuden i ritualer); ~30 människooffer (barn och vuxna); sju guldringar om totalt 1,3 kg. C14: äldsta offer förromersk järnålder, yngsta sen vikingatid. Kringliggande boplatser/gravfält = folkrikt, välmående samhälle under romersk järnålder (Hagbergs tes: rikedom ur hud-/läderexport). Fynden på SHM. Källor: Hagberg 1967; Monikander 2010; Burenhult, Arkeologi i Sverige 3.'
where name = 'Skedemosse';

-- Skedemosses guldringar som fynd (coins), på Skedemosses koordinat.
insert into public.coins (name, name_en, category, metal, denomination, period_start, period_end,
  find_place, coordinates, significance, description, sources)
select 'Skedemosse guldringar', 'The Skedemosse gold rings', 'prestige_gold', 'gold', 'guldringar (7 st)',
  0, 500, 'Skedemosse, Gärdslösa socken, Öland',
  (select point(lng, lat) from public.cult_sites where name='Skedemosse' limit 1),
  'Sju guldringar, totalt 1,3 kg, ur Sveriges största vapenoffermosse',
  'Sju guldringar (~1,3 kg) bland vapenoffren i Skedemosse. Förvaras på SHM.',
  'Hagberg 1967; Burenhult, Arkeologi i Sverige 3; Historiska museet'
where not exists (select 1 from public.coins where name='Skedemosse guldringar')
  and exists (select 1 from public.cult_sites where name='Skedemosse' and lat is not null);

-- v_oland_model v2: lägg till kult-/offerplatser.
create or replace view public.v_oland_model as
  select 'runestone'::text kind, signum as name, coordinates[1] as lat, coordinates[0] as lng, coalesce(object_type,'') as note
  from public.runic_inscriptions where signum ilike 'Öl %' and coordinates is not null
  union all
  select 'hillfort', name, coordinates[1], coordinates[0], coalesce(fortress_type,'')
  from public.swedish_hillforts where coordinates[1] between 56.20 and 57.37 and coordinates[0] between 16.38 and 17.12
  union all
  select 'fro_name', name, lat, lng, 'Frö-namn'
  from public.place_names where lat between 56.20 and 57.37 and lng between 16.38 and 17.12
    and (name ilike 'frö%' or name ilike '%frö' or name ilike 'frös%' or name ilike '%frö %')
  union all
  select 'find', name, coordinates[1], coordinates[0], coalesce(denomination, category)
  from public.coins where coordinates is not null and coordinates[1] between 56.20 and 57.37 and coordinates[0] between 16.38 and 17.12
  union all
  select 'church', name, lat, lng, coalesce(built_from::text,'')
  from public.ecclesiastical_sites where lat between 56.20 and 57.37 and lng between 16.38 and 17.12
  union all
  select 'cult', name, lat, lng, coalesce(type,'')
  from public.cult_sites where lat between 56.20 and 57.37 and lng between 16.38 and 17.12;

grant select on public.v_oland_model to anon, authenticated;

commit;
