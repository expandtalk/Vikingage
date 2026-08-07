-- Kontosynk (mobil "Min sida" steg 2): spara användarens val (intresseprofil/persona + Near me-radie)
-- per konto så de följer med mellan enheter. Local-first kvar för utloggade; synk bara för inloggade.
-- Applicerad via MCP; denna fil = repo-spegling. 2026-08-07.
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_preferences enable row level security;

drop policy if exists "user_preferences own select" on public.user_preferences;
drop policy if exists "user_preferences own insert" on public.user_preferences;
drop policy if exists "user_preferences own update" on public.user_preferences;

create policy "user_preferences own select" on public.user_preferences
  for select using (auth.uid() = user_id);
create policy "user_preferences own insert" on public.user_preferences
  for insert with check (auth.uid() = user_id);
create policy "user_preferences own update" on public.user_preferences
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update on public.user_preferences to authenticated;
