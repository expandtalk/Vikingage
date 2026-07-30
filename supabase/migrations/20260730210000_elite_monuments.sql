-- Kuraterad grupp: exceptionella elit-monument som avviker från massan av minnesstenar —
-- elitens kommunikation (skaldevers, hjältediktning, urnordisk förbannelse) + politiska/central-
-- platser. Interpretiv metadata (genre/association/influens) ovanpå objekt som ofta redan finns
-- i runic_inscriptions/heritage_sites. Se elit-tes-diskussionen (Rök/Karlevi/Björketorp/Vång).
create table if not exists elite_monuments (
  id uuid primary key default gen_random_uuid(),
  name text not null, kind text not null,           -- genre: hjältediktning|skaldevers|förbannelse|centralplats|politisk plats
  signum text, lat double precision, lng double precision,
  dating text, landscape text, association text, influence text, note text, source text, link text,
  created_at timestamptz default now()
);
alter table elite_monuments enable row level security;
drop policy if exists elite_monuments_read on elite_monuments;
create policy elite_monuments_read on elite_monuments for select using (true);
drop policy if exists elite_monuments_write on elite_monuments;
create policy elite_monuments_write on elite_monuments for all using (is_admin()) with check (is_admin());
