-- Landmärkes-bilder (byggnader/monument) som HOTLÄNK — den bildklass plattformen saknade helt
-- (entity_answer_context hämtade bara runstensfoton nära centrum → "sök Kalmar" gav Öland-runstenar).
-- Pilot: Kalmar slott, Kalmar domkyrka, medeltida stadsmuren. Källa = Wikimedia Commons (aggregerar
-- länsmuseers + allmänhetens foton med maskinläsbar licens), ankrat på Wikidata (Q-id + P625-koordinat
-- där sådan finns). HOTLÄNKAS ALLTID, rehostas ALDRIG (jfr raa-aerial-photo-licensing). Endast fria
-- licenser (PD/CC0/CC-BY/CC-BY-SA); NC/ND avvisas i ingest-scriptet.
-- KÄLLKRITIK: koordinat = Wikidata P625 (verifierad) för slott/domkyrka; stadsmuren saknar Wikidata-post
-- → lat/lng NULL (gissas ALDRIG), ytar via place_context='Kalmar'.

create table if not exists public.landmark_images (
  id uuid primary key default gen_random_uuid(),
  landmark_key text not null,          -- 'kalmar-slott' | 'kalmar-domkyrka' | 'kalmar-stadsmur'
  landmark_name text not null,         -- 'Kalmar slott'
  category text,                       -- 'castle' | 'cathedral' | 'city_wall'
  place_context text,                  -- 'Kalmar' — ytning för entitet/plats i söksvaret
  wikidata_id text,                    -- proveniens (Q648226 …), null om ingen post
  commons_category text,               -- exakt Commons-kategori bilden hämtades ur
  lat double precision,
  lng double precision,
  geom geometry(Point, 4326) generated always as (
    case when lat is not null and lng is not null
         then st_setsrid(st_makepoint(lng, lat), 4326) end
  ) stored,
  image_url text not null unique,      -- hotlänk till original (Commons) — rehostas ALDRIG
  descr_url text,                      -- Commons-filsidan (proveniens/attribuering)
  title text,
  caption text,
  photographer text,                   -- Artist ur Commons-metadata
  license_code text,                   -- PD | CC0 | CC-BY | CC-BY-SA
  license_url text,
  source_institution text default 'Wikimedia Commons',
  created_at timestamptz default now()
);

create index if not exists idx_landmark_images_geom on public.landmark_images using gist (geom);
create index if not exists idx_landmark_images_place on public.landmark_images (lower(place_context));

alter table public.landmark_images enable row level security;
drop policy if exists "landmark_images public read" on public.landmark_images;
create policy "landmark_images public read" on public.landmark_images for select using (true);
-- Skrivning bara för admin (samma mönster som övriga tabeller).
drop policy if exists "landmark_images admin write" on public.landmark_images;
create policy "landmark_images admin write" on public.landmark_images for all
  using (public.is_admin()) with check (public.is_admin());
