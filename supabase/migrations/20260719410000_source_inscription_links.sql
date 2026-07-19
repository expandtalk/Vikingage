-- ============================================================================
-- Fas B: länka litterära källor till inskrifter (sten <-> dikt/saga).
-- Bär den analytiska kopplingen: en runsten AVBILDAR eller ANSPELAR PÅ samma
-- sägenstoff som en eddadikt. Seedar de väletablerade Sigurds-/Völsung- och
-- Tor-scenerna samt Röks gotiska hjälteanspelning.
-- ============================================================================

begin;

create table if not exists public.source_inscription_links (
  id             uuid primary key default gen_random_uuid(),
  source_id      uuid not null references public.historical_sources(id) on delete cascade,
  inscription_id uuid not null references public.runic_inscriptions(id) on delete cascade,
  relation       text not null default 'avbildar'
                   check (relation in ('avbildar','anspelar_på','samma_sägen','nämner')),
  notes          text,
  created_at     timestamptz not null default now(),
  unique (source_id, inscription_id, relation)
);

comment on table public.source_inscription_links is
  'Kopplar historical_sources (eddadikter/sagor) till runic_inscriptions: avbildar | anspelar_på | samma_sägen | nämner.';

create index if not exists sil_inscription_idx on public.source_inscription_links (inscription_id);
create index if not exists sil_source_idx on public.source_inscription_links (source_id);

-- Seed (join på signum + dikttitel, inga hårdkodade uuid).
insert into public.source_inscription_links (source_id, inscription_id, relation, notes)
select s.id, ri.id, v.relation, v.notes
from (values
  ('Sö 101','Sången om Fafner','avbildar','Ramsundsristningen — Sigurd dräper Fafner, steker hjärtat och förstår fåglarna; Regin, Grane och guldet.'),
  ('Sö 101','Sången om Regin','avbildar','Smeden Regin och guldets förbannelse (Andvaranaut).'),
  ('Sö 327','Sången om Fafner','avbildar','Göksten — variant/kopia av Ramsundsristningens Sigurdsbilder.'),
  ('U 1163','Sången om Fafner','avbildar','Drävlestenen — Sigurd genomborrar Fafner underifrån.'),
  ('Gs 19','Sången om Fafner','avbildar','Ockelbostenen — Sigurd steker drakhjärtat (stenen bär även en tavelbräde-scen).'),
  ('U 1161','Kvädet om Hymer','avbildar','Altunastenen — Tor fiskar efter Midgårdsormen med oxhuvud som bete.'),
  ('Ög 136','Sången om Hamder','anspelar_på','Rökstenens Þjóðríkr-strof och hjälteanspelningar rör den gotiska Jörmunrek-cykeln.'),
  ('Ög 136','Gudruns eggelse','anspelar_på','Jörmunrek-cykeln — Gudrun eggar Hamder och Sörle till hämnd.')
) as v(signum, poem_title, relation, notes)
join public.runic_inscriptions ri on ri.signum = v.signum
join public.historical_sources s on s.title = v.poem_title and s.work_type = 'edda_poem'
on conflict (source_id, inscription_id, relation) do nothing;

-- RLS: publik läsning, admin skriver.
alter table public.source_inscription_links enable row level security;
drop policy if exists "sil public read" on public.source_inscription_links;
create policy "sil public read" on public.source_inscription_links for select using (true);
drop policy if exists "sil admin write" on public.source_inscription_links;
create policy "sil admin write" on public.source_inscription_links for all
  using (public.is_admin()) with check (public.is_admin());

grant select on public.source_inscription_links to anon, authenticated;
grant all on public.source_inscription_links to authenticated;

commit;
