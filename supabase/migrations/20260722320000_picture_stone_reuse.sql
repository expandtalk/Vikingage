-- Bildstenar återanvända i medeltida kyrkor (spolia / kultplatskontinuitet).
-- Källa: Sigmund Oehrl, "Pagan Stones in Christian Churches. Medieval Views on the Past
-- (the Example of Gotland, Sweden)", Quaestiones Medii Aevi Novae 24 (2019), s. 69–95.
-- Listnummer ur Lamm & Nylén, Bildstenar (2003); perioder ur Lindqvist 1941–42 (A:400–600,
-- B:500–700, C/D:700–1000, E:1000-tal). Applicerad via MCP execute_sql; fil = proveniens.
--
-- Fysiska fakta (sten, kyrka, period, återanvändningskontext, listnr) = belagda.
-- interpretation[] = kandidatramar (pragmatism/damnatio/translatio/kontinuitet/superstitio)
-- och är enligt Oehrl OMTVISTADE — lagras som flervärd, inte som sanning.
-- Av Gotlands 570 kända bildstenar sitter ca 240 inmurade i kyrkor; detta seed = de i
-- artikeln namngivna, dokumenterade fallen + en dansk parallell (Hørdum, Tor fiskar Midgårdsormen).

create table if not exists public.picture_stone_reuse (
  id uuid primary key default gen_random_uuid(),
  stone_name text not null,
  parish text,
  lamm_nylen_no text,
  lindqvist_period text check (lindqvist_period in ('A','B','C','D','C/D','E')),
  period_label text,
  reuse_context text,
  visibility text,
  motif text,
  interpretation text[],
  notes text,
  confidence text default 'belagd',
  is_gotland boolean default true,
  christian_site_id uuid references public.christian_sites(id),
  lat double precision,
  lng double precision,
  geom geometry generated always as (case when lat is not null and lng is not null then ST_SetSRID(ST_MakePoint(lng,lat),4326) end) stored,
  source text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.picture_stone_reuse enable row level security;
drop policy if exists "psr read" on public.picture_stone_reuse;
create policy "psr read" on public.picture_stone_reuse for select using (true);
drop policy if exists "psr admin write" on public.picture_stone_reuse;
create policy "psr admin write" on public.picture_stone_reuse for all using (is_admin()) with check (is_admin());
create index if not exists picture_stone_reuse_geom_idx on public.picture_stone_reuse using gist(geom);

-- Seed: se execute_sql-loggen (21 rader: 20 Gotland + Hørdum). Fälten stone_name, parish,
-- lamm_nylen_no, lindqvist_period, reuse_context, visibility, motif, interpretation, notes,
-- source enligt Oehrl 2019.

-- Ontologi: registrera som entity_type 'picture_stone' i entity_registry och länka till
-- temat 'Spolia & kultplatskontinuitet' (slug spolia-kultkontinuitet) via theme_links-vyn,
-- vilket materialiserar 'has_theme'-kanter i relationship-grafen.
--   insert into entity_registry (id, entity_type, label) select id,'picture_stone',stone_name ...
--   insert into theme_links (theme_id, entity_type, entity_id, notes) ...

-- TODO (nästa steg): koordinatsätt de 20 gotländska kyrkorna (christian_site_id + lat/lng)
-- med verifierade koordinater innan kartlager byggs. Fabricera inga koordinater.
