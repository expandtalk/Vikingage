-- Maktsfär-dimension på elit-monumenten: klustren på översiktskartan motsvarar
-- separata samtida riken/kulturzoner (dansk söder, Östergötland, Svealand,
-- Västergötland, autonoma Gotland) — inte ett enat Sverige.
alter table elite_monuments add column if not exists sphere text;

-- Unik på namn så seed kan UPSERT:a (uppdatera sfär/genre på befintliga rader).
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'elite_monuments_name_key') then
    alter table elite_monuments add constraint elite_monuments_name_key unique (name);
  end if;
end $$;
