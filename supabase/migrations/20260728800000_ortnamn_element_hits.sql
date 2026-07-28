-- Verifierings-vy för ortnamns-kluster (Daniel/Agneta): varje faktisk namnträff per led, så
-- forskaren kan skilja KULT från HOMONYM (get→Getingsta, ed→'näs' osv). Bara accepterade räknas.
create table if not exists public.ortnamn_element_hits (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  element_key text not null,
  place_name text not null,
  lat double precision, lng double precision,
  near_node boolean default false,     -- inom radie från en centralort (räknas i anrikningen)
  sol_note text,                       -- ortnamnsregister/SOL-uppslag där sådant finns
  verdict text,                        -- null=ogranskad | 'cult' | 'homonym'
  verified_by text, note text,
  created_at timestamptz default now(),
  unique (region, element_key, place_name, lat)
);
alter table public.ortnamn_element_hits enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='ortnamn_element_hits' and policyname='oeh_read') then
    create policy oeh_read on public.ortnamn_element_hits for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='ortnamn_element_hits' and policyname='oeh_write') then
    create policy oeh_write on public.ortnamn_element_hits for all
      using (exists (select 1 from public.user_roles ur where ur.user_id=auth.uid() and ur.role::text in ('admin','editor')))
      with check (exists (select 1 from public.user_roles ur where ur.user_id=auth.uid() and ur.role::text in ('admin','editor')));
  end if;
end $$;

-- Gransknings-vy: träffar + ledets gradering + forskarens tolkning (config.note) för jämförelse.
create or replace view public.v_ortnamn_hit_review as
  select h.id, h.region, h.element_key, cfg.label, cfg.category, cfg.strength, cfg.owner,
         cfg.note as interpretation, h.place_name, h.lat, h.lng, h.near_node, h.sol_note, h.verdict
  from public.ortnamn_element_hits h
  left join public.ortnamn_element_config cfg on cfg.element_key = h.element_key
  order by h.element_key, h.place_name;
