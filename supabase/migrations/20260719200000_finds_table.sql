-- Fyndkatalog (skatter, depåfynd, guldfynd, gravfält) — fanns inte tidigare.
-- artefacts-tabellen är bara en objekttyps-vokabulär, inte fynd. Denna tabell bär
-- verkliga fynd med koordinater så de kan sökas och (senare) visas på kartan.
-- RLS: publik läsning. Seed nedan är ETT FÅTAL, flaggade för verifiering — den fulla
-- populeringen (~50 öländska silverskatter m.m.) görs via RAÄ Fornsök/K-samsök-import.
create table if not exists public.finds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  find_type text,            -- hoard | gold_find | deposit | trading_site | grave_field | single_find
  material text,             -- silver | guld | brons | ...
  description text,
  find_place text,
  parish text,
  landscape text,
  coordinates point,
  dating_text text,
  object_count integer,
  raa_number text,
  data_source text,          -- proveniens/verifieringsflagga
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.finds enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='finds' and policyname='finds_public_read') then
    create policy finds_public_read on public.finds for select using (true);
  end if;
end $$;

insert into public.finds (name, find_type, material, description, find_place, landscape, coordinates, dating_text, data_source)
select v.name, v.ftype, v.mat, v.descr, v.place, v.land, point(v.lng, v.lat), v.dating, v.src
from (values
  ('Färjestaden guldfynd','gold_find','guld','Guldfynd (bl.a. ringar) rapporterat vid Färjestaden, Öland. Uppgift att verifiera mot RAÄ Fornsök.','Färjestaden','Öland',16.4600,56.6500,'vikingatid (?)','anvandarrapport_ej_verifierad'),
  ('Köpingsvik handelsplats','trading_site','silver/import','Vikingatida handels- och hamnplats på Öland med silver- och importfynd. Koordinat ungefärlig.','Köpingsvik','Öland',16.7200,56.8800,'vikingatid','seed_ungefarlig'),
  ('Sandby borg — depåfynd','deposit','guld/silver','Fornborg på Öland; utgrävningar har påträffat smycken och depåfynd (folkvandringstida massaker ca 480-tal). Koordinat ungefärlig.','Sandby','Öland',16.6800,56.5500,'folkvandringstid ca 480','seed_ungefarlig')
) as v(name, ftype, mat, descr, place, land, lng, lat, dating, src)
where not exists (select 1 from public.finds f where lower(f.name) = lower(v.name));
