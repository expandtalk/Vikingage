-- Intresseprofiler för Explore-vyn: config-rattar per profil (maskineriet bor i kod).
create table if not exists public.explore_profiles (
  id text primary key,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  label jsonb not null,
  description jsonb not null default '{}'::jsonb,
  config jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.explore_profiles enable row level security;

drop policy if exists "explore_profiles public read" on public.explore_profiles;
create policy "explore_profiles public read"
  on public.explore_profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "explore_profiles admin insert" on public.explore_profiles;
create policy "explore_profiles admin insert"
  on public.explore_profiles for insert
  to authenticated
  with check (is_admin());

drop policy if exists "explore_profiles admin update" on public.explore_profiles;
create policy "explore_profiles admin update"
  on public.explore_profiles for update
  to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists "explore_profiles admin delete" on public.explore_profiles;
create policy "explore_profiles admin delete"
  on public.explore_profiles for delete
  to authenticated
  using (is_admin());

insert into public.explore_profiles (id, sort_order, is_active, label, description, config) values
('explore', 0, true,
 '{"sv":"Utforska","en":"Explore"}',
 '{"sv":"Balanserat läge för allmän utforskning","en":"Balanced mode for general exploration"}',
 '{"icon":"monitor","basemap":"osm","theme":"neutral","defaultPeriod":"all","showTimeline":true,"primaryLayers":["runic_inscriptions"],"layers":{"runic_inscriptions":true,"religious_places":true,"viking_fortresses":true},"panels":{"legend":{"visible":true},"results":{"visible":false},"search":{"visible":false},"filters":{"visible":true,"emphasis":"minimized"}}}'),
('geographer', 1, true,
 '{"sv":"Kulturgeograf","en":"Cultural Geographer"}',
 '{"sv":"Landskapet som system — polygoner och nätverk","en":"The landscape as a system — polygons and networks"}',
 '{"icon":"globe","basemap":"terrain","theme":"earth","defaultPeriod":"all","showTimeline":true,"primaryLayers":["hundreds","parishes","viking_regions","river_routes"],"layers":{"runic_inscriptions":true,"viking_regions":true,"hundreds":true,"parishes":true,"folk_groups":true,"river_routes":true,"trade_routes":true,"viking_roads":true,"viking_cities":true},"panels":{"legend":{"visible":true},"results":{"visible":false},"search":{"visible":false},"filters":{"visible":false}}}'),
('linguist', 2, true,
 '{"sv":"Lingvist","en":"Linguist"}',
 '{"sv":"Ortnamn som distributionsmönster","en":"Place names as distribution patterns"}',
 '{"icon":"microscope","basemap":"light","theme":"typology","defaultPeriod":"all","showTimeline":false,"primaryLayers":["place_names","runic_inscriptions"],"layers":{"place_names":true,"carvers":true,"gods":true,"runic_inscriptions":true},"panels":{"legend":{"visible":true},"results":{"visible":true,"emphasis":"primary"},"search":{"visible":false},"filters":{"visible":true,"emphasis":"primary"}}}'),
('archaeologist', 3, true,
 '{"sv":"Arkeolog","en":"Archaeologist"}',
 '{"sv":"Högupplöst punktdata och fornlämningar","en":"High-precision point data and monuments"}',
 '{"icon":"shovel","basemap":"terrain","theme":"chronology","defaultPeriod":"all","showTimeline":true,"primaryLayers":["archaeological_sites","runic_inscriptions"],"layers":{"archaeological_sites":true,"archaeological_finds":true,"viking_fortresses":true,"runic_inscriptions":true,"battle_sites":true},"panels":{"legend":{"visible":true},"results":{"visible":true},"search":{"visible":false},"filters":{"visible":true}}}'),
('trade', 4, true,
 '{"sv":"Handelshistoriker","en":"Trade Historian"}',
 '{"sv":"Flöden, emporier och farleder","en":"Flows, emporia and waterways"}',
 '{"icon":"ship","basemap":"osm","theme":"flow","defaultPeriod":"viking_age","showTimeline":true,"primaryLayers":["trade_routes","viking_cities","river_routes"],"layers":{"trade_routes":true,"viking_cities":true,"river_routes":true,"water_routes":true,"valdemar_route":true,"stake_barriers":true},"panels":{"legend":{"visible":true},"results":{"visible":false},"search":{"visible":false},"filters":{"visible":true,"emphasis":"minimized"}}}'),
('geneticist', 5, true,
 '{"sv":"Genetiker","en":"Geneticist"}',
 '{"sv":"Provplatser och gravkontext","en":"Sample sites and grave context"}',
 '{"icon":"dna","basemap":"osm","theme":"genetic","defaultPeriod":"all","showTimeline":true,"primaryLayers":["archaeological_sites"],"layers":{"archaeological_sites":true,"runic_inscriptions":true},"panels":{"legend":{"visible":true},"results":{"visible":true,"emphasis":"primary"},"search":{"visible":false},"filters":{"visible":true,"emphasis":"minimized"}}}')
on conflict (id) do update set
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  label = excluded.label,
  description = excluded.description,
  config = excluded.config,
  updated_at = now();
