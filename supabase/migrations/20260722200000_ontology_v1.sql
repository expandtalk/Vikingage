-- Ontologi v1 — utvecklar den befintliga grafen (entity_registry/relationship/
-- rel_predicates, v0 runinskrifts-centrerad) till ett domänbrett, agent-läsbart kontrakt.
-- Applicerad via MCP execute_sql; fil = proveniens. Se docs/ontology-v1.md.
-- Princip: typade källförda tabeller = sanning; ontologin = tunt katalog-/kantlager.
-- relationship bär redan source_ref + confidence (provenance obligatorisk).

-- 1. Ny entitet: art-/innovationsintroduktioner (tom, källfylls).
create table if not exists public.species_introductions (
  id uuid primary key default gen_random_uuid(),
  entity text not null, category text, proxy_type text not null,
  site_name text, region text, landscape text,
  lat double precision, lng double precision,
  geom geometry generated always as (case when lat is not null and lng is not null then ST_SetSRID(ST_MakePoint(lng,lat),4326) end) stored,
  date_text text, date_from integer, date_to integer,
  uncertainty text default 'normal', confidence text not null default 'trolig',
  source text not null, note text, created_at timestamptz not null default now()
);
alter table public.species_introductions enable row level security;
drop policy if exists si_read on public.species_introductions;
create policy si_read on public.species_introductions for select using (true);
drop policy if exists si_write on public.species_introductions;
create policy si_write on public.species_introductions for all using (public.is_admin()) with check (public.is_admin());
create index if not exists species_introductions_geom_gix on public.species_introductions using gist(geom);

-- 2. Katalogtabeller (det agenter introspekterar).
create table if not exists public.ontology_entity_types (
  code text primary key, label_sv text, label_en text,
  physical_table text, id_column text default 'id', coord_kind text,
  provenance_columns text, status text not null default 'active', description text
);
create table if not exists public.ontology_measures (
  code text primary key, label_sv text, label_en text,
  rpc text, inputs text, output_unit text,
  applies_to text[], status text not null default 'active', description text
);
alter table public.ontology_entity_types enable row level security;
alter table public.ontology_measures enable row level security;
drop policy if exists oet_read on public.ontology_entity_types;
create policy oet_read on public.ontology_entity_types for select using (true);
drop policy if exists oet_write on public.ontology_entity_types;
create policy oet_write on public.ontology_entity_types for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists om_read on public.ontology_measures;
create policy om_read on public.ontology_measures for select using (true);
drop policy if exists om_write on public.ontology_measures;
create policy om_write on public.ontology_measures for all using (public.is_admin()) with check (public.is_admin());

-- 3. Seed entitetstyper (mappade mot fysiska tabeller). Se docs för full lista.
-- (Innehållet applicerades via execute_sql 2026-07-22: 20 aktiva + 4 planerade —
--  place_name, name_dating, church, heritage_site, parish, hundred, diocese,
--  species_introduction m.fl.; planerade: hydronym, script_system, motif, taxation_unit.)

-- 4. Nya predikat i rel_predicates (utöver v0:s 10): near, within_shape, dated_to,
--    introduced_at, precedes, belongs_to_parish, part_of_hundred, taxed_under, built_by,
--    buried_at, attested_by, depicts, written_in. Alla kanter i relationship kräver
--    source_ref + confidence (belagd|trolig|tradition|hypotes).

-- 5. Mätoperationer i ontology_measures: distance_baseline, features_in_shape, day_reach
--    (aktiva) + nearest_neighbour, proxy_lag, distance_stats_free (planerade).

-- OBS: seed-INSERTs kördes via MCP execute_sql (idempotenta, on conflict do nothing).
-- Denna fil dokumenterar strukturen; katalogens rader är datainnehåll, ej schema.
