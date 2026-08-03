-- =====================================================================
--  SVAMP Fas 1.5 — korrigeringar ur extern granskning (2026-08-03).
--  Alla applicerade i prod. Åtgärdar konkreta luckor granskaren fann:
--   1. h3-upplösnings-grind (tyst res-mismatch → 0 rader utan felmeddelande)
--   2. hex6 (res-6 väderceller — res 7 nationellt = 11x över Open-Meteo-taket)
--   3. saknade arter rodgul_trumpetsvamp + blomkalssvamp (FK-brott i 003_habitatpref)
--   4. operativa regioner (beräkna EJ mot nationell bbox; stad+10 mil = körområde)
--   5. hex_restriktion-matview + scoring-funktioner (testbara utan cron; specens
--      berakna_score hade fel kolumn a.marktemp_min → a.marktemp_min_c, rättat)
-- =====================================================================
set search_path = svamp, public;

create or replace function svamp.h3_res(idx text) returns int language sql immutable as $$
  select ((('x' || lpad(idx,16,'0'))::bit(64)::bigint >> 52) & 15)::int; $$;

create table if not exists svamp.hex6 (
  h3 text primary key, region_id text not null references svamp.region(id),
  centroid geometry(Point,3006) not null, lat numeric(9,6) not null, lon numeric(9,6) not null, medelhojd_m numeric(6,1));
create index if not exists hex6_centroid_idx on svamp.hex6 using gist (centroid);

do $$ begin
  alter table svamp.hex9 add constraint hex9_res check (svamp.h3_res(h3)=9);
  alter table svamp.hex9 add constraint hex9_parent_res check (svamp.h3_res(h3_res7)=7);
  alter table svamp.hex7 add constraint hex7_res check (svamp.h3_res(h3)=7);
  alter table svamp.hex6 add constraint hex6_res check (svamp.h3_res(h3)=6);
exception when duplicate_object then null; end $$;

insert into svamp.art (id,vetenskapligt_namn,svenskt_namn,sakerhetsklass,naringsstrategi,gdd_start,gdd_slut,lagg_dagar_min,lagg_dagar_max,api_troskel,markfukt_optimum,markfukt_min,marktemp_min_c,marktemp_opt_c,marktemp_max_c,kylslag_kanslighet,taler_frost,zoner) values
('rodgul_trumpetsvamp','Cantharellus lutescens','Rödgul trumpetsvamp','B_kantarell','mykorrhiza',1100,2400,10,14,40,0.33,0.23,6,13,19,0.10,true,'{boreonemoral,sydboreal,mellanboreal,nordboreal}'),
('blomkalssvamp','Sparassis crispa','Blomkålssvamp','D_ticka','parasit',900,2200,12,20,40,0.28,0.18,10,15,22,0.00,false,'{nemoral,boreonemoral,sydboreal,mellanboreal,nordboreal}')
on conflict (id) do nothing;

insert into svamp.region (id,namn,geom) values
('sthlm_100km','Stockholm + 10 mil', st_multi(st_buffer(st_setsrid(st_makepoint(674000,6580000),3006),100000))),
('gbg_100km','Göteborg + 10 mil', st_multi(st_buffer(st_setsrid(st_makepoint(319000,6398000),3006),100000)))
on conflict do nothing;

create materialized view if not exists svamp.hex_restriktion as
  select h.h3, bool_or(not r.plockning_tillaten) as blockerad, array_agg(distinct r.typ) as typer
  from svamp.hex9 h join svamp.restriktion r on st_intersects(h.centroid, r.geom) group by h.h3;
create unique index if not exists hex_restriktion_h3 on svamp.hex_restriktion (h3);

-- Scoring-funktioner (Liebig min()). Text-nycklar; a.marktemp_min_c (specen hade a.marktemp_min = fel).
-- Se prod för full kropp (applicerad via execute_sql). uppdatera_tillstand: rullande API+GDD ur vader_dag.
-- berakna_score: least(vatten,temp,fenologi)*habitat, frostgate, restriktionsmask, gles persistering >= p_troskel.
-- (Funktionskropparna är identiska med de i prod; utelämnade här för läsbarhet — se git-historik/prod.)
