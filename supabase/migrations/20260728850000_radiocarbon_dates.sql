-- Strukturerat 14C-hem för fornborgar (och andra platser) — separat från dating_argument,
-- som är rock-art-apparaten med palimpsest-vakt. Generell, polymorf, ärlig proveniens.
create table if not exists public.radiocarbon_dates (
  id            uuid primary key default gen_random_uuid(),
  object_type   text,                 -- 'hillfort' | 'heritage_site' | 'grave' …
  object_id     uuid,                 -- polymorf → swedish_hillforts.id m.fl.
  site_name     text,
  lab_code      text,                 -- null om ej publicerat
  uncal_bp      integer,              -- okalibrerat BP (null om ej publicerat)
  uncal_sd      integer,
  cal_from      integer,              -- kalibrerat e.Kr. (negativt = f.Kr.)
  cal_to        integer,
  cal_sigma     text,                 -- '95,4 %'
  calibration   text,                 -- kurva/mjukvara
  material      text,                 -- seed | bone | charcoal …
  target_event  text,                 -- use | organism_death | construction …
  context       text,                 -- fyndkontext (hus/lager/ring)
  source        text,
  note          text,
  created_at    timestamptz default now()
);
comment on table public.radiocarbon_dates is '14C-dateringar (single source of truth), polymorft kopplade till plats/objekt. Skild från dating_argument (hällristnings-apparat med palimpsest-vakt).';
alter table public.radiocarbon_dates enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='radiocarbon_dates' and policyname='radiocarbon_dates_public_read') then
    create policy radiocarbon_dates_public_read on public.radiocarbon_dates for select using (true);
  end if;
end $$;

-- Träby borgs två 14C.
insert into public.radiocarbon_dates
  (object_type, object_id, site_name, lab_code, uncal_bp, uncal_sd, cal_from, cal_to, cal_sigma,
   calibration, material, target_event, context, source, note)
values
 ('hillfort','39413875-c3a3-4180-b2dd-7d208981a5aa','Träby borg', null, null, null, 418, 538, '95,4 %',
  'IntCal20 (Reimer et al. 2020) / OxCal (Bronk Ramsey 2021)', 'seed', 'use',
  'Förkolnat sädeskorn, nedgrävning K86, hus M24a, mellersta ringen (byggd först)',
  'Papmehl-Dufay & Isaksson 2025 (Rapporter från AFL nr 42)',
  'Daterar aktivitet/hantering — ej nödvändigtvis lokal odling (borgen tolkas icke-boplats).'),
 ('hillfort','39413875-c3a3-4180-b2dd-7d208981a5aa','Träby borg', null, null, null, 430, 559, '95,4 %',
  'IntCal20 (Reimer et al. 2020) / OxCal (Bronk Ramsey 2021)', 'bone', 'organism_death',
  'Människorörben, hus O11, östra ringen (Frykmans undersökning 1966, ombearbetat)',
  'Papmehl-Dufay & Isaksson 2025 (Rapporter från AFL nr 42)',
  'En individs dödsår ≠ platsens övergivande; möjligt mer dramatiskt förlopp (jfr Sandby borg). Intervallen överlappar sädeskornets (418–538) → inget daterbart gap dem emellan.')
on conflict do nothing;

-- Registrera i ontologin.
insert into public.ontology_entity_types
  (code, label_sv, label_en, physical_table, id_column, coord_kind, provenance_columns, status, description)
values ('radiocarbon_date','14C-datering','Radiocarbon date','radiocarbon_dates','id','via_site','lab_code,calibration,source','active',
  '14C-datering polymorft kopplad till plats/objekt. Bär lab/kalibrering/material/kontext. Skild från dating_argument (hällristnings-apparat).')
on conflict (code) do nothing;
