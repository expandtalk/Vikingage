-- Plats-historik per runinskrift: ursprunglig → mellanled → nuvarande plats. Många runstenar
-- har flyttats (Sm 144 flera gånger). runic_inscriptions.coordinates = nuvarande visningspunkt;
-- den fulla flytthistoriken ligger här. Koordinater sätts BARA där de är verifierade.
create table if not exists public.inscription_locations (
  id             uuid primary key default gen_random_uuid(),
  inscription_id uuid references public.runic_inscriptions(id) on delete cascade,
  signum         text,
  role           text,          -- 'original' | 'former' | 'current'
  seq            integer,       -- ordning i flytthistoriken (0 = ursprunglig)
  place_name     text,
  parish         text,
  lat            double precision,   -- null om overifierad
  lng            double precision,
  from_year      integer,       -- stod här från (om känt)
  to_year        integer,       -- till (om känt)
  moved_year     integer,       -- flyttades härifrån (om känt)
  certainty      text check (certainty = any (array['certain','probable','possible','unknown'])),
  source         text,
  note           text,
  created_at     timestamptz default now()
);
create index if not exists inscription_locations_insc_idx on public.inscription_locations(inscription_id);
comment on table public.inscription_locations is 'Plats-historik per runinskrift (ursprunglig/mellanled/nuvarande). Koordinat null = overifierad. Skild från runic_inscriptions.coordinates (nuvarande visningspunkt).';
alter table public.inscription_locations enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='inscription_locations' and policyname='inscription_locations_public_read') then
    create policy inscription_locations_public_read on public.inscription_locations for select using (true);
  end if;
end $$;

-- Sm 144: Gursten (vägskäl vid gravfält, Lofta) → Nygårds park (~1880) → Gamleby folkhögskola.
with i as (select id from public.runic_inscriptions where signum='Sm 144')
insert into public.inscription_locations
  (inscription_id, signum, role, seq, place_name, parish, lat, lng, from_year, to_year, moved_year, certainty, source, note)
select i.id, 'Sm 144', v.role, v.seq, v.place_name, v.parish, v.lat, v.lng, v.from_year, v.to_year, v.moved_year, v.certainty, v.source, v.note
from i cross join (values
  ('original', 0, 'Gursten — vägskäl vid gravfält', 'Lofta', 57.9378847::float8, 16.4055926::float8, null::int, null::int, 1880::int, 'possible', 'place_names (Gursten); Länsstyrelsen Kalmar; sv.wikipedia', 'Ungefärlig — koordinat = ortnamnet Gursten. Ursprunglig plats var ett vägskäl vid ett gravfält nära Gursten säteri; exakt läge ej identifierat (närmaste registrerade gravfält ~1,3 km). Flyttad ca 1880.'),
  ('former',   1, 'Nygårds park, Gamleby', 'Lofta', null, null, 1880, null, null, 'possible', 'sv.wikipedia', 'Mellanplacering efter flytt ca 1880.'),
  ('current',  2, 'Gamleby folkhögskola, trädgården (Loftagatan 36)', 'Lofta', 57.9065, 16.4119, null, null, null, 'probable', 'Rundata; sv.wikipedia', 'Nuvarande plats. Koordinat = rundatas registrerade position.')
) as v(role, seq, place_name, parish, lat, lng, from_year, to_year, moved_year, certainty, source, note);

-- Sm 147: ursprunglig plats oklar → Västra Eds kyrkoruin (nuvarande).
with i as (select id from public.runic_inscriptions where signum='Sm 147')
insert into public.inscription_locations
  (inscription_id, signum, role, seq, place_name, parish, lat, lng, from_year, to_year, moved_year, certainty, source, note)
select i.id, 'Sm 147', v.role, v.seq, v.place_name, v.parish, v.lat, v.lng, v.from_year, v.to_year, v.moved_year, v.certainty, v.source, v.note
from i cross join (values
  ('original', 0, 'Okänd — möjligen längs vägen Västra Ed–Hälleberg–Vråka', 'Västra Eds', null::float8, null::float8, null::int, null::int, null::int, 'possible', 'Länsstyrelsen Kalmar', 'Ursprunglig plats oklar; flera gravfält/runstensplatser längs vägen. Sägs ha använts som tröskel i kyrkans vapenhus.'),
  ('current',  1, 'Västra Eds kyrkoruin', 'Västra Eds', 58.015, 16.4749, null, null, null, 'certain', 'Rundata', 'Nuvarande plats vid kyrkoruinen.')
) as v(role, seq, place_name, parish, lat, lng, from_year, to_year, moved_year, certainty, source, note);

-- Registrera i ontologin.
insert into public.ontology_entity_types
  (code, label_sv, label_en, physical_table, id_column, coord_kind, provenance_columns, status, description)
values ('inscription_location','Runstens plats-historik','Inscription location history','inscription_locations','id','latlng','source,certainty','active',
  'Ursprunglig/mellanled/nuvarande plats för en runinskrift. Koordinat null = overifierad. Nuvarande punkt speglas i runic_inscriptions.coordinates.')
on conflict (code) do nothing;
