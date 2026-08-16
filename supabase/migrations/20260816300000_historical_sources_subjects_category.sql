-- Per-artikel kategorisering för bibliografiska källor (Fornvännen-harvest m.fl.).
-- subjects[] = råa ämnesord/kategorier från källan (DiVA dc:subject); category = härledd plattforms-domän.
alter table public.historical_sources
  add column if not exists subjects text[],
  add column if not exists category text;
create index if not exists idx_historical_sources_category on public.historical_sources(category);
create index if not exists idx_historical_sources_subjects_gin on public.historical_sources using gin(subjects);
comment on column public.historical_sources.subjects is 'Råa ämnesord/kategorier från källan (t.ex. DiVA dc:subject).';
comment on column public.historical_sources.category is 'Härledd plattforms-domän (runologi/ortnamn/numismatik/…).';
