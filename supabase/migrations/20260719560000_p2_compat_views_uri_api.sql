-- P2.3: Kompat-vyer + äkta URI-kedja + frågeyta v1 (granskningskrav K1).
--  * Gamla länktabeller → VYER över relationship (läsare oförändrade, ingen dubbeldata).
--    Originalen döps om till _retired_* (rollback: byt tillbaka namnen).
--  * carver_inscription-vyn behåller bytea+enum-form → befintliga RPC:er/hooks fungerar.
--  * INSTEAD OF-triggers: INSERT/DELETE via vyerna skriver till relationship (ingen drift).
--  * inscription_uri: ÄKTA inskrift→URI ur rundata object_uri (ersätter reference_uri-
--    workaroundens IK-katalog-fel; frontend-hook byts separat).
--  * get_entity_v1 / neighbors_v1: grafens frågeyta (används av app + AI-agenter).
-- Idempotent via guards.

begin;

-- ---------- 1. Pensionera gamla länktabeller → vyer ----------
do $$
begin
  if exists (select 1 from pg_tables where schemaname='public' and tablename='theme_links') then
    alter table public.theme_links rename to _retired_theme_links;
    alter table public.king_inscription_links rename to _retired_king_inscription_links;
    alter table public.source_inscription_links rename to _retired_source_inscription_links;
    alter table public.carver_inscription rename to _retired_carver_inscription;
  end if;
end $$;

create or replace view public.theme_links as
select rel.id, rel.object_id as theme_id, er.entity_type, rel.subject_id as entity_id,
       rel.qualifiers->>'notes' as notes, rel.created_at
from public.relationship rel
join public.entity_registry er on er.id = rel.subject_id
where rel.predicate = 'has_theme';

create or replace view public.king_inscription_links as
select rel.id, rel.object_id as king_id, rel.subject_id as inscription_id,
       rel.qualifiers->>'connection_type' as connection_type,
       rel.qualifiers->>'evidence_strength' as evidence_strength,
       rel.qualifiers->>'notes' as analysis_notes, rel.created_at
from public.relationship rel where rel.predicate = 'mentions_person';

create or replace view public.source_inscription_links as
select rel.id, rel.subject_id as source_id, rel.object_id as inscription_id,
       rel.qualifiers->>'relation' as relation,
       rel.qualifiers->>'notes' as notes, rel.created_at
from public.relationship rel where rel.predicate = 'mentions_inscription';

create or replace view public.carver_inscription as
select
  decode(replace(rel.id::text,'-',''),'hex') as carverinscriptionid,
  decode(replace(rel.object_id::text,'-',''),'hex') as carverid,
  decode(replace(rel.subject_id::text,'-',''),'hex') as inscriptionid,
  (replace(rel.qualifiers->>'attribution','_',' '))::public.attribution_type as attribution,
  coalesce((rel.qualifiers->>'certainty')::boolean, rel.confidence='certain') as certainty,
  rel.qualifiers->>'notes' as notes,
  coalesce(rel.qualifiers->>'lang','sv') as lang,
  rel.created_at, rel.created_at as updated_at
from public.relationship rel where rel.predicate = 'carved_by';

-- ---------- 2. Skrivstöd via vyerna (INSTEAD OF → relationship) ----------
create or replace function public.theme_links_write() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence)
    values (new.entity_id, 'has_theme', new.theme_id,
            jsonb_strip_nulls(jsonb_build_object('notes', new.notes)), 'kurerad (via theme_links-vy)', 'certain')
    on conflict (subject_id, predicate, object_id) do nothing;
    return new;
  elsif tg_op = 'DELETE' then
    delete from relationship where subject_id = old.entity_id and predicate = 'has_theme' and object_id = old.theme_id;
    return old;
  end if;
  raise exception 'UPDATE via theme_links-vyn stöds ej — skriv mot relationship direkt';
end $$;
drop trigger if exists trg_theme_links_write on public.theme_links;
create trigger trg_theme_links_write instead of insert or update or delete on public.theme_links
for each row execute function public.theme_links_write();

create or replace function public.king_links_write() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence)
    values (new.inscription_id, 'mentions_person', new.king_id,
            jsonb_strip_nulls(jsonb_build_object('connection_type', new.connection_type,
              'evidence_strength', new.evidence_strength, 'notes', new.analysis_notes)),
            'kurerad (via king_inscription_links-vy)',
            case new.evidence_strength when 'strong' then 'certain' when 'contested' then 'contested' else 'probable' end)
    on conflict (subject_id, predicate, object_id) do nothing;
    return new;
  elsif tg_op = 'DELETE' then
    delete from relationship where subject_id = old.inscription_id and predicate = 'mentions_person' and object_id = old.king_id;
    return old;
  end if;
  raise exception 'UPDATE via king_inscription_links-vyn stöds ej — skriv mot relationship direkt';
end $$;
drop trigger if exists trg_king_links_write on public.king_inscription_links;
create trigger trg_king_links_write instead of insert or update or delete on public.king_inscription_links
for each row execute function public.king_links_write();

create or replace function public.source_links_write() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence)
    values (new.source_id, 'mentions_inscription', new.inscription_id,
            jsonb_strip_nulls(jsonb_build_object('relation', new.relation, 'notes', new.notes)),
            'kurerad (via source_inscription_links-vy)', 'certain')
    on conflict (subject_id, predicate, object_id) do nothing;
    return new;
  elsif tg_op = 'DELETE' then
    delete from relationship where subject_id = old.source_id and predicate = 'mentions_inscription' and object_id = old.inscription_id;
    return old;
  end if;
  raise exception 'UPDATE via source_inscription_links-vyn stöds ej — skriv mot relationship direkt';
end $$;
drop trigger if exists trg_source_links_write on public.source_inscription_links;
create trigger trg_source_links_write instead of insert or update or delete on public.source_inscription_links
for each row execute function public.source_links_write();

create or replace function public.carver_inscription_write() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_subj uuid; v_obj uuid;
begin
  if tg_op = 'INSERT' then
    v_subj := (substr(encode(new.inscriptionid,'hex'),1,8)||'-'||substr(encode(new.inscriptionid,'hex'),9,4)||'-'||
               substr(encode(new.inscriptionid,'hex'),13,4)||'-'||substr(encode(new.inscriptionid,'hex'),17,4)||'-'||
               substr(encode(new.inscriptionid,'hex'),21,12))::uuid;
    v_obj  := (substr(encode(new.carverid,'hex'),1,8)||'-'||substr(encode(new.carverid,'hex'),9,4)||'-'||
               substr(encode(new.carverid,'hex'),13,4)||'-'||substr(encode(new.carverid,'hex'),17,4)||'-'||
               substr(encode(new.carverid,'hex'),21,12))::uuid;
    insert into relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence)
    values (v_subj, 'carved_by', v_obj,
            jsonb_strip_nulls(jsonb_build_object('attribution', replace(new.attribution::text,' ','_'),
              'certainty', new.certainty, 'notes', new.notes, 'lang', new.lang)),
            'kurerad (via carver_inscription-vy)',
            case new.attribution::text when 'signed' then 'certain' when 'attributed' then 'probable' else 'possible' end)
    on conflict (subject_id, predicate, object_id) do nothing;
    return new;
  elsif tg_op = 'DELETE' then
    delete from relationship where predicate = 'carved_by'
      and replace(subject_id::text,'-','') = encode(old.inscriptionid,'hex')
      and replace(object_id::text,'-','') = encode(old.carverid,'hex');
    return old;
  end if;
  raise exception 'UPDATE via carver_inscription-vyn stöds ej — skriv mot relationship direkt';
end $$;
drop trigger if exists trg_carver_inscription_write on public.carver_inscription;
create trigger trg_carver_inscription_write instead of insert or update or delete on public.carver_inscription
for each row execute function public.carver_inscription_write();

-- ---------- 3. Äkta inskrift→URI (ersätter reference_uri-workaroundens fel) ----------
create table if not exists public.inscription_uri (
  inscription_id uuid not null references public.runic_inscriptions(id) on delete cascade,
  uri text not null,
  source_ref text not null default 'rundata 2020-11-29 (object_uri)',
  created_at timestamptz not null default now(),
  primary key (inscription_id, uri)
);
alter table public.inscription_uri enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where tablename='inscription_uri' and policyname='Public read inscription_uri') then
    create policy "Public read inscription_uri" on public.inscription_uri for select using (true);
    create policy "Admin write inscription_uri" on public.inscription_uri for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

insert into public.inscription_uri (inscription_id, uri)
select distinct r.id, u.uri
from rundata_raw.object_uri ou
join public.runic_inscriptions r on r.rundata_objectid = ou.objectid
join rundata_raw.uris u on u.uriid = ou.uriid
on conflict do nothing;

-- ---------- 4. Frågeyta v1 ----------
create or replace function public.get_entity_v1(p_id uuid default null, p_signum text default null)
returns jsonb language sql stable as $$
  with target as (
    select er.* from public.entity_registry er
    where er.id = coalesce(p_id,
      (select id from public.runic_inscriptions
       where signum = p_signum or primary_signum = p_signum limit 1))
  )
  select jsonb_build_object(
    'entity', (select jsonb_build_object('id', t.id, 'type', t.entity_type, 'label', t.label) from target t),
    'edges_out', coalesce((
      select jsonb_agg(jsonb_build_object(
        'predicate', rel.predicate, 'label_sv', rp.label_sv,
        'target', jsonb_build_object('id', er2.id, 'type', er2.entity_type, 'label', er2.label),
        'qualifiers', rel.qualifiers, 'confidence', rel.confidence, 'source_ref', rel.source_ref))
      from public.relationship rel
      join target t on rel.subject_id = t.id
      join public.entity_registry er2 on er2.id = rel.object_id
      join public.rel_predicates rp on rp.code = rel.predicate), '[]'::jsonb),
    'edges_in', coalesce((
      select jsonb_agg(jsonb_build_object(
        'predicate', rel.predicate, 'label_sv', rp.label_sv,
        'source', jsonb_build_object('id', er2.id, 'type', er2.entity_type, 'label', er2.label),
        'qualifiers', rel.qualifiers, 'confidence', rel.confidence, 'source_ref', rel.source_ref))
      from public.relationship rel
      join target t on rel.object_id = t.id
      join public.entity_registry er2 on er2.id = rel.subject_id
      join public.rel_predicates rp on rp.code = rel.predicate), '[]'::jsonb));
$$;

create or replace function public.neighbors_v1(p_id uuid, p_predicate text default null)
returns table (entity_id uuid, entity_type text, label text, predicate text, direction text, confidence text)
language sql stable as $$
  select er.id, er.entity_type, er.label, rel.predicate, 'out'::text, rel.confidence
  from public.relationship rel join public.entity_registry er on er.id = rel.object_id
  where rel.subject_id = p_id and (p_predicate is null or rel.predicate = p_predicate)
  union all
  select er.id, er.entity_type, er.label, rel.predicate, 'in'::text, rel.confidence
  from public.relationship rel join public.entity_registry er on er.id = rel.subject_id
  where rel.object_id = p_id and (p_predicate is null or rel.predicate = p_predicate);
$$;

commit;
