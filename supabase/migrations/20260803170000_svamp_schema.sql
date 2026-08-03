-- =====================================================================
--  SVAMPKARTA — fundament (Fas 1). Nationellt (hela Sverige).
--  ADAPTERAT från Daniels spec: h3-extension SAKNAS på denna Supabase →
--  H3-index lagras som TEXT (beräknas i app/edge med h3-js), ingen h3index-typ.
--  pg_cron/pg_net EJ installerade → cron-jobben (Fas 2) ingår ej här.
--  postgis 3.3.7 + pgcrypto finns. Liebigs min()-modell + GDD-fenologi bevarad.
-- =====================================================================
create extension if not exists postgis;
create extension if not exists pgcrypto;

create schema if not exists svamp;
set search_path = svamp, public;

-- 1. REFERENSDATA -----------------------------------------------------
do $$ begin
  create type svamp.vegetationszon as enum
    ('nemoral','boreonemoral','sydboreal','mellanboreal','nordboreal','fjallbjork');
exception when duplicate_object then null; end $$;
do $$ begin
  create type svamp.sakerhetsklass as enum
    ('A_taggsvamp','B_kantarell','C_sopp','D_ticka','E_riska','kraver_checklista','ej_matsvamp');
exception when duplicate_object then null; end $$;
do $$ begin
  create type svamp.naringsstrategi as enum ('mykorrhiza','saprofyt','parasit');
exception when duplicate_object then null; end $$;
do $$ begin
  create type svamp.restriktionstyp as enum
    ('nationalpark','naturreservat_forbud','naturreservat_husbehov','naturminne',
     'skyddsobjekt','militart_omrade','hemfridszon','privat');
exception when duplicate_object then null; end $$;
do $$ begin
  create type svamp.fyndtyp as enum ('fynd','tomt','gammalt','for_ungt');
exception when duplicate_object then null; end $$;

create table if not exists svamp.region (
  id text primary key, namn text not null,
  geom geometry(MultiPolygon, 3006) not null,
  aktiv boolean not null default true, skapad timestamptz not null default now());
create index if not exists region_geom_idx on svamp.region using gist (geom);
-- Nationell region: SWEREF99 TM-bbox över Sverige (approximativ ram, ej exakt polygon).
insert into svamp.region (id, namn, geom) values
  ('sverige','Sverige (nationell ram)',
   st_multi(st_makeenvelope(260000, 6130000, 920000, 7700000, 3006)))
on conflict do nothing;

-- 2. ARTPROFILER ------------------------------------------------------
create table if not exists svamp.art (
  id text primary key, vetenskapligt_namn text not null, svenskt_namn text not null,
  dyntaxa_id integer, sakerhetsklass svamp.sakerhetsklass not null,
  naringsstrategi svamp.naringsstrategi not null,
  gdd_bas_c numeric(4,1) not null default 5.0, gdd_start integer not null, gdd_slut integer not null,
  dagslangd_min_h numeric(4,2), dagslangd_max_h numeric(4,2),
  lagg_dagar_min smallint not null, lagg_dagar_max smallint not null,
  api_troskel numeric(6,2) not null, markfukt_optimum numeric(4,3), markfukt_min numeric(4,3),
  marktemp_min_c numeric(4,1) not null, marktemp_opt_c numeric(4,1) not null, marktemp_max_c numeric(4,1) not null,
  kylslag_kanslighet numeric(3,2) not null default 0,
  taler_frost boolean not null default false, frost_troskel_c numeric(4,1) default -2.0,
  zoner svamp.vegetationszon[] not null, aktiv boolean not null default true);

create table if not exists svamp.art_habitatpref (
  art_id text not null references svamp.art(id) on delete cascade,
  variabel text not null, varde text not null, vikt numeric(4,3) not null,
  primary key (art_id, variabel, varde));

create table if not exists svamp.forvaxlingsrisk (
  art_id text not null references svamp.art(id) on delete cascade,
  forvaxlingsart text not null, allvarlighet smallint not null check (allvarlighet between 1 and 5),
  skiljande_karaktar text not null, primary key (art_id, forvaxlingsart));

-- 3. HABITAT (statiskt, H3 res 9 som text) ----------------------------
create table if not exists svamp.hex9 (
  h3 text primary key, region_id text not null references svamp.region(id),
  centroid geometry(Point, 3006) not null, h3_res7 text not null,
  hojd_m numeric(6,1), lutning_grad numeric(4,1), aspekt_grad numeric(4,0), twi numeric(5,2),
  nmd_klass smallint, tradslag_dom text, tradslag_and jsonb,
  bestandsalder smallint, grundyta numeric(5,1), krontackning numeric(4,3),
  jordart text, jordart_skala integer, kalkhalt_idx numeric(4,3), zon svamp.vegetationszon,
  avverkad_ar smallint, bebyggd boolean not null default false,
  uppdaterad timestamptz not null default now());
create index if not exists hex9_centroid_idx on svamp.hex9 using gist (centroid);
create index if not exists hex9_res7_idx on svamp.hex9 (h3_res7);
create index if not exists hex9_region_idx on svamp.hex9 (region_id);

create table if not exists svamp.hex_habitat (
  h3 text not null references svamp.hex9(h3) on delete cascade,
  art_id text not null references svamp.art(id) on delete cascade,
  score numeric(4,3) not null check (score between 0 and 1),
  berakad timestamptz not null default now(), primary key (h3, art_id));
create index if not exists hex_habitat_art_idx on svamp.hex_habitat (art_id, score desc) where score >= 0.15;

-- 4. VÄDER (dynamiskt, H3 res 7 som text) -----------------------------
create table if not exists svamp.hex7 (
  h3 text primary key, region_id text not null references svamp.region(id),
  centroid geometry(Point, 3006) not null,
  lat numeric(9,6) not null, lon numeric(9,6) not null, medelhojd_m numeric(6,1));
create index if not exists hex7_centroid_idx on svamp.hex7 using gist (centroid);

create table if not exists svamp.vader_dag (
  h3 text not null references svamp.hex7(h3) on delete cascade, datum date not null,
  nederbord_mm numeric(6,2), marktemp_7cm numeric(4,1), marktemp_28cm numeric(4,1),
  markfukt_7cm numeric(4,3), markfukt_28cm numeric(4,3),
  lufttemp_min numeric(4,1), lufttemp_max numeric(4,1), et0_mm numeric(5,2),
  prognos boolean not null default false, kalla text not null,
  primary key (h3, datum, prognos)) partition by range (datum);
create table if not exists svamp.vader_dag_2026 partition of svamp.vader_dag
  for values from ('2026-01-01') to ('2027-01-01');

create table if not exists svamp.vader_tillstand (
  h3 text primary key references svamp.hex7(h3) on delete cascade, datum date not null,
  api numeric(7,2) not null, api_k numeric(4,3) not null default 0.90,
  markfukt_7d_medel numeric(4,3), markfukt_14d_medel numeric(4,3), markfukt_21d_medel numeric(4,3),
  marktemp_7d_medel numeric(4,1), gdd_ack numeric(7,1) not null,
  dagar_sedan_genomvatning smallint, temp_delta_5d numeric(4,1),
  frost_intraffad boolean not null default false, frost_datum date,
  uppdaterad timestamptz not null default now());

-- 5. REGELVERK (hård maskering) ---------------------------------------
create table if not exists svamp.restriktion (
  id bigserial primary key, typ svamp.restriktionstyp not null, namn text,
  plockning_tillaten boolean not null, foreskrift_url text,
  geom geometry(MultiPolygon, 3006) not null, kalla text, hamtad timestamptz not null default now());
create index if not exists restriktion_geom_idx on svamp.restriktion using gist (geom);

-- 6. DAGLIG SCORING (gles) --------------------------------------------
create table if not exists svamp.score_dag (
  datum date not null, h3 text not null, art_id text not null references svamp.art(id),
  score numeric(4,3) not null, habitat_del numeric(4,3) not null,
  vatten_del numeric(4,3) not null, temp_del numeric(4,3) not null, fenologi_del numeric(4,3) not null,
  begransande text not null, primary key (datum, h3, art_id)) partition by range (datum);
create table if not exists svamp.score_dag_2026 partition of svamp.score_dag
  for values from ('2026-01-01') to ('2027-01-01');
create index if not exists score_2026_idx on svamp.score_dag_2026 (datum, art_id, score desc);

-- 7. ANVÄNDARDATA — turer, fynd, NEGATIVA observationer ---------------
create table if not exists svamp.tur (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  start_tid timestamptz not null, slut_tid timestamptz,
  spar geometry(LineStringZM, 3006), anteckning text, skapad timestamptz not null default now());
create index if not exists tur_user_idx on svamp.tur (user_id, start_tid desc);

create table if not exists svamp.fynd (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tur_id uuid references svamp.tur(id) on delete set null,
  typ svamp.fyndtyp not null, art_id text references svamp.art(id),
  geom geometry(Point, 3006) not null, h3_9 text not null, h3_7 text not null,
  observerad timestamptz not null, antal smallint, vikt_g integer,
  mognadsgrad smallint check (mognadsgrad between 1 and 5),
  bestamning_sakerhet smallint check (bestamning_sakerhet between 1 and 5),
  sporavtryck_farg text, checklista_klar boolean not null default false, bekraftad_av text,
  foto_urls text[], anteckning text, skapad timestamptz not null default now());
create index if not exists fynd_user_idx on svamp.fynd (user_id, observerad desc);
create index if not exists fynd_hex_idx on svamp.fynd (h3_9, art_id);

create table if not exists svamp.stalle (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  namn text not null, art_id text references svamp.art(id),
  geom geometry(Polygon, 3006) not null, h3_9 text[],
  forsta_aret smallint, anteckning text, skapad timestamptz not null default now());

create table if not exists svamp.stalle_skord (
  stalle_id uuid not null references svamp.stalle(id) on delete cascade,
  ar smallint not null, datum date not null, vikt_g integer,
  bedomning smallint check (bedomning between 1 and 5), primary key (stalle_id, datum));

-- 8. RLS --------------------------------------------------------------
alter table svamp.tur enable row level security;
alter table svamp.fynd enable row level security;
alter table svamp.stalle enable row level security;
alter table svamp.stalle_skord enable row level security;
do $$ begin
  create policy egna_turer on svamp.tur for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  create policy egna_fynd on svamp.fynd for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  create policy egna_stallen on svamp.stalle for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  create policy egna_skordar on svamp.stalle_skord for all using (
    exists (select 1 from svamp.stalle s where s.id = stalle_skord.stalle_id and s.user_id = auth.uid()));
exception when duplicate_object then null; end $$;
alter table svamp.art enable row level security;
alter table svamp.hex_habitat enable row level security;
alter table svamp.score_dag enable row level security;
do $$ begin
  create policy art_las on svamp.art for select to authenticated using (true);
  create policy habitat_las on svamp.hex_habitat for select to authenticated using (true);
  create policy score_las on svamp.score_dag for select to authenticated using (true);
exception when duplicate_object then null; end $$;

-- 9. FUNKTIONER (search_path bundet) ----------------------------------
create or replace function svamp.respons(v numeric, minv numeric, optlo numeric, opthi numeric, maxv numeric)
returns numeric language sql immutable set search_path = svamp, public as $$
  select case when v is null then 0 when v <= minv or v >= maxv then 0
    when v < optlo then (v - minv) / nullif(optlo - minv, 0)
    when v > opthi then (maxv - v) / nullif(maxv - opthi, 0) else 1 end::numeric(4,3); $$;

-- (Fas 2: uppdatera_tillstand + berakna_score aktiveras när väderdata finns. Regelmodellen
--  är oförändrad från specen; min()-scoring läggs till med ingest-pipelinen.)

-- 11. SEED — nationell lågrisk-portfölj (klass A–E) + förväxlingsrisker.
--  Lagg/trösklar är STARTVÄRDEN att kalibrera mot fyndloggen efter två säsonger.
insert into svamp.art (id,vetenskapligt_namn,svenskt_namn,sakerhetsklass,naringsstrategi,gdd_start,gdd_slut,lagg_dagar_min,lagg_dagar_max,api_troskel,markfukt_optimum,markfukt_min,marktemp_min_c,marktemp_opt_c,marktemp_max_c,kylslag_kanslighet,taler_frost,zoner) values
('blek_taggsvamp','Hydnum repandum','Blek taggsvamp','A_taggsvamp','mykorrhiza',900,2100,12,18,45,0.30,0.20,8,14,20,0.10,false,'{boreonemoral,sydboreal,mellanboreal}'),
('trattkantarell','Craterellus tubaeformis','Trattkantarell','B_kantarell','mykorrhiza',1100,2400,10,14,35,0.32,0.22,6,12,18,0.15,true,'{nemoral,boreonemoral,sydboreal,mellanboreal,nordboreal}'),
('kantarell','Cantharellus cibarius','Kantarell','B_kantarell','mykorrhiza',750,1900,14,21,55,0.30,0.21,12,16,22,0.00,false,'{nemoral,boreonemoral,sydboreal,mellanboreal}'),
('svart_trumpetsvamp','Craterellus cornucopioides','Svart trumpetsvamp','B_kantarell','mykorrhiza',1200,2200,14,21,50,0.31,0.22,10,15,20,0.10,false,'{nemoral,boreonemoral}'),
('karljohan','Boletus edulis','Karl Johan','C_sopp','mykorrhiza',850,2200,10,14,40,0.28,0.19,10,15,21,0.40,false,'{nemoral,boreonemoral,sydboreal,mellanboreal,nordboreal}'),
('sandsopp','Suillus variegatus','Sandsopp','C_sopp','mykorrhiza',800,2300,10,14,30,0.24,0.15,9,15,22,0.20,false,'{boreonemoral,sydboreal,mellanboreal,nordboreal}'),
('farticka','Albatrellus ovinus','Fårticka','D_ticka','mykorrhiza',950,2000,12,16,45,0.31,0.21,9,14,19,0.10,false,'{boreonemoral,sydboreal,mellanboreal,nordboreal}'),
('granblodriska','Lactarius deterrimus','Granblodriska','E_riska','mykorrhiza',1000,2300,10,14,35,0.30,0.20,8,14,20,0.15,true,'{boreonemoral,sydboreal,mellanboreal}'),
('stolt_fjallskivling','Macrolepiota procera','Stolt fjällskivling','kraver_checklista','saprofyt',1000,2100,5,10,25,0.28,0.18,12,17,24,0.00,false,'{nemoral,boreonemoral,sydboreal}')
on conflict (id) do nothing;

insert into svamp.forvaxlingsrisk (art_id,forvaxlingsart,allvarlighet,skiljande_karaktar) values
('kantarell','Toppig giftspindling (Cortinarius rubellus)',5,'Kantarell har trubbiga åsar som löper ner på foten, hel fast fruktkropp, aprikosdoft, gul rakt igenom. Spindlingen har ÄKTA SKIVOR och spindelvävsrester. Orellanin skadar njurarna med veckors fördröjning.'),
('kantarell','Falsk kantarell (Hygrophoropsis aurantiaca)',1,'Falsk kantarell har äkta gaffelgrenade skivor och mjukare kött.'),
('stolt_fjallskivling','Vit flugsvamp (Amanita virosa)',5,'Plocka ENDAST fullt utslagna. Krav: fjällig ormskinnsfot, FLYTTBAR dubbelring, INGEN strumpa/volva vid basen, hatt över 15 cm. Unga oöppnade exemplar lämnas alltid.'),
('stolt_fjallskivling','Rodnande fjällskivling m.fl.',2,'Kött som rodnar kraftigt vid snitt — lämna.'),
('karljohan','Gallsopp (Tylopilus felleus)',1,'Rosa rörmynning och nätmönster i mörk relief. Beskt — smaka en bit rå.'),
('karljohan','Djävulssopp (Rubroboletus satanas)',3,'Röd rörmynning och rödaktig fot. Ovanlig, kalkmark i söder.'),
('farticka','Brödmärgsticka (Albatrellus confluens)',1,'Ätlig men beskare. Ingen risk.'),
('granblodriska','Skäggriska m.fl.',1,'Mjölksaftens färg avgör: granblodriska ger orange mjölk som grönar.')
on conflict (art_id,forvaxlingsart) do nothing;
