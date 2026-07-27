-- Färjestadskragen — folkvandringstida guldhalskrage, Öland. Källförd: Historiska museet
-- (SHM) föremål 108870. Prestigefynd på Ölands väst/Kalmarsund-korridor (jfr Karlevi, Frö-klungan).
-- Lagras i coins (plattformens "Mynt & fynd (fyndplats)"-lager); category='prestige_gold' skiljer
-- den från mynt. Koordinat APPROXIMATIV (Färjestaden ortscentrum; exakt fyndplats ej fastställd).

begin;
insert into public.coins (name, name_en, category, metal, denomination, period_start, period_end,
  find_place, coordinates, significance, description, sources)
select 'Färjestadskragen', 'The Färjestaden gold collar', 'prestige_gold', 'gold', 'guldhalskrage',
  400, 550, 'Färjestadens gård, Torslunda socken, Öland', point(16.46, 56.55),
  'Folkvandringstida guldhalskrage: fem ornerade guldringar, ~700 g, 274 figurer (fågelmotiv dominerar), filigranteknik',
  'Guldhalskrage funnen 1860 vid Färjestadens gård, Torslunda sn, Öland. Fem guldringar (diam 18–22,6 cm), ~700 g, 274 figurer, filigran. Förvaras i Guldrummet, Historiska museet (SHM 108870). Prestigenod i migrationsperiodens guld på Ölands västkust. Koordinat approximativ (Färjestaden; exakt fyndplats ej fastställd).',
  'Wikipedia "Färjestadskragen"; Historiska museet (SHM) föremål 108870'
where not exists (select 1 from public.coins where name = 'Färjestadskragen');
commit;

-- Kontroll: select name, category, metal, find_place, coordinates from coins where name='Färjestadskragen';
