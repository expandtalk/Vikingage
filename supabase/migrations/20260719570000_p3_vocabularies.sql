-- P3: Kontrollerade vokabulärer (docs/kunskapsgraf-arkitektur.md §P3, ontology §4).
--  * vocabulary: ETT ställe för alla värdeförråd, flerspråkiga labels, hierarki
--    (parent_code), dateringsintervall (Gräslund-stilarnas TPQ/TAQ = härledd
--    dateringskälla), rundata-proveniens (source_uuid).
--  * Import före design: styles/materials/runetypes färdiga ur rundata_raw.
--  * N:M-länktabeller via rundata_objectid-bryggan: inscription_style (163 objekt
--    har flera stilar), inscription_material, inscription_runetype.
--  * Deriverade fills på runic_inscriptions ENDAST där fältet är tomt — länktabellerna
--    är sanningskällan, skalärerna är projektion (ontology §1b-principen).
-- Idempotent.

begin;

-- ---------- 1. vocabulary ----------
create table if not exists public.vocabulary (
  scheme text not null,
  code text not null,
  label_sv text,
  label_en text,
  parent_code text,
  category text,
  period_start integer,   -- TPQ (stilar)
  period_end integer,     -- TAQ
  source_uuid uuid,       -- rundata-id (proveniens/omkörning)
  source_ref text,
  wikidata_id text,
  description text,
  created_at timestamptz not null default now(),
  primary key (scheme, code),
  foreign key (scheme, parent_code) references public.vocabulary(scheme, code)
);
alter table public.vocabulary enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where tablename='vocabulary' and policyname='Public read vocabulary') then
    create policy "Public read vocabulary" on public.vocabulary for select using (true);
    create policy "Admin write vocabulary" on public.vocabulary for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

-- ---------- 2. ornament_style (Gräslund; TPQ/TAQ = härledd datering per stil) ----------
insert into public.vocabulary (scheme, code, label_sv, label_en, period_start, period_end, source_uuid, source_ref)
select 'ornament_style', s.style, s.sv, s.en, s.tpq, s.taq, s.styleid, 'rundata 2020-11-29 (styles)'
from rundata_raw.styles s
on conflict (scheme, code) do nothing;

-- ---------- 3. material-hierarkin: typ → material ----------
insert into public.vocabulary (scheme, code, label_sv, source_uuid, source_ref)
select 'material_type', mt.materialtype, mt.materialtype, mt.materialtypeid, 'rundata 2020-11-29 (materialtypes)'
from rundata_raw.materialtypes mt
on conflict (scheme, code) do nothing;

-- toppnivå (typerna) FÖRST i material-schemat — parent_code-FK:n kräver det
insert into public.vocabulary (scheme, code, label_sv, source_uuid, source_ref)
select 'material', mt.materialtype, mt.materialtype, mt.materialtypeid, 'rundata 2020-11-29 (materialtypes)'
from rundata_raw.materialtypes mt
on conflict (scheme, code) do nothing;

insert into public.vocabulary (scheme, code, label_sv, parent_code, source_uuid, source_ref)
select distinct on (m.material) 'material', m.material, m.material, mt.materialtype, m.materialid, 'rundata 2020-11-29 (materials)'
from rundata_raw.materials m
left join rundata_raw.materialtypes mt on mt.materialtypeid = m.materialtypeid
where m.material is not null
order by m.material, m.materialid
on conflict (scheme, code) do nothing;

-- ---------- 4. runetype ----------
insert into public.vocabulary (scheme, code, label_sv, category, source_uuid, source_ref)
select 'runetype', rt.runetype, rt.runetype, rt.category, rt.runetypeid, 'rundata 2020-11-29 (runetypes)'
from rundata_raw.runetypes rt
on conflict (scheme, code) do nothing;

-- ---------- 5. Hand-definierade scheman (ontology §4) ----------
insert into public.vocabulary (scheme, code, label_sv, label_en, source_ref) values
  ('object_category','runestone','runsten','runestone','ontology §6'),
  ('object_category','rock_carving','runhäll','rock carving','ontology §6'),
  ('object_category','grave_slab','gravhäll','grave slab','ontology §6'),
  ('object_category','fragment','fragment','fragment','ontology §6'),
  ('object_category','portable_object','lösföremål','portable object','ontology §6'),
  ('object_category','building_inscription','byggnadsinskrift','building inscription','ontology §6'),
  ('object_category','plaster_inscription','putsinskrift','plaster inscription','ontology §6'),
  ('object_category','wood','trä','wood','ontology §6'),
  ('object_category','bracteate','brakteat','bracteate','ontology §6'),
  ('object_category','cross','kors','cross','ontology §6'),
  ('object_category','liturgical_object','liturgiskt föremål','liturgical object','ontology §6'),
  ('object_category','other','övrigt','other','ontology §6'),
  ('object_category','unknown','okänd','unknown','ontology §6'),
  ('coord_confidence','high','hög','high','ontology §4'),
  ('coord_confidence','medium','medel','medium','ontology §4'),
  ('coord_confidence','low','låg','low','ontology §4'),
  ('coord_confidence','unknown','okänd','unknown','ontology §4'),
  ('coord_source','rundata_evighetsrunor','Rundata/Evighetsrunor','Rundata/Evighetsrunor','ontology §4'),
  ('coord_source','nominatim','Nominatim-geokodning','Nominatim geocoding','ontology §4'),
  ('coord_source','manual','manuell','manual','ontology §4'),
  ('coord_source','user_provided_exact','användarangiven exakt','user-provided exact','ontology §4'),
  ('coord_source','original_field','ursprungligt fält','original field','ontology §4'),
  ('coord_source','regional_center','regional centroid','regional centroid','ontology §4')
on conflict (scheme, code) do nothing;

-- country: kanonisk engelsk form (ontology §4) + det som faktiskt förekommer
insert into public.vocabulary (scheme, code, label_sv, label_en, source_ref)
select distinct 'country', c.en, c.sv, c.en, 'rundata 2020-11-29 (countries)'
from rundata_raw.countries c where c.en is not null
on conflict (scheme, code) do nothing;

-- meter: ur faktiskt använda värden (satta i meter-migrationerna)
insert into public.vocabulary (scheme, code, label_sv, label_en, source_ref)
select distinct 'meter', m, m, m, 'runic_inscriptions.meter (befintliga värden)'
from (
  select meter as m from public.runic_inscriptions where meter is not null and meter <> ''
  union
  select meter from public.historical_sources where meter is not null and meter <> ''
) t
on conflict (scheme, code) do nothing;

-- ---------- 6. N:M-länktabeller (sanningskällan; skalärer = projektion) ----------
create table if not exists public.inscription_style (
  inscription_id uuid not null references public.runic_inscriptions(id) on delete cascade,
  scheme text not null default 'ornament_style' check (scheme = 'ornament_style'),
  style_code text not null,
  certainty boolean,
  source_ref text not null default 'rundata 2020-11-29 (object_style)',
  primary key (inscription_id, style_code),
  foreign key (scheme, style_code) references public.vocabulary(scheme, code)
);
create table if not exists public.inscription_material (
  inscription_id uuid not null references public.runic_inscriptions(id) on delete cascade,
  scheme text not null default 'material' check (scheme = 'material'),
  material_code text not null,
  source_ref text not null default 'rundata 2020-11-29 (object_material)',
  primary key (inscription_id, material_code),
  foreign key (scheme, material_code) references public.vocabulary(scheme, code)
);
create table if not exists public.inscription_runetype (
  inscription_id uuid not null references public.runic_inscriptions(id) on delete cascade,
  scheme text not null default 'runetype' check (scheme = 'runetype'),
  runetype_code text not null,
  source_ref text not null default 'rundata 2020-11-29 (inscription_runetype)',
  primary key (inscription_id, runetype_code),
  foreign key (scheme, runetype_code) references public.vocabulary(scheme, code)
);

alter table public.inscription_style enable row level security;
alter table public.inscription_material enable row level security;
alter table public.inscription_runetype enable row level security;
do $$
declare t text;
begin
  foreach t in array array['inscription_style','inscription_material','inscription_runetype'] loop
    if not exists (select 1 from pg_policies where tablename=t and policyname='Public read '||t) then
      execute format('create policy %I on public.%I for select using (true)', 'Public read '||t, t);
      execute format('create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())', 'Admin write '||t, t);
    end if;
  end loop;
end $$;

-- fyll ur staging via bryggan
insert into public.inscription_style (inscription_id, style_code, certainty)
select distinct r.id, s.style, os.certainty = 1
from rundata_raw.object_style os
join rundata_raw.styles s on s.styleid = os.styleid
join public.runic_inscriptions r on r.rundata_objectid = os.objectid
on conflict do nothing;

insert into public.inscription_material (inscription_id, material_code)
select distinct r.id, m.material
from rundata_raw.object_material om
join rundata_raw.materials m on m.materialid = om.materialid
join public.runic_inscriptions r on r.rundata_objectid = om.objectid
on conflict do nothing;

insert into public.inscription_runetype (inscription_id, runetype_code)
select distinct r.id, rt.runetype
from rundata_raw.inscription_runetype irt
join rundata_raw.runetypes rt on rt.runetypeid = irt.runetypeid
join rundata_raw.inscriptions i on i.inscriptionid = irt.inscriptionid
join public.runic_inscriptions r on r.rundata_objectid = i.objectid
on conflict do nothing;

-- ---------- 7. Deriverade fills (ENDAST tomma skalärer; länktabell = sanning) ----------
update public.runic_inscriptions r set style_group = sub.styles
from (
  select inscription_id, string_agg(style_code, '/' order by style_code) as styles
  from public.inscription_style group by inscription_id
) sub
where sub.inscription_id = r.id and (r.style_group is null or r.style_group = '');

update public.runic_inscriptions r set material = sub.mats
from (
  select inscription_id, string_agg(material_code, '/' order by material_code) as mats
  from public.inscription_material group by inscription_id
) sub
where sub.inscription_id = r.id and (r.material is null or r.material = '');

commit;
