-- Historiska ortnamnsbelägg (form + år) per ort. Applicerad via MCP execute_sql;
-- denna fil = proveniens. Källa: Isof Ortnamnsregistret / Riksarkivet, transkriberat
-- (pilot: Agneta Nyholm 2025 "I modern, valan och den heliga hästens spår", daterade
-- kedjor s.149/158/159/161). Möjliggör kronologiska tester (val→vål/vad-omskrivning).
create table if not exists public.place_name_attestations (
  id            uuid primary key default gen_random_uuid(),
  place_name_id uuid references public.place_names(id) on delete set null,
  place_label   text not null,
  year          integer not null,
  attested_form text not null,
  source        text not null,
  note          text,
  created_at    timestamptz not null default now()
);
create index if not exists pna_place_label_idx on public.place_name_attestations (lower(place_label));
create index if not exists pna_place_name_id_idx on public.place_name_attestations (place_name_id);
alter table public.place_name_attestations enable row level security;
drop policy if exists pna_public_read on public.place_name_attestations;
create policy pna_public_read on public.place_name_attestations for select using (true);
drop policy if exists pna_admin_write on public.place_name_attestations;
create policy pna_admin_write on public.place_name_attestations for all using (public.is_admin()) with check (public.is_admin());

-- Pilot-seed: daterade beläggkedjor (se docs/agneta-framework-notes.md).
insert into public.place_name_attestations (place_label, year, attested_form, source, note) values
('Östervåla', 1296, 'Vala/Valir', 'Nyholm 2025 s.149 (Riksarkivet Landskapshandlingar)', 'Våla härad'),
('Östervåla', 1344, 'Valbohundære', 'Nyholm 2025 s.149 (Riksarkivet Landskapshandlingar)', null),
('Östervåla', 1346, 'Valum', 'Nyholm 2025 s.149 (Riksarkivet Landskapshandlingar)', null),
('Östervåla', 1446, 'Vuala', 'Nyholm 2025 s.149 (Riksarkivet Landskapshandlingar)', null),
('Östervåla', 1488, 'Wala', 'Nyholm 2025 s.149 (Riksarkivet Landskapshandlingar)', null),
('Östervåla', 1600, 'Östervåla', 'Nyholm 2025 s.149', 'förleden öster tillkom på 1600-talet'),
('Vallberga', 1462, 'Vallberga', 'Nyholm 2025 s.161', 'Laholm'),
('Vallberga', 1487, 'Walabaergh', 'Nyholm 2025 s.161', null),
('Vallberga', 1505, 'Wadbergh', 'Nyholm 2025 s.161', 'val->vad-omskrivning'),
('Vallberga', 1603, 'Vatbieria', 'Nyholm 2025 s.161', null),
('Vallberga', 1704, 'Walbierre', 'Nyholm 2025 s.161', null),
('Gesvad', 1435, 'Geetwadz', 'Nyholm 2025 s.158', 'ur "Geetwadz land"'),
('Vadstena', 1375, 'Hofdastadhum', 'Nyholm 2025 s.159', 'tolkas Hov-sta-rum')
on conflict do nothing;

update public.place_name_attestations a
set place_name_id = p.id
from public.place_names p
where lower(p.name) = lower(a.place_label) and a.place_name_id is null;
