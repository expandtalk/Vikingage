-- Generaliserad vattenleds-/handelsledsmodell. Valdemars segelled migreras in som EN route
-- bland flera; östleden (Rus-floderna) läggs ovanpå. Punkterna bär paleo-hydrografisk
-- valideringsstatus (låg vid routens datum? nu på land?) mot paleo_shorelines.
create table if not exists trade_routes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  route_kind text,                 -- segelled | flodled | handelsled | isväg
  orientation text,                -- kust | öst | väst | inre
  year_from integer, year_to integer,
  description text,
  source text, license text, link text,
  created_at timestamptz default now()
);

create table if not exists trade_route_points (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references trade_routes(id) on delete cascade,
  seq integer not null,
  name text not null,
  lat double precision, lng double precision,
  geom geometry(Point,4326) generated always as (
    case when lat is not null and lng is not null then ST_SetSRID(ST_MakePoint(lng,lat),4326) end) stored,
  point_kind text,                 -- stad | hamn | lotsstation | portage | vad | waypoint | landmärke
  is_major boolean default false,
  section text,
  description text,
  -- paleo-hydrografisk validering mot paleo_shorelines vid routens datum:
  shoreline_status text,           -- water | shore | inland | outside_model | unchecked
  shoreline_note text,
  source text,
  created_at timestamptz default now()
);
create index if not exists trade_route_points_route_idx on trade_route_points(route_id, seq);
create index if not exists trade_route_points_geom_idx on trade_route_points using gist(geom);

alter table trade_routes enable row level security;
alter table trade_route_points enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='trade_routes' and policyname='trade_routes_read') then
    create policy trade_routes_read on trade_routes for select using (true); end if;
  if not exists (select 1 from pg_policies where tablename='trade_routes' and policyname='trade_routes_write') then
    create policy trade_routes_write on trade_routes for all using (is_admin()) with check (is_admin()); end if;
  if not exists (select 1 from pg_policies where tablename='trade_route_points' and policyname='trade_route_points_read') then
    create policy trade_route_points_read on trade_route_points for select using (true); end if;
  if not exists (select 1 from pg_policies where tablename='trade_route_points' and policyname='trade_route_points_write') then
    create policy trade_route_points_write on trade_route_points for all using (is_admin()) with check (is_admin()); end if;
end $$;
