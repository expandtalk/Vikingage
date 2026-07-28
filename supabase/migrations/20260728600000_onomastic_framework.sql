-- Onomastiskt ramverk (Kalmar-pilot): stratifierade basord + temporala former + lins.
-- Analogi (Daniel): baskontoplan → namnledskronologi; huvudbok → belagda former per år;
-- sidoordnat per område → semantiska fält; IFRS → extern vokabulär (Wikidata/CIDOC/TGN).
-- Kodningen nedan är den STANDARDLÄSNING (kronologi + SOL 2003) som forskaren kan ändra.

-- 1) Stratifierande fält på ortnamnen (pilot; promotbart till global elementkatalog senare)
alter table public.kalmar_place_names
  add column if not exists head_element    text,   -- det betydelsebärande ledet (rink/ting/smed/-lösa…)
  add column if not exists semantic_domain  text,   -- krig|rätt|hantverk|makt_administration|jordbruk|natur_växt|träslag|terräng_sten|bebyggelse|personnamn|vatten_kust|kult|okänd
  add column if not exists period_stratum   text,   -- järnålder|vikingatid|tidig_medeltid|medeltid|efterreformatorisk|okänd (namnledskronologi)
  add column if not exists framework        text default 'kronologi+SOL2003';

-- 2) Belagda former över tid = "huvudboken". Kärnan i att prata mellan forskare + ta ut rapporter.
--    Mappar mot Wikidata P1448 (+ P580/P582), Getty TGN, CIDOC-CRM E48. Källa + dialektnot obligatoriskt.
create table if not exists public.place_name_forms (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references public.kalmar_place_names(id) on delete cascade,
  place_name text not null,            -- denormaliserat för enkel läsning
  attested_form text not null,         -- den belagda/alternativa stavningen
  attested_year int,                   -- år (null = odaterat)
  year_precision text,                 -- exakt|ca|sekel|odaterat
  form_kind text,                      -- historisk_belägg|dialektal|senare_namn|alt_stavning
  source text not null,                -- SOL / diplom / lokalkännedom (flaggad) …
  verified boolean not null default false,
  dialect_note text,                   -- t.ex. kalmaritiskt R (hansatida tyskt inflytande)
  external_ref text,                   -- wikidata:Qxxx / tgn:xxx (interop)
  framework text default 'ortnamnsregistret',
  created_at timestamptz default now()
);
alter table public.place_name_forms enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='place_name_forms' and policyname='pnf_read') then
    create policy pnf_read on public.place_name_forms for select using (true);
  end if;
end $$;

-- 3) Två nya namn du lyfte (verifierade koordinater)
insert into public.kalmar_place_names (name,category,sol_headword,sol_match,sol_note,element_reading,interpretation,lat,lng,source,gazetteer_match,coord_precision)
values
 ('Elverslösa','lösa','lösa','element',
  'Ej eget SOL-uppslag, men -lösa har egen översikt (SOL; NoB 59 1971). -lösa-namn hör till ett gammalt (järnålders) skikt.',
  'personnamn (Alfr?) + -lösa','Äldsta namnskiktet i området (järnålder) — bryter mot -by-bältet i tid. Äldre stavning: Elfverslösa (m. f).',
  56.6938621,16.2989738,'place_names (register) · -lösa: SOL/NoB 59 1971',true,'register'),
 ('Kläckeberga','socken','Kläckeberga','locality',
  'Kläckeberga sn, Norra Möre hd, Småland (SOL).','Kläcke- + berga','Gammal sockenkyrka (Norra Möre), aktiv under Dackefejden; hällristningar i närområdet (hjulkors, lokalt belagt). Kyrkkällaren rymmer äldre föremål.',
  56.70763889,16.28733333,'SOL 2003 · koord: Kläckeberga kyrka (RAÄ Fornsök)',false,'fornsök')
on conflict do nothing;

-- 4) Standardläsning: head_element + semantisk domän + periodskikt (forskaren kan ändra)
update public.kalmar_place_names set head_element=v.he, semantic_domain=v.dom, period_stratum=v.strat
from (values
 ('Hossmo','husaby','makt_administration','tidig_medeltid'),
 ('Rinkaby','rink','krig','vikingatid'),
 ('Tingby','ting','rätt','vikingatid'),
 ('Smedby','smed','hantverk','vikingatid'),
 ('Dörby','(oklar förled)','okänd','vikingatid'),
 ('Hagby','hage','jordbruk','vikingatid'),
 ('Råby','rå (gräns)','makt_administration','vikingatid'),
 ('Kölby','köl (ås)','terräng_sten','vikingatid'),
 ('Törneby','törne','natur_växt','vikingatid'),
 ('Skällby','(oklar förled)','okänd','vikingatid'),
 ('Tomteby','tomt','bebyggelse','vikingatid'),
 ('Guttorp','personnamn','personnamn','medeltid'),
 ('Ebbetorp','Ebbe','personnamn','medeltid'),
 ('Barketorp','personnamn','personnamn','medeltid'),
 ('Perstorp','Per','personnamn','medeltid'),
 ('Ölvingstorp','Ölving','personnamn','medeltid'),
 ('Aspö','asp','träslag','okänd'),
 ('Ekö','ek','träslag','okänd'),
 ('Boön','bo','bebyggelse','okänd'),
 ('Dunö','dun','terräng_sten','okänd'),
 ('Stensö','sten','terräng_sten','okänd'),
 ('Styrsö','styr','okänd','okänd'),
 ('Ramsö','rams','natur_växt','okänd'),
 ('Grimskär','Grim (personnamn)','personnamn','efterreformatorisk'),
 ('Kungsholmen','kung','makt_administration','efterreformatorisk'),
 ('Elverslösa','-lösa','personnamn','järnålder'),
 ('Kläckeberga','berga','terräng_sten','järnålder')
) as v(name,he,dom,strat)
where kalmar_place_names.name = v.name;

-- Stensö ↔ Kalmar: samma sten-led (kalm 'stenröse' + mar 'grund vik'). Din hypotes om ett tidigt sten-namn.
update public.kalmar_place_names
   set interpretation = 'sten + ö. Etymologiskt släkt med Kalmars eget namn (kalm ''stenröse'' + mar ''grund vik''). Hypotes (Daniel): ett tidigt sten-namn för platsen, ett av Kalmars första namn.'
 where name='Stensö';

-- 5) Belagda former = huvudboken (källförda; lokalkännedom flaggas som overifierad)
insert into public.place_name_forms (place_id,place_name,attested_form,attested_year,year_precision,form_kind,source,verified,dialect_note)
select k.id,k.name,f.form,f.yr,f.yp,f.kind,f.src,f.ver,f.dn from (values
 ('Hossmo','Hwsamo',1362,'exakt','historisk_belägg','SOL 2003 (avskr.)',true,null),
 ('Elverslösa','Elfverslösa',null,'odaterat','alt_stavning','Daniel Larsson (lokalkännedom)',false,'äldre stavning med -f-'),
 ('Boön','Boholmarna',null,'odaterat','senare_namn','Daniel Larsson (lokalkännedom)',false,'öns senare namn'),
 ('Skällby','Skiellby',null,'odaterat','dialektal','Daniel Larsson (lokalkännedom)',false,'variant med -i-; ev. dialektal/äldre stavning')
) as f(pname,form,yr,yp,kind,src,ver,dn)
join public.kalmar_place_names k on k.name=f.pname;

-- Vy: forskarens geotaggnings-arbetslista (ej färdig-geotaggat = approx/placeholder)
create or replace view public.v_kalmar_needs_geotag as
  select name,category,head_element,coord_precision,lat,lng
  from public.kalmar_place_names
  where coord_precision in ('approx-osm','placeholder')
  order by (coord_precision='placeholder') desc, name;
