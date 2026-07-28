-- FORSKARDATASET-PRIMITIV (Daniel): en namngiven, attribuerad, versionerad, provenienspårad
-- samling som en forskares egen data BLIR — så den överlever hen (jfr Sölve Göransson, vars
-- hemdata slängdes vid hans död). Referensfall: hans vårdkas-inventering (10 beacon_sites redan
-- i DB, källförda). HÅRT KRAV: korrekt attribution, inget påhitt — biografiska uppgifter flaggas.

create table if not exists public.research_scholars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  affiliation text,
  role_title text,
  active_period text,
  life_status text,             -- aktiv | avliden
  biography text,
  external_ref text,            -- libris/wikidata
  source text,                  -- varifrån uppgifterna kommer (obligatorisk disciplin)
  created_at timestamptz default now()
);

-- Attributions-/samarbetsnät (Göransson ↔ Uppsala-krets ↔ arvtagare). to_scholar_name tillåter
-- länk även när personen inte har egen post (t.ex. son utan registrerat namn) — inget påhittat namn.
create table if not exists public.research_scholar_links (
  id uuid primary key default gen_random_uuid(),
  from_scholar uuid references public.research_scholars(id) on delete cascade,
  to_scholar uuid references public.research_scholars(id) on delete set null,
  to_scholar_name text,
  relation text,                -- collaborated_with | student_of | inherited_by | steward_of
  note text, source text,
  created_at timestamptz default now()
);

create table if not exists public.research_datasets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  scholar_id uuid references public.research_scholars(id),
  source_citation text,         -- exakt källhänvisning
  license text,
  status text not null default 'published',  -- draft | published | archived
  provenance jsonb,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- Polymorf koppling: vilka plattforms-poster som hör till ett dataset (spänner över tabeller).
create table if not exists public.dataset_items (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid references public.research_datasets(id) on delete cascade,
  entity_type text not null,    -- 'beacon_sites','place_names',...
  entity_id uuid not null,
  item_role text default 'primary',
  note text,
  added_at timestamptz default now(),
  unique (dataset_id, entity_type, entity_id)
);

-- Append-only versionshistorik = bevarandet (kan inte "slängas").
create table if not exists public.dataset_revisions (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid references public.research_datasets(id) on delete cascade,
  version int not null,
  changed_by text,
  change_summary text,
  changed_at timestamptz default now()
);

alter table public.research_scholars enable row level security;
alter table public.research_scholar_links enable row level security;
alter table public.research_datasets enable row level security;
alter table public.dataset_items enable row level security;
alter table public.dataset_revisions enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='research_scholars' and policyname='rs_read') then
    create policy rs_read on public.research_scholars for select using (true);
    create policy rsl_read on public.research_scholar_links for select using (true);
    create policy rds_read on public.research_datasets for select using (true);
    create policy dsi_read on public.dataset_items for select using (true);
    create policy dsr_read on public.dataset_revisions for select using (true);
  end if;
end $$;

-- === REFERENSFALL: Sölve Göransson ===
insert into public.research_scholars (id, name, affiliation, role_title, life_status, biography, source)
values ('11111111-1111-1111-1111-1111111111a1'::uuid, 'Sölve Göransson', 'Uppsala universitet', 'docent (historisk geografi)', 'avliden',
  'Verksam i Uppsala, umgicks med en krets historiker. Sommarstuga på Björkenäs strax norr om Kalmar. Mycket egen forskningsdata i hemmet gick förlorad vid hans död. (Biografiska uppgifter: Daniel Larsson, muntligt.)',
  'Publikation: Sölve Göransson 1978, Kalmar Stads Historia 1. Biografiska uppgifter: Daniel Larsson (muntligt).')
on conflict (id) do nothing;

insert into public.research_scholar_links (from_scholar, to_scholar_name, relation, note, source)
values ('11111111-1111-1111-1111-1111111111a1'::uuid, 'Sölve Göranssons son (namn ej registrerat)', 'steward_of',
  'Mycket intresserad av öländsk historia — möjlig förvaltare av faderns material.', 'Daniel Larsson (muntligt).')
on conflict do nothing;

insert into public.research_datasets (id, title, description, scholar_id, source_citation, license, status, provenance)
values ('22222222-2222-2222-2222-2222222222a2'::uuid, 'Ölands vårdkassystem',
  'Inventering av vårdkas-/vårdbötesplatser längs Ölands östra och västra kust samt Kalmarsund.',
  '11111111-1111-1111-1111-1111111111a1'::uuid,
  'Sölve Göransson 1978, Kalmar Stads Historia 1, s. 141', 'Citat/parafras — verkets upphovsrätt gäller', 'published',
  '{"ingest_note":"Digitaliserat ur tryckt källa; koordinater dels ur karta s.141, dels approximativa (forskaren verifierar)."}'::jsonb)
on conflict (id) do nothing;

-- Koppla hans faktiska 10 vårdkas-poster
insert into public.dataset_items (dataset_id, entity_type, entity_id, item_role)
select '22222222-2222-2222-2222-2222222222a2'::uuid, 'beacon_sites', id, 'primary'
from public.beacon_sites where source_uri ilike '%Göransson%'
on conflict do nothing;

insert into public.dataset_revisions (dataset_id, version, changed_by, change_summary)
values ('22222222-2222-2222-2222-2222222222a2'::uuid, 1, 'Daniel Larsson / plattform',
  'Ingest ur Kalmar Stads Historia 1 (s. 141): vårdkasplatser Öland + Kalmarsund.')
on conflict do nothing;
