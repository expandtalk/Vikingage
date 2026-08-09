-- (a) Stäng anon-skrivning: RLS + publik läsning på solidi/style_windows/wiki_popularity.
--     spatial_ref_sys ägs av PostGIS-tillägget → kunde ej ändras (låg risk, ren SRID-referens).
do $$ declare t text; begin
  foreach t in array array['solidi','style_windows','wiki_popularity','spatial_ref_sys'] loop
    begin
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists %I on public.%I', t||'_public_read', t);
      execute format('create policy %I on public.%I for select using (true)', t||'_public_read', t);
    exception when others then raise notice 'RLS skip %: %', t, sqlerrm; end;
  end loop;
end $$;

-- (b) Osteologi-observationer (per plats, återanvändbar) + Sandby borg-fynden källkritiskt.
create table if not exists osteology_observations (
  id uuid primary key default gen_random_uuid(),
  site_name text not null, hillfort_id uuid references swedish_hillforts(id),
  landscape text, period text, mni integer, mni_note text,
  trauma_n integer, trauma_pct numeric, trauma_summary text,
  demography text, sex_note text, manner_of_death text, taphonomy text,
  season text, time_of_day text, ritual_note text,
  confidence text, source text, source_uri text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table osteology_observations enable row level security;
drop policy if exists "osteology_observations public read" on osteology_observations;
create policy "osteology_observations public read" on osteology_observations for select using (true);
drop policy if exists "osteology_observations admin write" on osteology_observations;
create policy "osteology_observations admin write" on osteology_observations for all using (is_admin()) with check (is_admin());
-- (Sandby-raden infogad via MCP-migration osteology_observations_sandby; se den för fullständiga fält.)
