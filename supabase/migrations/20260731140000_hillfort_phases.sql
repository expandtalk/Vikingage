-- Multi-fas/multi-funktion på fornborgar (Daniels poäng: samma borg användes olika över tid —
-- försvar, tillflykt, boplats, handel, kult, boskap, garnison — med långa uppehåll emellan).
-- Endast KÄLLBELAGDA faser fylls; odaterade borgar lämnas tomma (ingen påhittad datering).
create table if not exists hillfort_phases (
  id uuid primary key default gen_random_uuid(),
  hillfort_id uuid not null references swedish_hillforts(id) on delete cascade,
  phase_from integer, phase_to integer,
  function text,                 -- defense | refuge | settlement | trade | cult | livestock | garrison
  description text,
  basis text,                    -- 14C | fynd | typologi | historisk källa
  source text, confidence text default 'medel',
  created_at timestamptz default now()
);
create index if not exists hillfort_phases_fort_idx on hillfort_phases(hillfort_id);

alter table hillfort_phases enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='hillfort_phases' and policyname='hillfort_phases_read') then
    create policy hillfort_phases_read on hillfort_phases for select using (true); end if;
  if not exists (select 1 from pg_policies where tablename='hillfort_phases' and policyname='hillfort_phases_write') then
    create policy hillfort_phases_write on hillfort_phases for all using (is_admin()) with check (is_admin()); end if;
end $$;

-- Fas-medveten aoristisk kurva: kan filtrera på funktion (t.ex. bara defense) för att se
-- när borgarna var i FÖRSVARSbruk (krigshot) vs boplats/tillflykt.
create or replace function hillfort_phase_curve(
  p_function text default null, p_bin integer default 50, p_from integer default -500, p_to integer default 1400)
returns table(bin_start integer, weight numeric, n_phases integer)
language sql stable as $$
  with ph as (
    select phase_from s, phase_to e from hillfort_phases
    where phase_from is not null and phase_to is not null and phase_to > phase_from
      and (p_function is null or function = p_function)
  ),
  bins as (select b as bin_start from generate_series(p_from, p_to - p_bin, p_bin) b)
  select b.bin_start,
    round(coalesce(sum(greatest(0, least(ph.e, b.bin_start+p_bin) - greatest(ph.s, b.bin_start))::numeric
      / nullif(ph.e - ph.s,0)),0),2) as weight,
    count(ph.*) filter (where ph.e > b.bin_start and ph.s < b.bin_start+p_bin)::int as n_phases
  from bins b left join ph on ph.e > b.bin_start and ph.s < b.bin_start+p_bin
  group by b.bin_start order by b.bin_start;
$$;
grant execute on function hillfort_phase_curve(text, integer, integer, integer) to anon, authenticated;
