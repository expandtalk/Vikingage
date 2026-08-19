-- Ontologi-disciplin i Postgres (lånar shippings kontrakt-tänk, ej RDF-maskineriet) + temporala platslager.
-- Se [[agent-fleet-inventory]], [[interoperability-linked-data]], [[temporal-nucleus-model]].

-- 1a) mapsToTable: explicit entity_type → källtabell (idag utspritt i rebuild_search_document_x).
create table if not exists entity_type_registry (
  entity_type text primary key,
  source_table text, id_column text default 'id',
  label_sv text, label_en text, description text, updated_at timestamptz default now());
insert into entity_type_registry (entity_type, source_table, id_column, label_sv) values
 ('inscription','runic_inscriptions','id','Runinskrift'),
 ('carver','carvers','id','Runristare'),
 ('king','historical_kings','id','Kung'),
 ('dynasty','royal_dynasties','id','Dynasti'),
 ('landscape','admin_boundaries','id','Landskap'),
 ('municipality','admin_boundaries','id','Kommun'),
 ('county','admin_boundaries','id','Län'),
 ('parish','admin_boundaries','id','Socken'),
 ('hundred','hundreds','id','Härad'),
 ('place_name','place_names','id','Ortnamn'),
 ('town','town_formation_profiles','id','Medeltida stad'),
 ('city','viking_cities','id','Stad'),
 ('estate','estates','id','Gods/säte'),
 ('cult_site','cult_sites','id','Kultplats'),
 ('church','ecclesiastical_sites','id','Kyrka'),
 ('source','historical_sources','id','Källa'),
 ('coin','coins','id','Mynt'),
 ('hillfort','swedish_hillforts','id','Fornborg'),
 ('genetic_individual','genetic_individuals','id','aDNA-individ'),
 ('ore_source','ore_sources','id','Malmkälla'),
 ('content_page','content_pages','id','Kunskapssida'),
 ('saint','saints','code','Helgon'),
 ('theme','themes','id','Tema')
on conflict (entity_type) do update set source_table=excluded.source_table, label_sv=excluded.label_sv, updated_at=now();

-- 1c) rel_predicates-versionering (versionIRI:s värde) — spåra medvetna ändringar.
alter table rel_predicates add column if not exists version int not null default 1;
alter table rel_predicates add column if not exists updated_at timestamptz default now();
create table if not exists rel_predicates_history (
  id bigint generated always as identity primary key,
  code text, changed_at timestamptz default now(), changed_by text, snapshot jsonb);
create or replace function rel_predicates_versioning() returns trigger language plpgsql as $$
begin
  new.version := coalesce(old.version,1) + 1; new.updated_at := now();
  insert into rel_predicates_history(code, changed_by, snapshot) values (old.code, current_user, to_jsonb(old));
  return new;
end $$;
drop trigger if exists trg_rel_predicates_ver on rel_predicates;
create trigger trg_rel_predicates_ver before update on rel_predicates for each row execute function rel_predicates_versioning();

-- 1b) SHACL-lite: validera relationship-rader mot predikatets deklarerade subject/object-typ.
create or replace function public.kg_validate_relationships()
 returns table(predicate text, expected_subject text, actual_subject text, expected_object text, actual_object text, n bigint)
 language sql stable security definer set search_path to 'public' as $$
  select r.predicate, p.subject_type, s.entity_type, p.object_type, o.entity_type, count(*)
  from relationship r
  left join rel_predicates p on p.code = r.predicate
  left join entity_registry s on s.id = r.subject_id
  left join entity_registry o on o.id = r.object_id
  where p.code is null
     or (p.subject_type is not null and s.entity_type is not null and p.subject_type <> s.entity_type)
     or (p.object_type  is not null and o.entity_type is not null and p.object_type  <> o.entity_type)
  group by 1,2,3,4,5 order by 6 desc;
$$;
grant execute on function public.kg_validate_relationships() to anon, authenticated;

-- 3) Temporala platslager (Daniel: "en stad byggs i lager — varje århundrade är ett eget lager").
-- En plats är inte EN grundningsdatering utan en stratigrafi av perioder, var och en nedbrytbar.
create table if not exists place_temporal_layers (
  id bigint generated always as identity primary key,
  place_slug text, place_name text not null,
  century int,                       -- århundradets startår (1000,1100,1200…) = lagrets nivå
  phase_from int, phase_to int,      -- finare spann inom lagret (nedbrytning)
  layer_label text not null, characterization text,
  evidence text, source text, confidence text default 'medel',
  created_at timestamptz default now());
alter table place_temporal_layers enable row level security;
drop policy if exists ptl_read on place_temporal_layers;
create policy ptl_read on place_temporal_layers for select using (true);
