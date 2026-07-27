-- Metaller & proveniens — Fas 1 (databaslager). Se docs/metaller-proveniens-design.md.
-- Egen arkeometallurgi-domän: malmkällor + metallanalyser + proveniens-kant (sourced_from).
-- Metall-agnostiskt (Pb/Sn/Ag/guld). Rendering = Fas 1b (senare, ej här).
-- Princip (ontologi-v1): typade källförda tabeller = sanning; relationship = källförd kant.
-- Kör i SQL-editorn (pooler-psql), sedan: supabase migration repair --status applied 20260728160000
--
-- OBS källdisciplin: malmkällornas lat/lng lämnas NULL — koordinater + isotope_signature
-- hämtas i separat verifieringspass mot publikation (Ling 2026, OXALID, Artioli), ALDRIG
-- ur minnet. Seedar endast källförda attribut (metaller/period/citat). Samma disciplin
-- som rock_art_dating (aldrig ett påhittat värde).

begin;

-- ---------- 1. ore_sources: malmförekomster/gruvor som typade platser ----------
create table if not exists public.ore_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  region text,
  country text,
  lat double precision,
  lng double precision,
  geom geometry generated always as (
    case when lat is not null and lng is not null
    then ST_SetSRID(ST_MakePoint(lng, lat), 4326) end) stored,
  metals text[],                 -- {copper,tin,silver,gold,lead}
  ore_type text,                 -- kopparkis, kassiterit, blyglans …
  isotope_signature jsonb,       -- karakteristiskt Pb/Sn/Ag-intervall (från publikation)
  period_from integer,           -- negativt = f.Kr.
  period_to integer,
  period_text text,
  evidence text,
  source text not null,
  note text,
  created_at timestamptz not null default now(),
  constraint ore_sources_name_uniq unique (name)
);
create index if not exists ore_sources_geom_gix on public.ore_sources using gist(geom);
create index if not exists ore_sources_metals_gix on public.ore_sources using gin(metals);

alter table public.ore_sources enable row level security;
drop policy if exists ore_sources_read on public.ore_sources;
create policy ore_sources_read on public.ore_sources for select using (true);
drop policy if exists ore_sources_write on public.ore_sources;
create policy ore_sources_write on public.ore_sources for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 2. metal_analyses: strukturerade mätningar per objekt ----------
-- Speglar isotope_measurements men för OBJEKT (ej människovävnad). Polymorf objektref
-- som relationship. Flera isotopsystem via system-fält (aldrig hårdkodad metall).
create table if not exists public.metal_analyses (
  id uuid primary key default gen_random_uuid(),
  object_type text not null,     -- 'coin' | 'artefact' | 'runic_inscription'
  object_id uuid not null,
  system text not null,          -- 'Pb206_204' | 'Pb208_206' | 'Sn124_116' | 'Ag109_107' | 'trace:As' …
  value double precision not null,
  uncertainty double precision,
  unit text,                     -- 'ratio' | 'ppm' | 'wt%'
  method text,                   -- 'MC-ICP-MS' | 'TIMS'
  lab text,
  source text not null,
  confidence text check (confidence in ('certain','probable','possible','uncertain')),
  note text,
  created_at timestamptz not null default now()
);
create index if not exists metal_analyses_object_idx on public.metal_analyses(object_type, object_id);
create index if not exists metal_analyses_system_idx on public.metal_analyses(system);

alter table public.metal_analyses enable row level security;
drop policy if exists metal_analyses_read on public.metal_analyses;
create policy metal_analyses_read on public.metal_analyses for select using (true);
drop policy if exists metal_analyses_write on public.metal_analyses;
create policy metal_analyses_write on public.metal_analyses for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 3. Graf: registrera ore_source som nodtyp (entity_registry) ----------
-- Samma trigger-mönster som p2_graph_foundation. Coins/artefacts/runic_inscriptions är
-- redan noder → sourced_from-kanter går att dra direkt.
drop trigger if exists trg_registry_sync on public.ore_sources;
create trigger trg_registry_sync
  after insert or update or delete on public.ore_sources
  for each row execute function public.sync_entity_registry('ore_source', 'name');

insert into public.entity_registry (id, entity_type, label)
  select id, 'ore_source', name from public.ore_sources where id is not null
  on conflict (id) do nothing;

-- Ontologi-katalog: gör ore_source introspekterbar för agenter.
insert into public.ontology_entity_types
  (code, label_sv, label_en, physical_table, id_column, coord_kind, provenance_columns, status, description)
values
  ('ore_source', 'malmkälla', 'ore source', 'ore_sources', 'id', 'point', 'source',
   'active', 'Malmförekomst/gruva som metallens geografiska ursprung. Metall-agnostisk (metals[]). isotope_signature bär karakteristiskt Pb/Sn/Ag-intervall. Proveniens-slutsats objekt→källa via predikatet sourced_from.')
on conflict (code) do nothing;

-- ---------- 4. Predikat: sourced_from (objekt → malmkälla) ----------
insert into public.rel_predicates
  (code, label_sv, label_en, subject_type, object_type, qualifier_schema, description)
values
  ('sourced_from', 'metall från', 'metal sourced from', '*', 'ore_source',
   '{"metal":"copper|tin|silver|gold|lead","system":"Pb|Sn|Ag","method":"MC-ICP-MS|TIMS","probability":"0-1","confidence":"certain|probable|possible|uncertain"}'::jsonb,
   'Objektets (mynt/artefakt/runbleck) metall härrör sannolikt ur malmkällan. Slutsats = sannolikhetsyta, källförd (source_ref + confidence), aldrig FK-gissning. Rådata i metal_analyses.')
on conflict (code) do nothing;

-- ---------- 5. Seed: flaggskepps-malmkällor (källförda attribut; coords NULL, se disciplin) ----------
insert into public.ore_sources
  (name, name_en, region, country, metals, ore_type, period_from, period_to, period_text, evidence, source, note)
values
  ('Cabeza del Buey (Extremadura)', 'Cabeza del Buey (Extremadura)', 'Extremadura (Badajoz)', 'Spanien',
   '{copper,lead,silver}', 'kopparförande malm', -2200, -800, 'bronsålder',
   'Nyfunna bronsåldersgruvor (skårade stenyxor för malmkrossning); bly-isotop-koppling till skandinavisk bronsålderskoppar',
   'Ling et al. 2026 (Maritime Encounters, GU); Universidad de Sevilla; Museo Arqueológico de Badajoz (survey feb 2026)',
   'Koordinater + isotope_signature ej ifyllda — hämtas ur Ling 2026 + OXALID i verifieringspass.'),
  ('Great Orme', 'Great Orme', 'Llandudno, Wales', 'Storbritannien',
   '{copper}', 'malakit/kopparkis', -1700, -600, 'bronsålder',
   'En av Europas största bronsåldersgruvor; bly-isotop- och spårämnesreferens (Williams; O''Brien)',
   'Williams & Le Carlier de Veslud 2019; A. Williams (Liverpool) — spårämnen Great Orme',
   'Koordinater + isotope_signature ej ifyllda (verifieringspass).'),
  ('Falu gruva (Stora Kopparberg)', 'Falun copper mine', 'Dalarna', 'Sverige',
   '{copper}', 'kopparkis', 800, 1300, 'vikingatid–medeltid (tidigaste brytning omdebatterad)',
   'Svensk inhemsk kopparkälla; tidig brytning belagd via bly/pollen-proxy, exakt startpunkt omtvistad',
   'Falu gruva (världsarv); Bindler et al. (sjösediment-bly, Dalarna)',
   'Startdatum osäkert — period_text flaggar detta. Koordinater ej ifyllda (verifieringspass).'),
  ('Troodos (Cypern)', 'Troodos (Cyprus)', 'Troodos', 'Cypern',
   '{copper}', 'kopparkis', -2000, 1200, 'brons–järnålder',
   'Klassisk medelhavskopparkälla; referens för östlig koppar',
   'OXALID (Oxford) referensdata',
   'Regionskala, ej punkt. Koordinater/isotope_signature ur OXALID (verifieringspass).'),
  ('Cornwall & Devon', 'Cornwall & Devon', 'Sydvästengland', 'Storbritannien',
   '{tin}', 'kassiterit', -2200, 1500, 'brons–',
   'Europas främsta tennkälla; central i den omdebatterade tenn-isotopdiskussionen',
   'Berger et al. 2019; Pernicka-gruppen (Sn-isotoper under utveckling)',
   'Tenn-provenens metodiskt omtvistad → confidence=possible på framtida kanter. Regionskala.'),
  ('Erzgebirge', 'Ore Mountains', 'Sachsen/Böhmen', 'Tyskland/Tjeckien',
   '{tin,silver}', 'kassiterit/silvermalm', -2000, 1600, 'brons–medeltid',
   'Mellaneuropeisk tenn- och silverkälla',
   'Berger et al. 2019 (tenn-isotoper)',
   'Regionskala. Koordinater/isotope_signature ur publikation (verifieringspass).'),
  ('Italienska Alperna (Trentino)', 'Italian Alps (Trentino)', 'Trentino / Val di Fiemme', 'Italien',
   '{copper}', 'kopparkis', -1600, -900, 'bronsålder',
   'Alpin kopparkälla; Artioli/Padova-samarbetet knöt skandinaviska data hit',
   'Artioli et al., Università di Padova (Dip. di Geoscienze) — referensdata + tolkning',
   'Koordinater/isotope_signature ur Padova-data (verifieringspass).'),
  ('Melle', 'Melle', 'Deux-Sèvres, Poitou', 'Frankrike',
   '{silver,lead}', 'silverhaltig blyglans', 700, 1000, 'karolingisk–vikingatid',
   'Frankrikes stora karolingiska silvergruva; källa för västligt (frankiskt) silver i vikingatida flöden',
   'Téreygeol, Melle-gruvorna (arkeometallurgi)',
   'Koordinater/isotope_signature ur publikation (verifieringspass).')
on conflict (name) do nothing;

commit;

-- Efter apply: supabase migration repair --status applied 20260728160000
-- + regenerera types.ts via --linked (ej Docker).
-- NÄSTA (Fas 1 datapopulering, ej här): verifiera coords + isotope_signature mot
-- publikation; fyll metal_analyses råvärden (Kershaw 2025 Bedale, OXALID); dra
-- sourced_from-kanter för Bedale/Vikby/Sigtuna-koppar UTIFRÅN publicerade slutsatser.
