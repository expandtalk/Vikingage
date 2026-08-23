-- Modern ortsfakta per kommun (folkmängd) — SCB, CC0/öppet. Fyller "ingen info om orten"-luckan
-- (Daniel: Nybro). MODERN fakta, tydligt daterad + källmärkt; blandas ALDRIG med historiska lager.
create table if not exists public.municipality_stats (
  code            text primary key,        -- SCB/Lantmäteri kommunkod (4 siffror), = admin_boundaries.code
  name            text not null,
  population      integer,
  population_year integer,
  source          text default 'SCB',
  updated_at      timestamptz default now()
);
alter table public.municipality_stats enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'municipality_stats' and policyname = 'municipality_stats public read') then
    create policy "municipality_stats public read" on public.municipality_stats for select using (true);
  end if;
end $$;
create index if not exists municipality_stats_name_idx on public.municipality_stats (lower(name));
