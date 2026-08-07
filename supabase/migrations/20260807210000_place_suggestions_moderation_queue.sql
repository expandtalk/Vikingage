-- "Föreslå en plats som saknas" (tomt söktillstånd). Förslag = GRANSKNINGSKÖ, ALDRIG live forskningsdata.
-- Kräver dokumentation; koordinat är submitterns förslag och MÅSTE verifieras av admin mot källa före
-- promotion (INGEN GISSNING). RLS: publik får INSERT (föreslå), men inte läsa; admin läser/uppdaterar.
-- Applicerad i prod via MCP; denna fil = repo-spegling. 2026-08-07.
create table if not exists public.place_suggestions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  note text,
  documentation text not null,
  proposed_lat double precision,
  proposed_lng double precision,
  submitter_email text,
  query_context text,
  status text not null default 'pending' check (status in ('pending','verified','rejected','promoted')),
  admin_notes text,
  created_at timestamptz not null default now()
);
alter table public.place_suggestions enable row level security;

drop policy if exists place_suggestions_insert_public on public.place_suggestions;
create policy place_suggestions_insert_public on public.place_suggestions
  for insert to anon, authenticated with check (true);

drop policy if exists place_suggestions_admin_all on public.place_suggestions;
create policy place_suggestions_admin_all on public.place_suggestions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
