-- ============================================================================
-- Fas 2-substrat: person↔plats↔intresse-social graf
-- ============================================================================
-- Samtyckesmodell spikad 2026-08-23 (se docs/design/ugc-begrepp-och-platssocialgraf.md §3.5):
--   • Allt opt-in. Default-synlighet = 'aggregate' (anonym; bidrar till k-anonyma räknare,
--     röjer aldrig identitet). 'private' = inte ens aggregat. 'connections'/'members'/'public'
--     höjs aktivt per post.
--   • Person-till-person = DUBBEL OPT-IN via connections (inget delas förrän status='accepted').
--   • Härkomst/förälder-ties får ALDRIG vara matchbara i v1 (tredjepartsskydd + GDPR art. 9) —
--     hårdstoppat av check-constraint.
--   • Aggregat exponeras BARA via place_tie_summary() med k-anonymitet (k=5).
--   • consent_events = bevisbar, återkallelig samtyckeslogg (GDPR art. 7). on delete cascade
--     mot auth.users = radering ("bli glömd") tar bort alla ties/kopplingar.
-- Applicerad i prod 2026-08-23 via SQL (idempotent).
-- ============================================================================

do $$ begin
  if not exists (select 1 from pg_type where typname='place_tie_type') then
    create type public.place_tie_type as enum ('born','raised','school','university','work',
      'ancestry_paternal','ancestry_maternal','parent_mother','parent_father','friend','interest');
  end if;
  if not exists (select 1 from pg_type where typname='tie_visibility') then
    create type public.tie_visibility as enum ('aggregate','private','connections','members','public');
  end if;
  if not exists (select 1 from pg_type where typname='connection_status') then
    create type public.connection_status as enum ('pending','accepted','declined','blocked');
  end if;
  if not exists (select 1 from pg_type where typname='connection_basis') then
    create type public.connection_basis as enum ('shared_place','shared_interest');
  end if;
end $$;

create table if not exists public.consent_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null, version text not null default '1.0',
  granted boolean not null, created_at timestamptz not null default now());

create table if not exists public.user_place_ties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_ref uuid not null, place_kind text not null default 'place_name',
  tie_type public.place_tie_type not null, label text, period_from int, period_to int,
  visibility public.tie_visibility not null default 'aggregate',
  matchable boolean not null default true, note text,
  created_at timestamptz not null default now(),
  constraint upt_ancestry_not_matchable check (
    matchable = false or tie_type not in ('ancestry_paternal','ancestry_maternal','parent_mother','parent_father')));
create index if not exists upt_place_idx on public.user_place_ties(place_ref, tie_type);
create index if not exists upt_user_idx on public.user_place_ties(user_id);

create table if not exists public.user_interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null, entity_id text not null, note text,
  visibility public.tie_visibility not null default 'aggregate',
  created_at timestamptz not null default now(),
  unique (user_id, entity_type, entity_id));
create index if not exists ui_entity_idx on public.user_interests(entity_type, entity_id);

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  basis public.connection_basis not null, basis_ref text,
  status public.connection_status not null default 'pending',
  created_at timestamptz not null default now(), decided_at timestamptz,
  constraint conn_not_self check (requester_id <> addressee_id),
  unique (requester_id, addressee_id, basis, basis_ref));
create index if not exists conn_addressee_idx on public.connections(addressee_id, status);
create index if not exists conn_requester_idx on public.connections(requester_id, status);

alter table public.consent_events enable row level security;
alter table public.user_place_ties enable row level security;
alter table public.user_interests enable row level security;
alter table public.connections enable row level security;

create or replace function public.are_connected(a uuid, b uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists (select 1 from public.connections c where c.status='accepted'
    and ((c.requester_id=a and c.addressee_id=b) or (c.requester_id=b and c.addressee_id=a))); $$;

drop policy if exists ce_sel on public.consent_events;
create policy ce_sel on public.consent_events for select using (user_id = auth.uid());
drop policy if exists ce_ins on public.consent_events;
create policy ce_ins on public.consent_events for insert with check (user_id = auth.uid());

drop policy if exists upt_owner on public.user_place_ties;
create policy upt_owner on public.user_place_ties for all using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists upt_public on public.user_place_ties;
create policy upt_public on public.user_place_ties for select using (visibility='public');
drop policy if exists upt_members on public.user_place_ties;
create policy upt_members on public.user_place_ties for select using (visibility='members' and auth.uid() is not null);
drop policy if exists upt_conn on public.user_place_ties;
create policy upt_conn on public.user_place_ties for select using (visibility='connections' and public.are_connected(auth.uid(), user_id));

drop policy if exists ui_owner on public.user_interests;
create policy ui_owner on public.user_interests for all using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists ui_public on public.user_interests;
create policy ui_public on public.user_interests for select using (visibility='public');
drop policy if exists ui_members on public.user_interests;
create policy ui_members on public.user_interests for select using (visibility='members' and auth.uid() is not null);
drop policy if exists ui_conn on public.user_interests;
create policy ui_conn on public.user_interests for select using (visibility='connections' and public.are_connected(auth.uid(), user_id));

drop policy if exists conn_sel on public.connections;
create policy conn_sel on public.connections for select using (requester_id=auth.uid() or addressee_id=auth.uid());
drop policy if exists conn_ins on public.connections;
create policy conn_ins on public.connections for insert with check (requester_id=auth.uid());
drop policy if exists conn_upd on public.connections;
create policy conn_upd on public.connections for update using (requester_id=auth.uid() or addressee_id=auth.uid());
drop policy if exists conn_del on public.connections;
create policy conn_del on public.connections for delete using (requester_id=auth.uid() or addressee_id=auth.uid());

-- Enda vägen andra ser platskopplingar: aggregat med k-anonymitet (k=5).
create or replace function public.place_tie_summary(p_place_ref uuid)
returns table(tie_type text, n int) language sql stable security definer set search_path=public as $$
  select tie_type::text, count(*)::int from public.user_place_ties
  where place_ref = p_place_ref and visibility <> 'private'
  group by tie_type having count(*) >= 5; $$;
grant execute on function public.place_tie_summary(uuid) to anon, authenticated;
grant execute on function public.are_connected(uuid, uuid) to authenticated;
