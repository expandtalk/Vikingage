-- Persondomän (Wikidata CC0-bas). Personer var en KG-stubbe (1 nod, 0 i sök). Denna tabell bär
-- personfakta; entity_registry får en 'person'-nod per rad (samma id) så KG-relationer funkar
-- (originates_from → parish osv.). "Personer härifrån" löses via birthplace-koordinat mot
-- admin_boundaries. Levande personer: bara notabla offentliga (Wikidata), inga känsliga kategorier,
-- bild endast PD/CC. Proveniens = Wikidata-QID. Se /sv/vetenskapsmetodik + memory person-domain-wikidata.

create table if not exists public.persons (
  id            uuid primary key default gen_random_uuid(),
  wikidata_qid  text unique,
  name          text not null,
  name_sort     text,
  gender        text,                 -- P21 (male/female/other) — för statistik, ej känslig kategori
  birth_year    integer,
  death_year    integer,
  is_living     boolean,
  occupations   text[],               -- P106-etiketter (aggregerade)
  description_sv text,                 -- Wikidata-beskrivning (CC0)
  description_en text,
  image_url     text,                 -- endast PD/CC (Commons) — annars null
  image_license text,
  image_credit  text,
  sitelinks     integer default 0,    -- notabilitetsrank
  birthplace_qid   text,
  birthplace_label text,
  birthplace_lat   double precision,
  birthplace_lng   double precision,
  birthplace_admin text,              -- härledd län/kommun (ST_Contains mot admin_boundaries)
  residence_qid    text,
  residence_label  text,
  citizenship      text,              -- P27 (för universum b)
  viaf   text, libris text, sbl text,
  provenance   text default 'wikidata',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create index if not exists persons_birthplace_gix on public.persons (birthplace_admin);
create index if not exists persons_sitelinks_ix on public.persons (sitelinks desc);
create index if not exists persons_name_trgm on public.persons using gin (name gin_trgm_ops);

alter table public.persons enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='persons' and policyname='persons_public_read') then
    create policy persons_public_read on public.persons for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='persons' and policyname='persons_admin_write') then
    create policy persons_admin_write on public.persons for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

-- KG-predikat för person→plats (originates_from finns redan person→parish; lägg generella).
insert into public.rel_predicates (code, label_sv, label_en, subject_type, object_type, description, version)
values
  ('born_in','född i','born in','person','*','Personens födelseort (Wikidata P19).',1),
  ('lived_in','bosatt i','lived in','person','*','Personens bostads-/verksamhetsort (Wikidata P551/P937).',1)
on conflict (code) do nothing;
