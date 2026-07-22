-- P2.1: Grafgrund — vaktad kant-tabell (docs/kunskapsgraf-arkitektur.md §P2, granskningskrav K3).
--  * entity_registry: trigger-synkat nodregister → ÄKTA FK-integritet för polymorfa kanter.
--  * rel_predicates: predikat som FK-data med typkontrakt + qualifier-schema (aldrig fri text).
--  * relationship: EN kant-tabell, unique(subject,predicate,object), typvalidering via trigger.
--  * runic_inscriptions.rundata_objectid: PERSISTERAD identitetsbrygga till rundata
--    (objectid direkt / kanoniskt signum / alias-signum — samma upplösning som P1).
--  * carvers.rundata_carverid + 138 saknade rundata-ristare; artefacts får uuid-id (namnmatch).
-- Idempotent.

begin;

-- ---------- 1. Identitetsbryggan: rundata_objectid ----------
alter table public.runic_inscriptions add column if not exists rundata_objectid uuid;
create index if not exists runic_rundata_objectid_idx on public.runic_inscriptions(rundata_objectid);

drop table if exists _p2_objmap;
create table _p2_objmap as
with signum_map as (
  select lower(replace(s.signum1 || s.signum2, ' ', '')) as norm_signum, i.objectid, si.canonical
  from rundata_raw.signa s
  join rundata_raw.signum_inscription si on si.signumid = s.signumid
  join rundata_raw.inscriptions i on i.inscriptionid = si.inscriptionid
)
select distinct on (id) id, objectid from (
  select r.id, o.objectid, 1 as prio from public.runic_inscriptions r
  join rundata_raw.objects o on o.objectid = r.id
  union all
  select r.id, sm.objectid, 2 from public.runic_inscriptions r
  join signum_map sm on sm.canonical = 1
    and sm.norm_signum = lower(replace(coalesce(r.primary_signum, r.signum), ' ', ''))
  union all
  select r.id, sm.objectid, 3 from public.runic_inscriptions r
  cross join lateral unnest(array[r.signum, r.primary_signum] || coalesce(r.alternative_signum, '{}')) as als(sig)
  join signum_map sm on als.sig is not null and sm.norm_signum = lower(replace(als.sig, ' ', ''))
) t order by id, prio, objectid;

update public.runic_inscriptions r set rundata_objectid = m.objectid
from _p2_objmap m where m.id = r.id and r.rundata_objectid is null;

-- ---------- 2. Ristare: rundata-identitet + saknade ----------
alter table public.carvers add column if not exists rundata_carverid uuid;
create unique index if not exists carvers_rundata_carverid_key
  on public.carvers(rundata_carverid) where rundata_carverid is not null;

-- 2a. id är redan rundata-carverid (193 st)
update public.carvers pc set rundata_carverid = pc.id
from rundata_raw.carvers rc
where rc.carverid = pc.id and pc.rundata_carverid is null;

-- 2b. namnmatch för kurerade rader utan rundata-id (deterministisk: en kandidat)
update public.carvers pc set rundata_carverid = rc.carverid
from rundata_raw.carvers rc
where pc.rundata_carverid is null
  and lower(pc.name) = lower(rc.carver)
  and not exists (select 1 from public.carvers p2 where p2.rundata_carverid = rc.carverid)
  and (select count(*) from rundata_raw.carvers r2 where lower(r2.carver) = lower(pc.name)) = 1;

-- 2c. lägg in rundata-ristare som helt saknas (id = rundata carverid)
insert into public.carvers (id, name, rundata_carverid, source_ref, is_anonymous)
select rc.carverid, rc.carver, rc.carverid, 'rundata 2020-11-29',
       rc.carver ~* '^(okänd|anonym)' or rc.carver like '...%'
from rundata_raw.carvers rc
where not exists (select 1 from public.carvers pc where pc.rundata_carverid = rc.carverid)
  and not exists (select 1 from public.carvers pc where lower(pc.name) = lower(rc.carver));

-- ---------- 3. Artefakttyper: uuid-id (rundata-id via namnmatch) ----------
alter table public.artefacts add column if not exists id uuid;
update public.artefacts pa set id = ra.artefactid
from rundata_raw.artefacts ra
where pa.id is null and lower(ra.artefact) = lower(pa.artefact)
  and not exists (select 1 from public.artefacts p2 where p2.id = ra.artefactid);
update public.artefacts set id = (
  substr(encode(artefactid,'hex'),1,8)||'-'||substr(encode(artefactid,'hex'),9,4)||'-'||
  substr(encode(artefactid,'hex'),13,4)||'-'||substr(encode(artefactid,'hex'),17,4)||'-'||
  substr(encode(artefactid,'hex'),21,12))::uuid
where id is null;
create unique index if not exists artefacts_id_key on public.artefacts(id);

-- ---------- 4. entity_registry (nodregistret) ----------
create table if not exists public.entity_registry (
  id uuid primary key,
  entity_type text not null,
  label text,
  updated_at timestamptz not null default now()
);
create index if not exists entity_registry_type_idx on public.entity_registry(entity_type);

create or replace function public.sync_entity_registry() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_type text := tg_argv[0];
  v_label_col text := tg_argv[1];
  v_id uuid;
  v_label text;
begin
  if tg_op = 'DELETE' then
    v_id := (to_jsonb(old) ->> 'id')::uuid;
    delete from public.entity_registry where id = v_id and entity_type = v_type;
    return old;
  end if;
  v_id := (to_jsonb(new) ->> 'id')::uuid;
  v_label := to_jsonb(new) ->> v_label_col;
  insert into public.entity_registry (id, entity_type, label)
  values (v_id, v_type, v_label)
  on conflict (id) do update set label = excluded.label, updated_at = now();
  return new;
end $$;

-- triggers + backfill per nodtabell
do $$
declare
  spec record;
begin
  for spec in
    select * from (values
      ('runic_inscriptions', 'inscription', 'signum'),
      ('carvers',            'carver',      'name'),
      ('historical_kings',   'king',        'name'),
      ('historical_sources', 'source',      'title'),
      ('themes',             'theme',       'name'),
      ('gods',               'god',         'name'),
      ('royal_dynasties',    'dynasty',     'name'),
      ('coins',              'coin',        'name'),
      ('artefacts',          'artefact',    'artefact'),
      ('viking_roads',       'road',        'name')
    ) as v(tbl, etype, labelcol)
  loop
    execute format(
      'drop trigger if exists trg_registry_sync on public.%I;
       create trigger trg_registry_sync
       after insert or update or delete on public.%I
       for each row execute function public.sync_entity_registry(%L, %L);',
      spec.tbl, spec.tbl, spec.etype, spec.labelcol);
    execute format(
      'insert into public.entity_registry (id, entity_type, label)
       select id, %L, %I::text from public.%I where id is not null
       on conflict (id) do nothing;',
      spec.etype, spec.labelcol, spec.tbl);
  end loop;
end $$;

-- ---------- 5. Predikat med typkontrakt + qualifier-schema ----------
create table if not exists public.rel_predicates (
  code text primary key,
  label_sv text not null,
  label_en text not null,
  subject_type text not null,   -- '*' = valfri nodtyp
  object_type text not null,
  qualifier_schema jsonb,       -- dokumenterat kontrakt för qualifiers
  description text
);

insert into public.rel_predicates (code, label_sv, label_en, subject_type, object_type, qualifier_schema, description) values
  ('carved_by', 'ristad av', 'carved by', 'inscription', 'carver',
   '{"attribution":"signed|attributed|similar|signed_on_pair_stone","certainty":"boolean","notes":"text","lang":"text"}',
   'Inskriften ristad/attribuerad till ristare. Källa: rundata carver_inscription + kurering.'),
  ('mentions_person', 'omnämner person', 'mentions person', 'inscription', 'king',
   '{"connection_type":"text","evidence_strength":"text","notes":"text"}',
   'Inskriften omnämner historisk person (kung m.fl.).'),
  ('commissioned_by', 'rest på uppdrag av', 'commissioned by', 'inscription', 'king',
   '{"notes":"text"}', 'Inskriften beställd/rest av person.'),
  ('cites_source', 'åberopar källa', 'cites source', 'inscription', 'source',
   '{"notes":"text"}', 'Inskriften åberopar/citerar text ur källa.'),
  ('mentions_inscription', 'omnämner inskrift', 'mentions inscription', 'source', 'inscription',
   '{"relation":"text","notes":"text"}', 'Källan omnämner/behandlar inskriften.'),
  ('same_hand_as', 'samma hand som', 'same hand as', 'inscription', 'inscription',
   '{"notes":"text"}', 'Stilistisk/ortografisk samma-hand-bedömning.'),
  ('has_theme', 'har tema', 'has theme', '*', 'theme',
   '{"notes":"text"}', 'Entitet kopplad till begreppslagrets tema.'),
  ('has_artefact', 'bärare av typ', 'carrier of type', 'inscription', 'artefact',
   '{}', 'Inskriftens bärarobjekt är av artefakttyp (rundata object_artefact).'),
  ('belongs_to_group', 'tillhör grupp', 'belongs to group', 'inscription', 'inscription',
   '{"group":"text"}', 'Gruppering (parstenar, monument). Reserverad för framtida kurering.')
on conflict (code) do nothing;

-- ---------- 6. relationship (kant-tabellen) ----------
create table if not exists public.relationship (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.entity_registry(id) on delete cascade,
  predicate text not null references public.rel_predicates(code),
  object_id uuid not null references public.entity_registry(id) on delete cascade,
  qualifiers jsonb,
  source_ref text,
  confidence text check (confidence in ('certain','probable','possible','contested')),
  created_by text,
  created_at timestamptz not null default now(),
  unique (subject_id, predicate, object_id)
);
create index if not exists relationship_subject_idx on public.relationship(subject_id, predicate);
create index if not exists relationship_object_idx on public.relationship(object_id, predicate);

-- typvalidering: subjekt/objekt måste matcha predikatets typkontrakt
create or replace function public.check_relationship_types() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  s_type text; o_type text; p record;
begin
  select entity_type into s_type from public.entity_registry where id = new.subject_id;
  select entity_type into o_type from public.entity_registry where id = new.object_id;
  select subject_type, object_type into p from public.rel_predicates where code = new.predicate;
  if p.subject_type <> '*' and p.subject_type <> s_type then
    raise exception 'relationship: predikat % kräver subjekt %, fick %', new.predicate, p.subject_type, s_type;
  end if;
  if p.object_type <> '*' and p.object_type <> o_type then
    raise exception 'relationship: predikat % kräver objekt %, fick %', new.predicate, p.object_type, o_type;
  end if;
  return new;
end $$;

drop trigger if exists trg_relationship_typecheck on public.relationship;
create trigger trg_relationship_typecheck
before insert or update on public.relationship
for each row execute function public.check_relationship_types();

-- ---------- 7. RLS (samma mönster som övriga tabeller: publik läsning, admin skriver) ----------
alter table public.entity_registry enable row level security;
alter table public.rel_predicates enable row level security;
alter table public.relationship enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename='entity_registry' and policyname='Public read entity_registry') then
    create policy "Public read entity_registry" on public.entity_registry for select using (true);
    create policy "Admin write entity_registry" on public.entity_registry for all using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where tablename='rel_predicates' and policyname='Public read rel_predicates') then
    create policy "Public read rel_predicates" on public.rel_predicates for select using (true);
    create policy "Admin write rel_predicates" on public.rel_predicates for all using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where tablename='relationship' and policyname='Public read relationship') then
    create policy "Public read relationship" on public.relationship for select using (true);
    create policy "Admin write relationship" on public.relationship for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

drop table if exists _p2_objmap;

commit;
