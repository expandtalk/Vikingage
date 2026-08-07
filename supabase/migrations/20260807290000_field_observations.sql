-- Fält-registrering för INLOGGADE bidragsgivare (t.ex. arkeologer). Egen nivå ovanför allmänhetens
-- punkt-baserade place_suggestions: riktig GEOMETRI (Point i Fas 1; Line/Polygon i Fas 2 för mur/ruin/
-- försvarsverk), GPS-noggrannhet, författare. GRANSKNING→PROMOTION: 'submitted' → admin verifierar →
-- promotar till heritage_sites med bidragsgivaren krediterad (INGEN GISSNING). Applicerad via MCP; spegling.
create table if not exists public.field_observations (
  id uuid primary key default gen_random_uuid(),
  geom geometry(Geometry, 4326) not null,
  feature_type text not null,
  name text not null,
  description text,
  documentation text,
  gps_accuracy_m double precision,
  submitter_email text,
  created_by uuid default auth.uid(),
  status text not null default 'submitted' check (status in ('draft','submitted','verified','rejected','promoted')),
  admin_notes text,
  promoted_heritage_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists field_observations_geom_gix on public.field_observations using gist (geom);
create index if not exists field_observations_created_by_ix on public.field_observations (created_by);
alter table public.field_observations enable row level security;

drop policy if exists field_obs_insert_auth on public.field_observations;
create policy field_obs_insert_auth on public.field_observations
  for insert to authenticated with check (created_by = auth.uid());
drop policy if exists field_obs_select_own on public.field_observations;
create policy field_obs_select_own on public.field_observations
  for select to authenticated using (created_by = auth.uid() or public.is_admin());
drop policy if exists field_obs_update_own on public.field_observations;
create policy field_obs_update_own on public.field_observations
  for update to authenticated
  using ((created_by = auth.uid() and status in ('draft','submitted')) or public.is_admin())
  with check ((created_by = auth.uid() and status in ('draft','submitted')) or public.is_admin());
drop policy if exists field_obs_admin_delete on public.field_observations;
create policy field_obs_admin_delete on public.field_observations
  for delete to authenticated using (public.is_admin());

-- Klienten skickar lat/lng (GPS) → RPC bygger PostGIS-punkten server-side + sätter created_by=auth.uid().
create or replace function public.submit_field_observation(
  p_lat double precision, p_lng double precision, p_accuracy double precision,
  p_type text, p_name text, p_description text default null, p_documentation text default null
) returns uuid
language plpgsql security invoker set search_path to 'public','extensions'
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Inloggning krävs för att registrera plats'; end if;
  if coalesce(btrim(p_name),'') = '' then raise exception 'Namn krävs'; end if;
  insert into public.field_observations (geom, feature_type, name, description, documentation, gps_accuracy_m, created_by, status)
  values (ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326),
          coalesce(nullif(btrim(p_type),''),'annat'), btrim(p_name),
          nullif(btrim(p_description),''), nullif(btrim(p_documentation),''),
          p_accuracy, auth.uid(), 'submitted')
  returning id into v_id;
  return v_id;
end $$;
grant execute on function public.submit_field_observation(double precision,double precision,double precision,text,text,text,text) to authenticated;
