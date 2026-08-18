-- Historiska avbildningar av OBJEKT som inte är runstenar: kyrkor (som de såg ut före 1800-talets
-- om-/nybyggnad), klosterruiner, offerlundar/källor, gravhögar, kungar/dynasti — ritade av äldre
-- antikvarier, i första hand Johan Peringskiöld (Monumenta; Ättartal 1725). Runstensteckningar bor
-- kvar i inscription_media; detta är för allt ANNAT han (m.fl.) avbildade.
-- Källkritik: artist/work_ref/källa obligatoriskt; koordinater ur källa eller NULL (aldrig gissade);
-- bild hotlänkas (rehostas aldrig). Endast fria licenser (PD/CC0/CC-BY) lagras.

create table if not exists public.historical_depictions (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('church','cult_site','mound','king','monument','other')),
  title text not null,
  place_name text,
  province text,
  image_url text not null unique,
  artist text,
  work_ref text,
  year text,
  license_code text,
  source_institution text,
  source_url text,
  note text,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);

comment on table public.historical_depictions is
  'Historiska avbildningar av icke-runsten-objekt (kyrkor före ombyggnad, klosterruiner, offerlundar/källor, gravhögar, kungar) — Peringskiöld m.fl. Runstensteckningar ligger i inscription_media.';

create index if not exists historical_depictions_subject_idx on public.historical_depictions (subject_type);

alter table public.historical_depictions enable row level security;

drop policy if exists "historical_depictions public read" on public.historical_depictions;
create policy "historical_depictions public read" on public.historical_depictions for select using (true);

drop policy if exists "historical_depictions admin write" on public.historical_depictions;
create policy "historical_depictions admin write" on public.historical_depictions for all
  using (public.is_admin()) with check (public.is_admin());
