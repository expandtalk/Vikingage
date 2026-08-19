-- Jordebok-lager, FAS 1 = KATALOG (per socken, utlänkat). Jordeböcker är tidigmoderna jordregister
-- (1600–1800-tal) — EN ANNAN källtyp än medeltidsbrev (SDHK). RÄTTIGHETER: scan/transkription rehostas
-- ALDRIG (Riksarkivet/ArkivDigital/hembygd) — vi katalogiserar metadata + länkar ut. Fakta fritt.
create table if not exists public.jordebok_records (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,               -- "Jordebok 1663", "Decimantjordeboken 1651"
  record_type  text default 'jordebok',      -- jordebok | jordrevning | decimantjordebok | mantalslängd
  year_from    integer,
  year_to      integer,
  socken       text,                         -- geografisk knytning (text tills FK säkras)
  harad        text,
  lan          text,
  socken_id    uuid references public.admin_boundaries(id),  -- ST_Contains-koppling när koord finns
  archive      text,                         -- Riksarkivet | Landsarkivet | ArkivDigital | hembygdsförening
  archive_ref  text,                         -- "AID: v98465.b425.s801, NAD: SE/LLA/10880"
  url          text,                         -- UTLÄNK (aldrig rehostat innehåll)
  source_org   text,                         -- vem katalogiserat (t.ex. Misterhults hembygdsförening)
  rights       text default 'link_out',      -- link_out: bara metadata + länk
  note         text,
  created_at   timestamptz default now()
);
create index if not exists jordebok_socken_ix on public.jordebok_records (lower(socken));
create index if not exists jordebok_year_ix on public.jordebok_records (year_from);
alter table public.jordebok_records enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='jordebok_records' and policyname='jordebok_read') then
    create policy jordebok_read on public.jordebok_records for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='jordebok_records' and policyname='jordebok_admin') then
    create policy jordebok_admin on public.jordebok_records for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

-- Referens-fakta (fritt): jordenatur-typerna, för UI-förklaring.
comment on column public.jordebok_records.record_type is
  'jordenatur (ägandeform) förklaras i UI: skatte=självägande bonde · krono=staten · frälse=adel · kyrko/kloster=kyrkan · arv och eget=kungens.';
