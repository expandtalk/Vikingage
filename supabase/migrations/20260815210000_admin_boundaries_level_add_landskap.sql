-- Tillåt level 'landskap' i admin_boundaries (Sveriges landskap, geometri från OSM via Wikidata).
alter table public.admin_boundaries drop constraint if exists admin_boundaries_level_check;
alter table public.admin_boundaries
  add constraint admin_boundaries_level_check
  check (level in ('kommun', 'lan', 'rike', 'socken', 'stad', 'landskap'));
