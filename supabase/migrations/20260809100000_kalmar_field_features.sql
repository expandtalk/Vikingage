-- Kalmar medeltidskarta: kurerad fältkorpus (D. Larsson) som egen källkritisk tabell.
-- Ett tidsskikts-taggat lager: medeltida (Gamla stan vid slottet) skilt från nya staden
-- (Kvarnholmen 1640-tal) och från natur/överfartsgeografi. Belägg-status per rad; reconcile_ref
-- pekar på kanonisk rad i annan tabell där sådan finns (undvik dubbletter i rendering).
-- INGEN GISSNING: koordinater = D. Larssons kartavläsning; namnbelägg/etymologi obelagt tills källa.

create table if not exists public.kalmar_field_features (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  feature_type text not null,   -- portage/crossing/harbor/quay/castle/street/road/fortification/cemetery/chapel/square/island/headland/shoal/estate/channel/locality
  time_layer text not null,     -- medieval / new_town_1600s / multi_period / natural / crossing / hypothesis
  lat double precision not null,
  lng double precision not null,
  route_group text,             -- grupperar linjära features (gator/vägar/drag) för polyline
  seq integer,                  -- ordning inom route_group
  belegg_status text,           -- belagt / tradition / hypotes / obelagt
  confidence text,              -- high / medium / low
  source text not null default 'D. Larsson, fältkännedom',
  reconcile_ref text,           -- kanonisk rad i annan tabell (om sådan finns)
  note text,
  created_at timestamptz not null default now()
);

alter table public.kalmar_field_features enable row level security;

drop policy if exists "public read kalmar_field_features" on public.kalmar_field_features;
create policy "public read kalmar_field_features"
  on public.kalmar_field_features for select using (true);
