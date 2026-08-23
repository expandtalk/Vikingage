-- Riksdag-CV som sajt-data (Daniel: sajtsida med sorterbara + redigerbara kolumner). Ingest av
-- riksdag-cv.csv (350 poster). Härledda fält (studietid/yrkesår) behåller sina not-fält som proveniens.
-- RLS: publik läsning + sortering/filtrering för alla; endast admin kan ÄNDRA (forskningsdata-integritet).
create table if not exists public.riksdag_cv (
  id                   uuid primary key default gen_random_uuid(),
  efternamn            text not null,
  tilltalsnamn         text,
  parti                text,
  valkrets             text,
  fodd_ar              integer,
  examen               text,
  studietid_ar         numeric,
  studietid_not        text,
  yrkesar_ex_politik   numeric,
  yrkesar_totalt       numeric,
  yrkesar_not          text,
  utbildning_raw       text,
  anstallningar_raw    text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.riksdag_cv enable row level security;

drop policy if exists "riksdag_cv public read" on public.riksdag_cv;
create policy "riksdag_cv public read" on public.riksdag_cv for select using (true);

drop policy if exists "riksdag_cv admin write" on public.riksdag_cv;
create policy "riksdag_cv admin write" on public.riksdag_cv for all
  using (public.is_admin()) with check (public.is_admin());

create index if not exists riksdag_cv_parti_idx on public.riksdag_cv (parti);
create index if not exists riksdag_cv_efternamn_idx on public.riksdag_cv (efternamn);
