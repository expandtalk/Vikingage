-- Kyrkokonst-domän: målare/verkstäder + konstverk kopplade till kyrkor (och ev. runstenar).
-- Modellerar FAKTA (vilken kyrka, vilken konstnär, motiv, datering, tillstånd) — ej verbatim källtext.
-- Applicerad i prod 2026-08-05 via MCP apply_migration (denna fil = repo-spegling).
create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_latin text,
  aka text[],
  artist_type text,            -- målare | verkstad | stenmästare | bildhuggare
  active_from int,
  active_to int,
  origin text,
  wikidata_qid text,
  notes text,
  source text,
  license text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.church_artworks (
  id uuid primary key default gen_random_uuid(),
  church_id uuid references public.ecclesiastical_sites(id) on delete cascade,
  runic_inscription_id uuid references public.runic_inscriptions(id) on delete set null,
  artist_id uuid references public.artists(id) on delete set null,
  artwork_type text not null,  -- kalkmålning | skulptur | altarskåp | dopfunt | predikstol | runsten | glasmålning | inventarium
  title text,
  motif text,
  dating_text text,
  year_from int,
  year_to int,
  material text,
  location_in_church text,
  condition text,              -- t.ex. överkalkad, framtagen 1911, hårt restaurerad
  image_url text,
  image_attribution text,
  source text,
  source_url text,
  license text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_church_artworks_church on public.church_artworks(church_id);
create index if not exists idx_church_artworks_artist on public.church_artworks(artist_id);
create index if not exists idx_church_artworks_runic on public.church_artworks(runic_inscription_id);

alter table public.artists enable row level security;
alter table public.church_artworks enable row level security;

create policy "artists public read" on public.artists for select using (true);
create policy "church_artworks public read" on public.church_artworks for select using (true);
create policy "artists admin write" on public.artists for all using (public.is_admin()) with check (public.is_admin());
create policy "church_artworks admin write" on public.church_artworks for all using (public.is_admin()) with check (public.is_admin());
