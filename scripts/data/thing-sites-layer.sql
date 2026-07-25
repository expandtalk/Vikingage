-- Tingsplats-lager (thing_sites) — förhistoriska och medeltida tingsplatser i Sverige.
-- Proveniens: Fridolf Wildte, "Tingsplatserna i Sverige under förhistorisk tid och
-- medeltid" (Fornvännen 1926, s. 211–230; PD via samla.raa.se) + runstenarnas
-- þingstaþ-belägg + landskapslagarnas häradsting. Applicerad via psql (pooler).
--
-- period_start/period_end = UNGEFÄRLIG bruksperiod (år). usage_note = daterat belägg.
-- confidence: high = välkänt monument/urkundsbelägg + säkert läge; medium = sockencentroid;
-- low = osäkert läge/försvunnet namn. Koordinater för medium/low är approximativa.

create table if not exists public.thing_sites (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  thing_type    text,                 -- landsting | häradsting | hundaresting | okänt
  jurisdiction  text,                 -- härad/hundare/land
  landscape     text,
  monument_type text,                 -- tingshög | domarring | skeppssättning | kyrka | naturlig höjd | samlingsplats
  evidence_type text,                 -- runsten | urkund | ortnamn | tradition | arkeologi
  period_start  integer,
  period_end    integer,
  usage_note    text,
  confidence    text default 'medium',
  source        text default 'Wildte 1926 (Fornvännen)',
  description   text,
  lat           double precision,
  lng           double precision,
  geom          geometry(Point, 4326),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists thing_sites_geom_idx on public.thing_sites using gist (geom);

alter table public.thing_sites enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='thing_sites' and policyname='Thing sites are publicly viewable') then
    create policy "Thing sites are publicly viewable" on public.thing_sites for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='thing_sites' and policyname='Admins can manage thing sites') then
    create policy "Admins can manage thing sites" on public.thing_sites for all using (is_admin()) with check (is_admin());
  end if;
end $$;

-- Seed (idempotent: rensa Wildte-seed och lägg in på nytt) --------------------
delete from public.thing_sites where source = 'Wildte 1926 (Fornvännen)';

insert into public.thing_sites
  (name, thing_type, jurisdiction, landscape, monument_type, evidence_type,
   period_start, period_end, confidence, usage_note, description, lat, lng, geom)
select t.*, ST_SetSRID(ST_MakePoint(t.lng, t.lat), 4326)
from (values
  -- Svealand -----------------------------------------------------------------
  ('Tingshögen vid Gamla Uppsala','landsting','Tiundaland','Uppland','tingshög','arkeologi',
    500,1300,'high','Kult- och tingsplats; blót tre gånger om året','Alla svears heliga plats; Torgny lagman talade här inför sveakonungen.',59.8986,17.6338),
  ('Anundshögen','häradsting','Siende härad','Västmanland','tingshög','arkeologi',
    500,1500,'high','Tingsställe in i medeltid','Tingshög vid stort gravfält och Badelunda.',59.6106,16.6325),
  ('Aspa löt','häradsting','Rönö härad','Södermanland','tingshög','runsten',
    1000,1455,'high','Dombrev 1302; ännu tingsställe 1455','Runsten rest ''a þikstaþi''; tingshög som tjänstgjorde in i medeltid.',58.8600,16.9800),
  ('Lundboaberg','häradsting','Tortuna','Västmanland','naturlig höjd','tradition',
    800,1400,'medium','','Naturlig tingsplatå omgiven av låg jordvall.',59.6800,16.7200),
  ('Vallentuna tingsplats','hundaresting','Vallentuna hundare','Uppland','runsten','runsten',
    1000,1300,'high','','Jarlabankes runsten: ''lät iordningställa detta tingsställe (þingstaþ)''.',59.5346,18.0783),
  ('Bällsta','hundaresting','Vallentuna hundare','Uppland','runsten','runsten',
    1000,1200,'medium','','Runsten rest å tingsställe.',59.5300,18.0600),
  ('Folklandstingstad, Lunda','landsting','Attundaland','Uppland','samlingsplats','ortnamn',
    900,1300,'medium','','Attundalands landsting; skulle ha blivit köpstad om utvecklingen inte motarbetats.',59.6200,17.8600),
  ('Tingberget vid Vaxala','hundaresting','Vaksala härad','Uppland','höjd','urkund',
    1200,1667,'medium','Domställe omtalat 1667–84','Höjd invid Vaxala kyrka, "domställe".',59.8600,17.6800),
  ('Bälinge tingsställe','hundaresting','Bälinge hundare','Uppland','naturlig höjd','runsten',
    1000,1400,'low','','Runinskrift i flyttblock vid tingstukällan.',59.9500,17.5500),
  ('Mora stenar','landsting','Lagga','Uppland','samlingsplats','urkund',
    1000,1500,'medium','Kungaval','"Mora äng/Mora stenar" — sveakonungens valplats.',59.8300,17.7500),
  ('Kjula ås','häradsting','Österrekarne härad','Södermanland','domarring','tradition',
    400,1100,'low','','Domarring, av Almgren anförd som tingsplats.',59.3600,16.6600),
  ('Mellösa','häradsting','','Södermanland','domarring','tradition',
    400,1100,'low','','Domarring med tingstradition (Almgren).',59.1000,16.2000),
  -- Västergötland ------------------------------------------------------------
  ('Bäsingen vid Larv','häradsting','Laske härad','Västergötland','tingshög','ortnamn',
    800,1500,'medium','','Karaktäristisk tingshög med skarp kägla vid Larvs kyrka; jfr ordet "bäsing".',58.1500,13.1500),
  ('Götala','landsting','','Västergötland','domarring','tradition',
    500,1300,'medium','','"Alla götars ting"; kulle med två domareringar nära Skara.',58.3700,13.4700),
  ('Ekornavallen, Hornborga','lagmansting','','Västergötland','domarring','urkund',
    500,1200,'medium','','Kring-Alle täljde lag (västgötalagens lagmanslängd).',58.2800,13.5500),
  ('Askeberga, Vads socken','häradsting','Vadsbo härad','Västergötland','skeppssättning','tradition',
    400,1200,'medium','','Ståtlig stenkrets; trolig tingsplats. Socknen Vad antas ha gett namn åt Vadsbo.',58.5500,14.1500),
  ('Läppesås','häradsting','Bjärke härad','Västergötland','samlingsplats','urkund',
    1200,1500,'low','','Medeltida tingsställe utom bebyggelsen; namnet försvunnet.',58.0500,12.6000),
  -- Småland ------------------------------------------------------------------
  ('Inglingehögen, Ingelstad','häradsting','Konga härad','Småland','tingshög','arkeologi',
    500,1300,'high','','Tingshög (Inglinge hög med klot och krona).',56.7433,14.9200),
  ('Brödrakulla vid Reftele','häradsting','Västbo härad','Småland','runsten','runsten',
    1000,1400,'medium','','Brödrastenen rest å tingsställe; sägen omnämnd av Olaus Magnus.',57.1700,13.6600),
  ('Vetlanda','häradsting','Östra härad (Njudung)','Småland','kyrkby','urkund',
    1200,1600,'medium','Häradets tingsställe medeltid–nutid','Gammal huvudort och tingsställe.',57.4344,15.0722),
  ('Vimmerby','häradsting','Sevede härad','Småland','marknadsplats','urkund',
    1200,1600,'medium','','Marknadsplats, sedermera stad, tingsställe för Sevede härad.',57.6675,15.8558),
  -- Östergötland -------------------------------------------------------------
  ('Stångebro (Liunga ting)','landsting','Hanekinds härad','Östergötland','skeppssättning','arkeologi',
    800,1100,'high','Skeppssättning daterad 890–1030','Trolig plats för Liunga landsting; flyttades sedan till Liunga kauping (Linköping).',58.4199,15.6355),
  ('Slaka kyrka','häradsting','Hanekinds härad','Östergötland','kyrka','urkund',
    1300,1500,'high','"oppo Hanakinds thingxstadh widher Slaka kyrkio" 1414','Häradsting vid kyrkan.',58.3700,15.5500),
  ('Törnevalla kyrka','häradsting','Bankekinds härad','Östergötland','kyrka','urkund',
    1000,1500,'high','"in ecclesia Törnewalla" 1405','Ting vid kyrkan; två runstenar (skepp, gillebroder).',58.4400,15.7900),
  ('Klockrike','häradsting','Bobergs härad','Östergötland','klockarestuga','urkund',
    1300,1500,'high','Första belagda inomhustinget 1424','Ting i klockarstugan 1424.',58.5500,15.3500),
  ('Gisingsvall vid Hogstad','häradsting','Göstrings härad','Östergötland','samlingsplats','ortnamn',
    900,1400,'medium','','Namnet ur häradet Gilstring/Gising; gammalt tingsställe.',58.2500,14.9800),
  ('Skatna','häradsting','Memmings härad','Östergötland','samlingsplats','ortnamn',
    1000,1500,'low','','"Skatnating" — tinget benämnt efter Skatna.',58.5500,16.3000),
  ('Hästholmen','häradsting','Lysings härad','Östergötland','överfartsort','urkund',
    1100,1400,'medium','','Lysings ting vid viktig överfartsort på väg att bli köpstad.',58.2920,14.7250),
  -- Värmland / Norrland / Dalarna --------------------------------------------
  ('Tingvalla (Karlstad), Lagberget','landsting','','Värmland','naturlig höjd','urkund',
    1300,1600,'medium','Landsting på Lagberget 1468 och 1473','Värmlands landsting.',59.3793,13.5036),
  ('Fors kyrka','häradsting','','Jämtland','kyrkstuga','urkund',
    1300,1500,'medium','Ting i Fors kyrkstuga 1346','Tidigt belagt inomhusting.',63.1800,14.6500),
  ('Hedemora klockarstuga','häradsting','','Dalarna','klockarestuga','urkund',
    1300,1500,'medium','Fastebrev vid ting i klockarstugan 1408','Tidigt inomhusting i Dalarna.',60.2783,15.9847)
) as t(name, thing_type, jurisdiction, landscape, monument_type, evidence_type,
       period_start, period_end, confidence, usage_note, description, lat, lng);
