-- Hällristnings-proveniens — reconciliat schema. Se docs/ (design från diskussion 2026-07-27).
-- GRUNDPRINCIP: lämning, observation av lämning, tolkning av observation = TRE entiteter.
-- Ett attribut direkt på lämningen är ett påstående utan avsändare → förbjuds strukturellt.
--
-- RECONCILIATION (beslut #0): forka INTE plattformen. Ny maskineri ankras på befintlig ryggrad:
--   source   = historical_sources (utökad med diskriminator + API-proveniens)
--   lamning  = heritage_sites (utökad med existence/context/register)
--   dating   = dating_argument ERSÄTTER rock_art_dating (superset), migreras in, ej parallellt
--   Nytt (rent tillägg): observation, intervention, figure, figure_record, lamning_geometry.
--
-- TVÅ ÄNDRINGAR från Daniel (2026-07-27):
--   1. NOT NULL släpps INTE blint — görs villkorade på kind (garantin kvar för narrativa källor).
--   2. register_system-diskriminator på heritage_sites (Bornholm = FoF, ej RAÄ).
--
-- CRS: koordinater lagras kanoniskt i 4326 (WGS84) som resten av plattformen. Vilken PROJICERAD
--   CRS som är korrekt för metrik är DATA (metric_srid), inte kolumntyp. 3006 (SWEREF99 TM) =
--   25832/25833 (ETRS89/UTM) är SAMMA projektion (centralmeridian 15°Ö) — exakt nära 15°Ö
--   (Sverige, Bornholm, Skåne, Blekinge), bryter långt därifrån (Jylland ~1-2 m/km, Finnmark,
--   Iberien). Metrisk area: ST_Transform(geom, metric_srid). Avstånd: geom::geography (korrekt
--   globalt, ingen projektion — täcker närhet ristning↔ångningsgrop och avstånd till strandlinje).
--   horizontal_unc_m är en skalär i meter, giltig i valfri CRS — men ritas ALDRIG som en cirkel
--   med radie N i gradrymd (visningsregel). Lat/lon-omkastning fångas av Europa-bbox-CHECK vid
--   insert. Strandlinjemodeller behåller egen regional projektion (shoreline_model har region).
--
-- Kör i SQL-editorn (pooler-psql), sedan: supabase migration repair --status applied 20260728170000

begin;

-- ---------- ENUMS (guardade för säker manuell apply) ----------
do $$ begin
  if not exists (select 1 from pg_type where typname='source_kind') then
    create type source_kind as enum ('publication','archive_item','field_note','historical_map','api_response','dataset','personal_comm'); end if;
  if not exists (select 1 from pg_type where typname='existence_state') then
    create type existence_state as enum ('extant','destroyed','documentary_only','relocated','unassessed'); end if;
  if not exists (select 1 from pg_type where typname='context_state') then
    create type context_state as enum ('open_bedrock','sealed_monument','secondary_use','loose_block','unassessed'); end if;
  if not exists (select 1 from pg_type where typname='position_method') then
    create type position_method as enum ('rtk_gnss','handheld_gps','total_station','map_digitised','description_only','unknown'); end if;
  if not exists (select 1 from pg_type where typname='obs_method') then
    create type obs_method as enum ('autopsy_visual','frottage','tracing','casting','photo_daylight','photo_night','photogrammetry_sfm','laser_scan','reproduction'); end if;
  if not exists (select 1 from pg_type where typname='paint_state') then
    create type paint_state as enum ('unpainted','painted','freshly_repainted','paint_removed','unknown'); end if;
  if not exists (select 1 from pg_type where typname='intervention_kind') then
    create type intervention_kind as enum ('painting','repainting','paint_removal','cleaning','moulding','excavation','conservation','reconstruction','damage','destruction','relocation'); end if;
  if not exists (select 1 from pg_type where typname='authenticity_state') then
    create type authenticity_state as enum ('unassessed','accepted','disputed','pareidolia','paint_artefact','modern_addition','forgery'); end if;
  if not exists (select 1 from pg_type where typname='dating_method') then
    create type dating_method as enum ('typology','bronze_typology','shoreline_displacement','c14','dendro','osl','boatfind_analogue','superposition','sealed_context','historical_document'); end if;
  if not exists (select 1 from pg_type where typname='interval_kind') then
    create type interval_kind as enum ('range','terminus_post_quem','terminus_ante_quem','point'); end if;
  if not exists (select 1 from pg_type where typname='dated_material') then
    create type dated_material as enum ('cordage','structural_wood','charcoal','bone','seed','organic_temper','pitch_residue','peat','other'); end if;
  if not exists (select 1 from pg_type where typname='target_event') then
    create type target_event as enum ('organism_death','construction','use','deposition','carving','unspecified'); end if;
end $$;

-- ---------- RYGGRAD 1: historical_sources → diskriminerad union ----------
-- Ändring 1: author/language villkoras på kind, släpps INTE blint. Garantin kvar för narrativa.
alter table public.historical_sources add column if not exists kind source_kind not null default 'publication';
alter table public.historical_sources add column if not exists doi text;
alter table public.historical_sources add column if not exists url text;
alter table public.historical_sources add column if not exists repository text;
alter table public.historical_sources add column if not exists repository_ref text;
alter table public.historical_sources add column if not exists api_endpoint text;
alter table public.historical_sources add column if not exists api_query text;
alter table public.historical_sources add column if not exists retrieved_at timestamptz;
alter table public.historical_sources add column if not exists response_hash text;   -- egen kolumn (ej jsonb): se om RAÄ ändrat svaret under dig
alter table public.historical_sources add column if not exists peer_reviewed boolean;

alter table public.historical_sources alter column author drop not null;
alter table public.historical_sources alter column language drop not null;
-- reliability + bias_types lämnas orörda: ett API-svar HAR en tillförlitlighet; tom bias = påstående.
do $$ begin
  if not exists (select 1 from pg_constraint where conname='narrative_needs_author') then
    alter table public.historical_sources add constraint narrative_needs_author check (kind = 'api_response' or author is not null); end if;
  if not exists (select 1 from pg_constraint where conname='narrative_needs_language') then
    alter table public.historical_sources add constraint narrative_needs_language check (kind = 'api_response' or language is not null); end if;
  if not exists (select 1 from pg_constraint where conname='api_needs_endpoint') then
    alter table public.historical_sources add constraint api_needs_endpoint check (kind <> 'api_response' or (api_endpoint is not null and retrieved_at is not null)); end if;
end $$;

-- ---------- RYGGRAD 2: heritage_sites = lamning ----------
-- existence/context: epistemiska fält plattformen saknar. register_system: ändring 2 (Bornholm=FoF).
alter table public.heritage_sites add column if not exists existence existence_state not null default 'unassessed';
alter table public.heritage_sites add column if not exists context_state context_state not null default 'unassessed';
alter table public.heritage_sites add column if not exists context_ref text;
alter table public.heritage_sites add column if not exists register_system text;  -- 'raa'|'ffm'|'unimus'… nullable, EJ default (påstå inget om 37k legacy-rader)
alter table public.heritage_sites add column if not exists register_id text;

-- ---------- GEOMETRI: rumslig proveniens (3006, native precision) ----------
create table if not exists public.lamning_geometry (
  geometry_id     uuid primary key default gen_random_uuid(),
  lamning_id      uuid not null references public.heritage_sites(id) on delete cascade,
  geom            geometry(Geometry, 4326) not null,          -- kanonisk 4326; metrisk CRS = data
  metric_srid     integer not null default 3006,               -- korrekt projicerad CRS för metrik (3006 SE, 25832/25833 DK, 25832-25835 NO)
  method          position_method not null default 'unknown',
  source_crs      text,
  was_transformed boolean not null default false,
  transform_note  text,
  stated_precision   text,                                     -- ordagrant ur källan
  horizontal_unc_m   numeric check (horizontal_unc_m >= 0),    -- skalär i meter, giltig i valfri CRS; rita ej som gradcirkel
  elevation_m_rh2000 numeric,                                  -- för strandförskjutning
  is_current      boolean not null default false,
  source_id       uuid not null references public.historical_sources,
  recorded_at     date,
  constraint lamning_geom_within_europe check (
    ST_Y(ST_Centroid(geom)) between 35 and 72 and ST_X(ST_Centroid(geom)) between -12 and 32)  -- fångar lat/lon-omkastning
);
create index if not exists lamning_geometry_gix on public.lamning_geometry using gist (geom);
create unique index if not exists one_current_geom on public.lamning_geometry (lamning_id) where is_current;

-- ---------- OBSERVATION: provenienskedjans kärna ----------
create table if not exists public.observation (
  observation_id  uuid primary key default gen_random_uuid(),
  lamning_id      uuid not null references public.heritage_sites(id) on delete cascade,
  agent           text,
  agent_note      text,
  obs_date        daterange,
  method          obs_method not null,
  is_primary      boolean not null,
  derived_from    uuid references public.observation(observation_id),
  surface_condition text,
  paint_state     paint_state not null default 'unknown',
  lighting_note   text,
  source_id       uuid not null references public.historical_sources,
  notes           text,
  constraint reproduction_needs_parent check ((method = 'reproduction') = (derived_from is not null)),
  constraint primary_has_no_parent    check (not (is_primary and derived_from is not null))
);
create index if not exists observation_lamning_idx on public.observation (lamning_id, is_primary);
create index if not exists observation_derived_idx on public.observation (derived_from);

-- ---------- INTERVENTION: rödmålning m.m. kontaminerar tolkningen ----------
create table if not exists public.intervention (
  intervention_id uuid primary key default gen_random_uuid(),
  lamning_id      uuid not null references public.heritage_sites(id) on delete cascade,
  kind            intervention_kind not null,
  event_date      daterange,
  agent           text,
  contaminates_interpretation boolean not null default false,
  source_id       uuid not null references public.historical_sources,
  notes           text
);
create index if not exists intervention_lamning_idx on public.intervention (lamning_id, contaminates_interpretation);

-- ---------- FIGUR + FIGURBELÄGG ----------
create table if not exists public.figure (
  figure_id       uuid primary key default gen_random_uuid(),
  lamning_id      uuid not null references public.heritage_sites(id) on delete cascade,
  local_label     text,
  geom            geometry(Polygon, 4326),   -- position på hällen; metrik via lämningens metric_srid
  authenticity    authenticity_state not null default 'unassessed',   -- DEFAULT, ej 'accepted'
  authenticity_source_id uuid references public.historical_sources,
  authenticity_note      text
);
create index if not exists figure_lamning_idx on public.figure (lamning_id, authenticity);

create table if not exists public.figure_record (
  figure_record_id uuid primary key default gen_random_uuid(),
  figure_id       uuid not null references public.figure on delete cascade,
  observation_id  uuid not null references public.observation on delete cascade,
  present         boolean not null,
  motif_class     text,
  -- SERIATION: ordinala axlar, INTE bara kategori.
  ship_asymmetry_idx   numeric check (ship_asymmetry_idx between 0 and 1),
  stem_horn_ratio      numeric,
  stern_horn_ratio     numeric,
  crew_stroke_count    integer,
  hull_line_doubled    boolean,
  ship_type_label      text,      -- kategorisk etikett, SEPARAT fält
  depicted_object_type text,
  depicted_object_note text,
  unique (figure_id, observation_id)
);
create index if not exists figure_record_present_idx on public.figure_record (observation_id) where present;

-- ---------- DATERINGSARGUMENT ----------
create table if not exists public.dating_argument (
  dating_id       uuid primary key default gen_random_uuid(),
  figure_id       uuid references public.figure on delete cascade,
  lamning_id      uuid references public.heritage_sites on delete cascade,
  method          dating_method not null,
  interval_kind   interval_kind not null,
  start_year      integer,        -- negativa = f.Kr. (heltal; ingen år 0 — dokumenterad avvikelse)
  end_year        integer,
  sigma           text,
  dated_material  dated_material,
  target_event    target_event not null,
  offset_risk     text[] default '{}',
  uncal_bp        integer,
  uncal_sd        integer,
  calibration     text,
  lab_code        text,
  plateau_affected boolean not null default false,
  provenance_reviewed boolean not null default false,   -- ändring: legacy-kö + palimpsest-samexistens
  source_id       uuid not null references public.historical_sources,
  notes           text,
  constraint one_anchor         check (num_nonnulls(figure_id, lamning_id) = 1),
  constraint c14_needs_material check (method <> 'c14' or dated_material is not null),
  constraint shoreline_is_tpq   check (method <> 'shoreline_displacement' or interval_kind = 'terminus_post_quem'),
  constraint ordered_interval   check (start_year is null or end_year is null or start_year <= end_year)
);
create index if not exists dating_argument_figure_idx on public.dating_argument (figure_id);
create index if not exists dating_argument_lamning_idx on public.dating_argument (lamning_id);
create index if not exists dating_argument_method_idx on public.dating_argument (method);

-- ---------- PALIMPSEST-SPÄRR (villkorad) + yt-/kontextnivå-undantag ----------
-- Lämningsförankring tillåts för: (1) legacy-kön (unspecified/oreviderad); (2) genuint YT-/KONTEXT-
-- nivå-metoder som daterar hela hällytan, inte en figurs ristningshändelse — strandförskjutning
-- (TPQ ur ytans landhöjning; gäller ALLA figurer på ytan lika) och sluten kontext (Sagaholm: hela
-- hällen stratigrafiskt innesluten). Allt annat reviderat måste hänga på figur.
-- LÖST (tidigare öppen fråga): en shoreline-TPQ är en egenskap hos YTAN, inte en figurs datering →
-- hör legitimt på lämningen. Spärren gäller carving-dateringar (figur-anspråk) utsmetade på hällen;
-- en yt-emergens-TPQ är inte det. Undantaget är METOD-grindat — bronze_typology/c14/superposition
-- m.fl. förblir blockerade på lämning, så hålet kan inte missbrukas.
create or replace function public.no_carving_date_on_lamning()
returns trigger language plpgsql as $$
begin
  if new.lamning_id is not null then
    if not (
         (new.target_event = 'unspecified' and new.provenance_reviewed = false)
      or (new.method in ('shoreline_displacement','sealed_context'))
    ) then
      raise exception 'Datering på lämning tillåts endast som (a) oreviderad unspecified (legacy-kö) eller (b) yt-/kontextnivå-metod (strandförskjutning/sluten kontext). Ristningsdatering hör på figur — hällen är ett palimpsest.';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_no_carving_date_on_lamning on public.dating_argument;
create trigger trg_no_carving_date_on_lamning
  before insert or update on public.dating_argument
  for each row execute function public.no_carving_date_on_lamning();

-- ---------- RLS (plattformsmönster: publik läsning, admin-skrivning) ----------
do $$
declare t text;
begin
  foreach t in array array['lamning_geometry','observation','intervention','figure','figure_record','dating_argument']
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I on public.%I;', t||'_read', t);
    execute format('create policy %I on public.%I for select using (true);', t||'_read', t);
    execute format('drop policy if exists %I on public.%I;', t||'_write', t);
    execute format('create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin());', t||'_write', t);
  end loop;
end $$;

-- ---------- VYER (ankrade på heritage_sites/historical_sources) ----------

-- Figurer som dyker upp sent: nyristning / felkomplettering vid rödmålning / äkta nyupptäckt.
create or replace view public.v_late_appearing_figures as
with first_seen as (
  select fr.figure_id, min(lower(o.obs_date)) as first_present_date
  from public.figure_record fr join public.observation o using (observation_id)
  where fr.present group by fr.figure_id
),
earlier_obs as (
  select f.figure_id,
         count(*) filter (where lower(o.obs_date) < fs.first_present_date) as n_earlier
  from public.figure f join first_seen fs using (figure_id)
  join public.observation o on o.lamning_id = f.lamning_id
  group by f.figure_id
)
select f.figure_id, f.lamning_id, l.name as lamning_name, l.source_uri,
       f.local_label, f.authenticity, fs.first_present_date,
       eo.n_earlier as missed_by_n_earlier_obs,
       o.method as first_recording_method, o.agent as first_recording_agent,
       exists (select 1 from public.intervention i
               where i.lamning_id = f.lamning_id and i.contaminates_interpretation
                 and lower(i.event_date) <= fs.first_present_date) as after_contaminating_event
from public.figure f
join public.heritage_sites l on l.id = f.lamning_id
join first_seen fs using (figure_id)
join earlier_obs eo using (figure_id)
join public.figure_record fr on fr.figure_id = f.figure_id and fr.present
join public.observation o on o.observation_id = fr.observation_id
                        and lower(o.obs_date) = fs.first_present_date
where eo.n_earlier > 0;

-- Tidigaste FÖRSTAHANDSbelägg per figur, utan fritext.
create or replace view public.v_earliest_primary_evidence as
select f.figure_id, f.local_label, l.name as lamning_name, l.source_uri,
       min(lower(o.obs_date)) as earliest_primary_date,
       (array_agg(o.agent  order by lower(o.obs_date)))[1] as earliest_agent,
       (array_agg(o.method order by lower(o.obs_date)))[1] as earliest_method,
       (array_agg(s.title  order by lower(o.obs_date)))[1] as earliest_source
from public.figure f
join public.heritage_sites l on l.id = f.lamning_id
join public.figure_record fr on fr.figure_id = f.figure_id and fr.present
join public.observation o on o.observation_id = fr.observation_id and o.is_primary
join public.historical_sources s on s.id = o.source_id
group by f.figure_id, f.local_label, l.name, l.source_uri;

-- Dateringar sida vid sida, ALDRIG hopslagna. Endast reviderade (analysvyn filtrerar kön).
create or replace view public.v_dating_conflicts as
select coalesce(d.figure_id::text, d.lamning_id::text) as anchor,
       count(distinct d.method) as n_methods,
       min(d.start_year) as earliest_bound, max(d.end_year) as latest_bound,
       bool_or(d.plateau_affected) as any_plateau,
       array_agg(distinct d.method::text) as methods,
       array_agg(distinct d.target_event::text) as target_events
from public.dating_argument d
where d.provenance_reviewed
group by 1 having count(distinct d.method) > 1;

-- Arbetskö: oreviderade lämnings-ankrade dateringar (underbestämt daterings-bestånd).
create or replace view public.v_dating_provenance_queue as
select d.dating_id, d.lamning_id, l.name as lamning_name, l.source_uri,
       d.method, d.start_year, d.end_year, d.source_id
from public.dating_argument d
join public.heritage_sites l on l.id = d.lamning_id
where d.lamning_id is not null and not d.provenance_reviewed;

-- Reproduktionskedjor: hur många led från hällen?
drop view if exists public.v_observation_depth;
create recursive view public.v_observation_depth
  (observation_id, lamning_id, agent, method, depth, root_observation) as
  select observation_id, lamning_id, agent, method, 0, observation_id
  from public.observation where derived_from is null
  union all
  select o.observation_id, o.lamning_id, o.agent, o.method, p.depth + 1, p.root_observation
  from public.observation o join v_observation_depth p on o.derived_from = p.observation_id;

-- geom lagras redan i 4326 (webbkartan läser direkt). Metrisk projektion on-demand via metric_srid.
create or replace view public.v_lamning_geometry_metric as
select geometry_id, lamning_id, metric_srid, ST_Transform(geom, metric_srid) as geom_metric,
       method, source_crs, horizontal_unc_m, is_current, source_id, recorded_at
from public.lamning_geometry;

commit;

-- ---------- MIGRATION AV rock_art_dating (1 rad) — guardad ----------
-- Årsta-skålgropsstenen är underbestämd (typologisk, plats-ankrad, ingen figur). Migreras som
-- 'unspecified'/oreviderad ENDAST om ett verifierat heritage_sites-ankare finns för den. Annars
-- lämnas raden + heritage_sites-ankaret (med FORNSÖK-verifierade koord) är en liten uppföljning.
-- Skapar INTE ett ankare med gissade koordinater (koordinat-disciplin).
do $$
declare v_lamning uuid; v_src uuid;
begin
  select id into v_lamning from public.heritage_sites where source_uri = 'Fornsök RAÄ Brännkyrka 222:1' limit 1;
  if v_lamning is null then
    raise notice 'rock_art_dating-migration: inget heritage_sites-ankare för Brännkyrka 222:1 — hoppar över. Skapa verifierat ankare (Fornsök-koord) och kör om.';
  else
    -- källrad för dateringen (arkivreferens)
    insert into public.historical_sources (title, title_en, author, reliability, language, kind, repository, repository_ref)
    select 'RAÄ Brännkyrka 222:1; Årstafältets undersökningar', 'RAÄ Brännkyrka 222:1; Årsta field investigations',
           'Riksantikvarieämbetet (Fornsök)', 'primary', 'sv', 'archive_item', 'ATA/Fornsök', 'RAÄ Brännkyrka 222:1'
    where not exists (select 1 from public.historical_sources where repository_ref = 'RAÄ Brännkyrka 222:1');
    select id into v_src from public.historical_sources where repository_ref = 'RAÄ Brännkyrka 222:1' limit 1;

    insert into public.dating_argument
      (lamning_id, method, interval_kind, start_year, end_year, target_event, provenance_reviewed, source_id, notes)
    select v_lamning, 'typology', 'range', -1800, 500, 'unspecified', false, v_src,
           'Migrerad ur rock_art_dating (pilot). Skålgropar EJ C14-daterbara; typokronologi + association. LÅG konfidens. Underbestämd → oreviderad kö, väntar figur-ankring.'
    where not exists (
      select 1 from public.dating_argument d where d.lamning_id = v_lamning and d.method = 'typology' and d.start_year = -1800);
    raise notice 'rock_art_dating-migration: 1 rad migrerad till dating_argument (unspecified/oreviderad).';
  end if;
end $$;

-- Efter apply: supabase migration repair --status applied 20260728170000 + regen types.ts (--linked).
-- rock_art_dating-tabellen lämnas kvar tills bekräftat att inget i src/ refererar den → drop separat.
