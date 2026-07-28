-- Äganderätt + governance på intresseprofiler (Daniel: Wikipedia-likt PÅ SIKT, men DU beslutar
-- tills organisationen finns). Modell: systemprofiler (vi/kurerade) + personliga (owner) +
-- föreslagna (pending → admin godkänner till public). Admin = is_admin() = den beslutande.
alter table public.explore_profiles
  add column if not exists owner_id uuid,                                  -- null = systemprofil
  add column if not exists visibility text not null default 'system',      -- system | private | public
  add column if not exists review_status text not null default 'approved', -- approved | pending | rejected
  add column if not exists submitted_by uuid,
  add column if not exists reviewed_by uuid,
  add column if not exists updated_at timestamptz default now();

-- Befintliga 10 = systemprofiler, godkända.
update public.explore_profiles set visibility='system', review_status='approved', owner_id=null
 where visibility is null or visibility='system';

-- RLS: läs system/public för alla; ägaren ser/ändrar sina egna; admin (Daniel) ser & godkänner allt.
alter table public.explore_profiles enable row level security;
drop policy if exists ep_read on public.explore_profiles;
create policy ep_read on public.explore_profiles for select using (
  visibility in ('system','public') or owner_id = auth.uid() or public.is_admin()
);
drop policy if exists ep_insert_own on public.explore_profiles;
create policy ep_insert_own on public.explore_profiles for insert
  with check (owner_id = auth.uid() and visibility in ('private','public'));
drop policy if exists ep_update_own on public.explore_profiles;
create policy ep_update_own on public.explore_profiles for update
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists ep_delete_own on public.explore_profiles;
create policy ep_delete_own on public.explore_profiles for delete using (owner_id = auth.uid());
-- Governance: admin får allt (godkänna pending → public, redigera systemprofiler, moderera).
drop policy if exists ep_admin_all on public.explore_profiles;
create policy ep_admin_all on public.explore_profiles for all
  using (public.is_admin()) with check (public.is_admin());

comment on column public.explore_profiles.visibility is
  'system=kurerad av plattformen; private=personlig; public=delad (kräver admin-godkännande via review_status).';
