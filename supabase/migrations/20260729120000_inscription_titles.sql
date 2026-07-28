-- Titel-/yrkeslager ur runcorpusen. Populeras av scripts/data/ingest-inscription-titles.mjs
-- (disambiguerat: scannar FORNNORDISK normalisering i första hand → undviker "bryter"/"god"-fel).
create table if not exists public.inscription_titles (
  id             uuid primary key default gen_random_uuid(),
  inscription_id uuid references public.runic_inscriptions(id) on delete cascade,
  signum         text,
  title_code     text not null,     -- thegn | drengr | jarl | smidr | gildi | styrimadr …
  label_sv       text,
  category       text,              -- honorific | rank | craft | naval | administrative | servile | cultic | landholding
  confidence     text,              -- certain (normalisering) | probable (översättning)
  source         text,
  created_at     timestamptz default now(),
  unique (inscription_id, title_code)
);
create index if not exists inscription_titles_code_idx on public.inscription_titles(title_code);
comment on table public.inscription_titles is 'Titlar/befattningar/yrken belagda i runcorpusen, disambiguerat ur normalisering. Få till antalet — stenar hyllar status/släkt/resor, inte yrken.';
alter table public.inscription_titles enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='inscription_titles' and policyname='inscription_titles_public_read') then
    create policy inscription_titles_public_read on public.inscription_titles for select using (true);
  end if;
end $$;

insert into public.ontology_entity_types
  (code, label_sv, label_en, physical_table, id_column, coord_kind, provenance_columns, status, description)
values ('inscription_title','Runstens-titel','Runic title','inscription_titles','id','via_site','confidence,source','active',
  'Titel/befattning/yrke belagt i en runinskrift (þegn, drengr, jarl, smiðr, gildi…). Disambiguerat ur normalisering.')
on conflict (code) do nothing;
