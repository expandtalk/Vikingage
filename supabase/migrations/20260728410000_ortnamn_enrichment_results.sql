-- Sambandsstyrka (anrikning) per region — beräknas av ledparsern (som respekterar forskarens
-- ortnamn_element_config), lagras här, visas på kartan MED förbehåll. En enda beräkningspunkt
-- (parsern) → siffran är reproducerbar och config-driven, aldrig hårdkodad i frontend.
begin;
create table if not exists public.ortnamn_enrichment_results (
  region text primary key,
  radius_km int,
  baseline_n int,            -- antal ortnamn i regionen
  near_pct numeric,          -- andel av alla ortnamn nära en centralort (nollnivån)
  cult_n int,                -- antal kult-namn (parsad, med aktiv include-konfig)
  cult_enrichment numeric,   -- kult nära-nod-frekvens / near_pct
  neutral_enrichment numeric,
  ratio numeric,             -- cult_enrichment / neutral_enrichment (>1 = tätare än väntat)
  included_elements text,    -- vilka led som räknades (Agnetas/Daniels beslut)
  owner_note text,           -- vem som äger ledbeslutet
  caveat text,               -- obligatoriska förbehåll (regional konfound, n, config)
  computed_at timestamptz not null default now()
);
alter table public.ortnamn_enrichment_results enable row level security;
drop policy if exists oer_read on public.ortnamn_enrichment_results;
create policy oer_read on public.ortnamn_enrichment_results for select using (true);
drop policy if exists oer_write on public.ortnamn_enrichment_results;
create policy oer_write on public.ortnamn_enrichment_results for all using (public.is_admin()) with check (public.is_admin());
commit;
