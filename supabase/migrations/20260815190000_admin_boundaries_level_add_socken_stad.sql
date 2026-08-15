-- Tillåt level 'socken' och 'stad' i admin_boundaries (Lantmäteri "Socken och stad", CC0).
-- Tidigare check tillät bara kommun/lan/rike ("Kommun, län och rike"-produkten).
alter table public.admin_boundaries drop constraint if exists admin_boundaries_level_check;
alter table public.admin_boundaries
  add constraint admin_boundaries_level_check
  check (level in ('kommun', 'lan', 'rike', 'socken', 'stad'));
