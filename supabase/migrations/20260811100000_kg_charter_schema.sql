-- Medeltidsbrev kunskapsgraf (Fas A, Task 1): schema + kg_norm + year-intervall.
-- Additivt: enbart CREATE/INSERT + en ny matview. Rör INTE sdhk.letters_raw/charter_tags/charter_year
-- eller public.entity_registry. Kanter pekar på entity_registry.id (uuid) — ingen parallell nodtabell.
--
-- kg_norm(text): normaliseringsnyckel för alias-matchning. Bygger på extensions.unaccent (samma
-- extension som public.search_fold använder). unaccent är formellt STABLE (ordboksberoende), men
-- foldar bara Unicode-kombinationsdiakriter (é→e, å→a) — inte þ/ð/æ/ø/w som saknar kanonisk
-- dekomposition, så de hanteras explicit via translate() nedan. Deklarerad IMMUTABLE medvetet
-- (samma etablerade avvägning som andra funktionella trgm-index i produktionsdatabaser) för att
-- kunna bära en GENERATED ALWAYS ... STORED-kolumn (alias_norm); dictionary-bytet är inte att
-- vänta i denna databas. Se 20260807150000_search_fold_nordic_vowels.sql för samma avvägning
-- diskuterad (där valdes STABLE eftersom inget genererat-kolumn-behov fanns då).
create or replace function public.kg_norm(t text)
returns text
language sql
immutable
parallel safe
as $function$
  select regexp_replace(
    translate(lower(extensions.unaccent(coalesce(t, ''))), 'þðwæøc', 'tdvaok'),
    '[^a-z0-9 ]', '', 'g'
  )
$function$;

comment on function public.kg_norm(text) is 'Normaliseringsnyckel för KG-aliasmatchning: lower+unaccent, þðwæø→tdvao, c→k (EJ i/j eller u/v — asymmetriskt, avsiktligt), strip icke-[a-z0-9 ]. IMMUTABLE av avsiktligt val, se funktionskommentar i migrationen.';

-- 1. Alias-lager ovanpå entity_registry (kanoniska namn + ortografiska/böjda varianter).
create table if not exists public.kg_entity_aliases (
  alias_id bigserial primary key,
  entity_ref uuid not null references public.entity_registry(id),
  alias text not null,
  alias_norm text generated always as (public.kg_norm(alias)) stored,
  lang text,
  alias_type text,
  confidence real not null default 1.0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_ref, alias, lang)
);

comment on table public.kg_entity_aliases is 'Alias-lager för KG-entitetslänkning: kanoniska namn + varianter/böjningsformer ovanpå entity_registry. alias_norm = kg_norm(alias), STORED för trgm-index.';

create index if not exists kg_entity_aliases_norm_trgm_idx
  on public.kg_entity_aliases using gin (alias_norm gin_trgm_ops);
create index if not exists kg_entity_aliases_entity_ref_idx
  on public.kg_entity_aliases (entity_ref);

alter table public.kg_entity_aliases enable row level security;
drop policy if exists "kg_entity_aliases public read" on public.kg_entity_aliases;
create policy "kg_entity_aliases public read"
  on public.kg_entity_aliases for select using (true);
drop policy if exists "kg_entity_aliases admin write" on public.kg_entity_aliases;
create policy "kg_entity_aliases admin write"
  on public.kg_entity_aliases for all using (public.is_admin()) with check (public.is_admin());

-- 2. Kanter brev→entitet ("mentions", ej säker identifiering — se Global Constraints i planen).
create table if not exists public.kg_charter_edges (
  edge_id bigserial primary key,
  sdhk_id int not null references sdhk.letters_raw(sdhk_id),
  entity_ref uuid not null references public.entity_registry(id),
  edge_type text not null check (edge_type in (
    'utfardade','mottog','part_i_tvist','sigillant','bevittnade','omnamnd','ror_plats','utfardad_i'
  )),
  confidence real not null default 0.5,
  source_pass text check (source_pass in ('regex','facet','manuell')),
  span_start int,
  span_end int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sdhk_id, entity_ref, edge_type)
);

comment on table public.kg_charter_edges is 'Regelbaserade kanter brev↔entitet. Detta är MENTIONS (source_pass=regex/facet, låg–medel konfidens), inte säker personidentifiering. entity_ref → entity_registry.id.';

create index if not exists kg_charter_edges_entity_type_idx
  on public.kg_charter_edges (entity_ref, edge_type);
create index if not exists kg_charter_edges_sdhk_idx
  on public.kg_charter_edges (sdhk_id);

alter table public.kg_charter_edges enable row level security;
drop policy if exists "kg_charter_edges public read" on public.kg_charter_edges;
create policy "kg_charter_edges public read"
  on public.kg_charter_edges for select using (true);
drop policy if exists "kg_charter_edges admin write" on public.kg_charter_edges;
create policy "kg_charter_edges admin write"
  on public.kg_charter_edges for all using (public.is_admin()) with check (public.is_admin());

-- 3. Brev→brev-relationer (vidimation/stadfästelse/referens/transsumpt), ur regest (Task 2).
create table if not exists public.kg_charter_relations (
  from_sdhk int not null references sdhk.letters_raw(sdhk_id),
  to_sdhk int not null references sdhk.letters_raw(sdhk_id),
  relation_type text not null check (relation_type in (
    'vidimerar','stadfaster','refererar','transsumerar'
  )),
  confidence real not null default 0.5,
  created_at timestamptz not null default now(),
  primary key (from_sdhk, to_sdhk, relation_type)
);

comment on table public.kg_charter_relations is 'Brev→brev-kedjor (t.ex. "SDHK X vidimerar SDHK Y"), extraherade ur regest med hög precision (se Task 2). Bygger auktoritet i kg_charter_authority.';

create index if not exists kg_charter_relations_to_sdhk_idx
  on public.kg_charter_relations (to_sdhk);

alter table public.kg_charter_relations enable row level security;
drop policy if exists "kg_charter_relations public read" on public.kg_charter_relations;
create policy "kg_charter_relations public read"
  on public.kg_charter_relations for select using (true);
drop policy if exists "kg_charter_relations admin write" on public.kg_charter_relations;
create policy "kg_charter_relations admin write"
  on public.kg_charter_relations for all using (public.is_admin()) with check (public.is_admin());

-- 4. Rollvikter för rankning (Task 4).
create table if not exists public.kg_edge_weights (
  edge_type text primary key,
  weight real not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.kg_edge_weights is 'Rollvikt per edge_type, använd multiplikativt i rankningen (Task 4 RPC).';

insert into public.kg_edge_weights (edge_type, weight) values
  ('utfardade', 1.00),
  ('mottog', 0.85),
  ('part_i_tvist', 0.75),
  ('sigillant', 0.60),
  ('utfardad_i', 0.55),
  ('ror_plats', 0.70),
  ('bevittnade', 0.45),
  ('omnamnd', 0.35)
on conflict (edge_type) do nothing;

alter table public.kg_edge_weights enable row level security;
drop policy if exists "kg_edge_weights public read" on public.kg_edge_weights;
create policy "kg_edge_weights public read"
  on public.kg_edge_weights for select using (true);
drop policy if exists "kg_edge_weights admin write" on public.kg_edge_weights;
create policy "kg_edge_weights admin write"
  on public.kg_edge_weights for all using (public.is_admin()) with check (public.is_admin());

-- 5. Auktoritet per brev (antal vidimationer/stadfästelser det tagit emot) — matview, refreshas i Task 2/4.
drop materialized view if exists public.kg_charter_authority;
create materialized view public.kg_charter_authority as
select
  to_sdhk as sdhk_id,
  count(*) filter (where relation_type = 'vidimerar') as n_vidimationer,
  count(*) filter (where relation_type = 'stadfaster') as n_stadfastelser,
  ln(1 + count(*)) as authority_log
from public.kg_charter_relations
group by to_sdhk;

create unique index if not exists kg_charter_authority_sdhk_idx
  on public.kg_charter_authority (sdhk_id);

grant select on public.kg_charter_authority to anon, authenticated;

-- 6. Year-intervall härledd ur sdhk.letters_raw.date_raw (aoristisk temporal filtrering, Task 4).
-- Återanvänder sdhk.derive_year() (kategori + första-4-siffror) och lägger till en oberoende
-- global \d{4}-skanning (guardad 800–1560) för spann-fallet, eftersom derive_year().y bara ger
-- FÖRSTA årtalet, inte min/max. Se rapport för dokumenterade edge-cases (t.ex. "1461? ... - se
-- 14620518" tolkas som [1461,1462] — dateringsosäkerhet mellan angränsande år, inte en gissning).
--
-- Fix round 1 (inline review): "efter" i SDHK är oftast en LITURGISK VECKODAGS-DATERING
-- ("tisdagen efter vita söndagen 1442") — ett PRECIST årtal, inte årsosäkerhet. Bredda bara
-- till [y,y+50] när "efter" verkligen följs av en siffra (efter\s*\d, t.ex. "efter 1442" /
-- "efter 14420202"). Annars är det en veckodagsfras och ska förbli punkt-år (samma som exakt).
create or replace function sdhk.derive_year_interval(date_raw text)
returns table(year_min int, year_max int)
language sql
immutable
as $function$
  with base as (
    -- sdhk.derive_year()'s eget regex-guard tillåter 0800–1599; vårt spec-guard är strängare
    -- (800–1560), så vi klipper om det behövs i stället för att lita på derive_year() rakt av.
    select
      case when d.y between 800 and 1560 then d.y else null end as y,
      d.q,
      (date_raw ~* 'efter\s*\d') as efter_dated
    from sdhk.derive_year(date_raw) d
  ),
  guarded as (
    select (m[1])::int as yr
    from regexp_matches(coalesce(date_raw, ''), '(\d{4})', 'g') as m
    where (m[1])::int between 800 and 1560
  ),
  computed as (
    -- 'efter' utan följande siffra = veckodagsfras, inte dateringsosäkerhet -> punkt-år.
    select
      case
        when base.q = 'efter' and base.efter_dated then base.y
        when base.q = 'efter'                       then base.y
        when base.q = 'omkr'  then base.y - 15
        when base.q = 'spann' then (select min(yr) from guarded)
        when base.q = 'exakt' then base.y
        else null
      end as raw_min,
      case
        when base.q = 'efter' and base.efter_dated then base.y + 50
        when base.q = 'efter'                       then base.y
        when base.q = 'omkr'  then base.y + 15
        when base.q = 'spann' then (select max(yr) from guarded)
        when base.q = 'exakt' then base.y
        else null
      end as raw_max
    from base
  )
  select
    case when raw_min is null then null else greatest(raw_min, 800) end as year_min,
    case when raw_max is null then null else least(raw_max, 1560) end as year_max
  from computed;
$function$;

comment on function sdhk.derive_year_interval(text) is 'Härleder [year_min,year_max] ur date_raw via sdhk.derive_year() kategori: spann→min/max av guardade 4-siffriga tal (800–1560); punkt/exakt→samma år; efter+siffra (efter\s*\d)→[y,y+50]; efter UTAN siffra (veckodagsfras, t.ex. "tisdagen efter vita söndagen")→punkt-år; omkr/ca/cirka→[y-15,y+15]; odaterad/ej tolkbart→null. Approximativ/aoristisk — INTE en verifierad exakt datering.';

create table if not exists sdhk.charter_year_interval (
  sdhk_id int primary key references sdhk.letters_raw(sdhk_id),
  year_min int not null,
  year_max int not null,
  created_at timestamptz not null default now(),
  constraint charter_year_interval_order_chk check (year_min <= year_max),
  constraint charter_year_interval_min_range_chk check (year_min between 800 and 1560),
  constraint charter_year_interval_max_range_chk check (year_max between 800 and 1560)
);

comment on table sdhk.charter_year_interval is 'Härledd [year_min,year_max] per brev för aoristisk temporal överlappsscoring (Task 4). Saknar rad = odaterat eller ej tolkbart datum (medvetet null, inte gissat).';

-- Fyllning: TRUNCATE + full omräkning. Tillåtet endast på DENNA nya tabell (ingen annan data
-- rörs) — säkerställer att en korrigerad derive_year_interval() (t.ex. fix round 1 ovan) alltid
-- ger en konsekvent tabell utan kvarblivna rader från en tidigare, felaktig regel.
truncate table sdhk.charter_year_interval;

insert into sdhk.charter_year_interval (sdhk_id, year_min, year_max)
select lr.sdhk_id, dyi.year_min, dyi.year_max
from sdhk.letters_raw lr
cross join lateral sdhk.derive_year_interval(lr.date_raw) dyi
where dyi.year_min is not null
  and dyi.year_max is not null;
