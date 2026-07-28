-- Treby (Träby) borg, Segerstad sn, Öland — full ingest ur tre källor:
--   1) Papmehl-Dufay, L. & Isaksson, S. 2025. "Treby borg. Arkeologiska undersökningar av Treby
--      fornborg, L1956:3284, RAÄ Segerstad 22:1…", Rapporter från Arkeologiska forskningslaboratoriet
--      nr 42, Stockholms universitet. (forskningsprogr. "Kris, konflikt och klimat 300–700", RJ)
--   2) Stenberger, M. 1933. Öland under äldre järnåldern (diss. Uppsala) / Ölands forntida borgar.
--   3) Natur och Kultur på Öland (Länsstyrelsen i Kalmar län 2001, område K8o).
-- Ingen prosa är påhittad; tolkningar attribueras till respektive undersökare.

-- ==========================================================================================
-- A. Berika själva borgraden (dateringsmodell + arkitektur + funktionstolkning).
-- ==========================================================================================
update public.swedish_hillforts set
  period = 'Folkvandringstid (ca 375–550 e.Kr.); enstaka förfornborg-fynd av yngre förromersk järnålder',
  dating_basis = '2×14C (förkolnat sädeskorn i K86, hus M24a: 418–538 e.Kr.; människoben ur hus O11, östra ringen, undersökt 1966: 430–559 e.Kr. — bägge kal. 95,4 %, Bronk Ramsey/Reimer 2020) + fyndtypologi (folkvandringstida silverring, glaspärlor) + geokemisk kartering. Fibula (F205) och glasring (1966) av yngre förromersk typ tolkas som förfornborg-aktivitet, ej borgens ålder.',
  dating_confidence = 'belagd',
  dating_source = 'Papmehl-Dufay & Isaksson 2025 (Rapporter från AFL nr 42); Stenberger 1933; Länsstyrelsen Kalmar 2001',
  description = 'En av Ölands mest egenartade borgar: tre sammanbyggda ringborgar i NO–SV-riktning, tillsammans ca 210×75 m, på Stora Alvaret ca 700 m N om Träby by (ca 6 km N om Eketorp, 13 km S om Triberga). Inre diametrar: NO-ringen 48–66 m, mellersta 51–65 m, SV-ringen 38–44 m; stenvallar 7–10 m breda och 1–2 m höga av vittrad kalksten. Hus låg vägg-i-vägg radiellt mot murens insida kring en öppen mittplats (jfr Ismantorp, som dock saknar bebyggelse mot mitten). Rhezelius räknade 1634 husgrunder till 30 (NO) / 32 (mellersta) / 14 (SV); LiDAR + fält 2024 kunde belägga 25 (NO) och 27 (mellersta), västra ringen utan bevarade grunder. Gravfält (RAÄ Segerstad 44:1, ~tio runda stensättningar) ca 200 m öster om borgen. I den nästan utplånade SV-ringen ligger ruinen efter nyhemmanet Christineborg (skattlagt 1793, bebott till 1885). Länge använd som stenbrott.',
  cultural_significance = 'Byggnadskronologi (schakt 2–3, 2024): den mellersta ringen är äldst; östra och västra murarna byggdes för att ansluta till den, sannolikt nära i tid. Funktionstolkning: låg fyndtäthet (~22 g/m² mot ~334 g/m² på den samtida storgården Gamla Skogsby), nästan ingen hushållskeramik och bara en möjlig, sparsamt använd härd talar för icke-boplats-bruk och ett ordnat övergivande (inga brandspår; obränt/bränt ben ~95/5). Geokemin visar rumsligt differentierade aktiviteter mellan borgrummen (östra ringen mer intensivt nyttjad: föda + kopparlegeringshantverk; mellersta: järn). Unik arkitektur bland Ölands ringborgar. Källor: Papmehl-Dufay & Isaksson 2025; Stenberger 1933; Länsstyrelsen Kalmar 2001.',
  source_reference = 'Ludvig Papmehl-Dufay & Sven Isaksson 2025, Rapporter från Arkeologiska forskningslaboratoriet nr 42 (SU); Mårten Stenberger 1933, Öland under äldre järnåldern; Natur och Kultur på Öland (Länsstyrelsen i Kalmar län 2001, K8o).'
 where id = '39413875-c3a3-4180-b2dd-7d208981a5aa';

-- ==========================================================================================
-- B. Undersökningshistorik (archaeological_investigations).
-- ==========================================================================================
insert into public.archaeological_investigations
  (source_uri, title, investigation_type, year_from, year_to, parish, municipality, county, landscape, lat, lng,
   geo_precision, period, keywords, finds_summary, report_url, source_institution, license)
values
 ('treby-borg:rhezelius-1634', 'Rhezelius avbildning av Treby borg (1634)', 'antikvarisk beskrivning', 1634, 1634,
  'Segerstad', 'Mörbylånga', 'Kalmar', 'Öland', 56.35528, 16.50622, 'site',
  'nyare tid (dokumentation)', ARRAY['husgrundsräkning','portöppning']::text[],
  'Räknade husgrunder: 30 (NO), 32 (mellersta), 14 (SV); markerade en portöppning i norr åt öster samt en stenlagd gång — "wägen och ingången lagd af flijsor".',
  null, 'J.H. Rhezelius, Propugnacula Ölandica 1634 (avskrift Åsenius 2016)', 'PD'),

 ('treby-borg:stenberger-1933', 'Stenbergers kartering av Treby borg (1933)', 'kartering', 1933, 1933,
  'Segerstad', 'Mörbylånga', 'Kalmar', 'Öland', 56.35528, 16.50622, 'site',
  'nyare tid (dokumentation)', ARRAY['kartering','Christineborg']::text[],
  'Kartering i avhandlingsarbetet; historiska gårdslämningar (Christineborg) i SV-ringen; radiellt lagda husgrunder skönjbara i östra ringen. Stenberger: "inga fynd kända från borgen".',
  null, 'Mårten Stenberger, Öland under äldre järnåldern (diss. Uppsala 1933)', 'PD'),

 ('treby-borg:frykman-1966', 'Undersökning av husgrund O11, östra borgrummet (1966)', 'utgrävning', 1966, 1966,
  'Segerstad', 'Mörbylånga', 'Kalmar', 'Öland', 56.35528, 16.50622, 'site',
  'Folkvandringstid', ARRAY['husgrund','skalmurshus','14C','människoben']::text[],
  '15 fyndposter: keramikskärvor, glasring (ev. förromersk sländtrissa), hålkärlsring, blå glassmälta, mynningsbit av grön glasbägare, rembeslag i kopparlegering (folkvandringstida parallell, Gotland), järnföremål. Skalmurshus med tröskelsten och tvärvägg. Ett människoben ur materialet 14C-daterat till 430–559 e.Kr.',
  null, 'Birgitta Skarin Frykman 1971 (opubl. redogörelse); AFL/SU', 'metadata'),

 ('treby-borg:afl-lnu-2024', 'Arkeologisk undersökning av Treby borg (2024)', 'seminariegrävning', 2024, 2024,
  'Segerstad', 'Mörbylånga', 'Kalmar', 'Öland', 56.35528, 16.50622, 'site',
  'Folkvandringstid', ARRAY['XRF-geokemi','LiDAR 2023','silverring','glaspärlor','lipidanalys','stratigrafi']::text[],
  'Schakt 1 (~154 m², hus M24 i mellersta ringen) samt schakt 2–3 vid murliv-anslutningarna. 93 geokemiska jordprov (XRF). Fynd: silverring (F299), järnfibula av yngre förromersk typ (F205), 14 glaspärlor, bennål, dekorerat kamfragment, benpilspets, vävtyngdsfragment, keramik med idisslar-mjölkfett (lipidanalys), bemålade stenar (röd-/gulockra, proteinbindemedel). 14C på sädeskorn: 418–538 e.Kr. Stratigrafi: mellersta ringen äldst. Föregick av LiDAR-flygning 2023 (Firma Glesum, Gdansk).',
  null, 'Arkeologiska forskningslaboratoriet (SU) & Linnéuniversitetet; forskningsprogr. "Kris, konflikt och klimat 300–700" (Riksbankens jubileumsfond). Papmehl-Dufay & Isaksson 2025, Rapporter från AFL nr 42', 'CC (rapport)')
on conflict (source_uri) do nothing;

-- ==========================================================================================
-- C. Arkeometri: silverring F299 + fibula F205 (metal_analyses; polymorf object_type).
--    Ag och Cu kalibrerade mot standard; övriga normaliserade till 100 % (rapportens not).
-- ==========================================================================================
insert into public.metal_analyses (object_type, object_id, system, value, uncertainty, unit, method, lab, source, confidence, note)
values
 ('hillfort_find', '39413875-c3a3-4180-b2dd-7d208981a5aa', 'Ag', 81.5, null, 'mass%', 'XRF', 'AFL/SU (Olympus Delta Premium DP-6000)', 'Papmehl-Dufay & Isaksson 2025', 'certain',
  'Silverring F299, hus M24a (nedgrävning K86), Treby borg. Ag kalibrerad mot standard. Utblandad legering (Cu/Sn/Pb/Zn/Au) → återvunnet/omsmält råmaterial, ev. förgyllda föremål (Au) → trolig datering sen 400-tal (jfr Horváth et al. 2024).'),
 ('hillfort_find', '39413875-c3a3-4180-b2dd-7d208981a5aa', 'Cu', 5.7, null, 'mass%', 'XRF', 'AFL/SU', 'Papmehl-Dufay & Isaksson 2025', 'certain', 'Silverring F299; Cu kalibrerad mot standard.'),
 ('hillfort_find', '39413875-c3a3-4180-b2dd-7d208981a5aa', 'Sn', 4.8, null, 'mass%', 'XRF', 'AFL/SU', 'Papmehl-Dufay & Isaksson 2025', 'probable', 'Silverring F299; normaliserad till 100 %.'),
 ('hillfort_find', '39413875-c3a3-4180-b2dd-7d208981a5aa', 'Pb', 3.3, null, 'mass%', 'XRF', 'AFL/SU', 'Papmehl-Dufay & Isaksson 2025', 'probable', 'Silverring F299; normaliserad till 100 %.'),
 ('hillfort_find', '39413875-c3a3-4180-b2dd-7d208981a5aa', 'Au', 1.7, null, 'mass%', 'XRF', 'AFL/SU', 'Papmehl-Dufay & Isaksson 2025', 'probable', 'Silverring F299; normaliserad. Förhöjt Au tyder på återvunnet förgyllt material.'),
 ('hillfort_find', '39413875-c3a3-4180-b2dd-7d208981a5aa', 'Fe', 0.94, null, 'mass%', 'XRF', 'AFL/SU', 'Papmehl-Dufay & Isaksson 2025', 'probable', 'Silverring F299; normaliserad till 100 %.'),
 ('hillfort_find', '39413875-c3a3-4180-b2dd-7d208981a5aa', 'Zn', 0.33, null, 'mass%', 'XRF', 'AFL/SU', 'Papmehl-Dufay & Isaksson 2025', 'probable', 'Silverring F299; normaliserad till 100 %.'),
 ('hillfort_find', '39413875-c3a3-4180-b2dd-7d208981a5aa', 'Fe', 74.0, 4.0, 'mass%', 'XRF', 'AFL/SU', 'Papmehl-Dufay & Isaksson 2025', 'possible',
  'Fibula/spänne F205 (yngre förromersk järnålder, under understa golvet i hus M23). Fe ca 70–78 %; galvanisk korrosion → koppar bevarad på järnets bekostnad, stor variation mellan mätpunkter. ~500 år äldre än borgens övriga dateringar → förfornborg-aktivitet.'),
 ('hillfort_find', '39413875-c3a3-4180-b2dd-7d208981a5aa', 'Cu', 10.0, null, 'mass%', 'XRF', 'AFL/SU', 'Papmehl-Dufay & Isaksson 2025', 'possible', 'Fibula F205 — gjutet kopparlegerings-"skal" på järn (jfr gotländska paralleller, Nylén 1958).')
on conflict do nothing;

-- ==========================================================================================
-- D. Geokemisk funktionsindelning (ny tabell) — rapportens tabell 1, t-test östra vs mellersta.
--    Detta är fornborg-fingerprint-dimensionen: element × borgrum × signifikans × tolkning.
-- ==========================================================================================
create table if not exists public.site_geochemistry (
  id            uuid primary key default gen_random_uuid(),
  hillfort_id   uuid references public.swedish_hillforts(id) on delete cascade,
  site_name     text,
  element       text not null,          -- grundämnessymbol
  east_mass_pct numeric,                -- medelhalt östra ringen (mass-%)
  mid_mass_pct  numeric,                -- medelhalt mellersta ringen (mass-%)
  n_east        integer,
  n_mid         integer,
  t_value       numeric,
  df            integer,
  p_value       numeric,
  significant   boolean,                -- p < 0,05
  higher_in     text,                   -- 'östra' | 'mellersta' | null (ns)
  interpretation text,
  method        text default 'XRF (pXRF, Geochem-app, lab)',
  source        text,
  created_at    timestamptz default now()
);
comment on table public.site_geochemistry is 'Geokemisk kartering av fornborgar (multielement-XRF): halter och t-test mellan rumsliga delar. Fornborg-fingerprint-dimension. Pilot: Treby borg (Papmehl-Dufay & Isaksson 2025, tab. 1).';
alter table public.site_geochemistry enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='site_geochemistry' and policyname='site_geochemistry_public_read') then
    create policy site_geochemistry_public_read on public.site_geochemistry for select using (true);
  end if;
end $$;

insert into public.site_geochemistry
 (hillfort_id, site_name, element, east_mass_pct, mid_mass_pct, n_east, n_mid, t_value, df, p_value, significant, higher_in, interpretation, source)
values
 ('39413875-c3a3-4180-b2dd-7d208981a5aa','Treby borg','Mg',0.30,0.34,34,44,-0.93,76,0.354,false,null,'Ingen signifikant skillnad.','Papmehl-Dufay & Isaksson 2025 (tab. 1)'),
 ('39413875-c3a3-4180-b2dd-7d208981a5aa','Treby borg','Al',3.97,4.18,34,44,-3.14,76,0.002,true,'mellersta','Sannolikt naturlig skillnad i mineralsammansättning (ev. olika fyllnadsmassor), ej mänsklig aktivitet.','Papmehl-Dufay & Isaksson 2025 (tab. 1)'),
 ('39413875-c3a3-4180-b2dd-7d208981a5aa','Treby borg','Si',24.76,24.68,34,44,0.17,76,0.868,false,null,'Ingen signifikant skillnad (referensgrundämne).','Papmehl-Dufay & Isaksson 2025 (tab. 1)'),
 ('39413875-c3a3-4180-b2dd-7d208981a5aa','Treby borg','P',0.15,0.13,34,44,2.17,76,0.033,true,'östra','Förhöjt organiskt material — födohantering/biologisk aktivitet i östra ringen.','Papmehl-Dufay & Isaksson 2025 (tab. 1)'),
 ('39413875-c3a3-4180-b2dd-7d208981a5aa','Treby borg','K',1.29,1.20,34,44,2.82,76,0.006,true,'östra','Högre grad av eldaktiviteter (träaska) i östra ringen.','Papmehl-Dufay & Isaksson 2025 (tab. 1)'),
 ('39413875-c3a3-4180-b2dd-7d208981a5aa','Treby borg','Ca',3.88,3.96,34,44,-0.35,76,0.729,false,null,'Ingen signifikant skillnad.','Papmehl-Dufay & Isaksson 2025 (tab. 1)'),
 ('39413875-c3a3-4180-b2dd-7d208981a5aa','Treby borg','Mn',0.080,0.059,34,44,2.89,76,0.005,true,'östra','Rikligt i cerealier → födohantering i östra ringen.','Papmehl-Dufay & Isaksson 2025 (tab. 1)'),
 ('39413875-c3a3-4180-b2dd-7d208981a5aa','Treby borg','Fe',2.60,2.75,34,44,-3.06,76,0.003,true,'mellersta','Högre järnhalt i mellersta ringen → möjligt järnhantverk/deponering av järn.','Papmehl-Dufay & Isaksson 2025 (tab. 1)'),
 ('39413875-c3a3-4180-b2dd-7d208981a5aa','Treby borg','Cu',0.0012,0.0008,34,44,3.14,76,0.002,true,'östra','Hantverk med kopparlegeringar (eller deponering) i östra ringen.','Papmehl-Dufay & Isaksson 2025 (tab. 1)'),
 ('39413875-c3a3-4180-b2dd-7d208981a5aa','Treby borg','Zn',0.015,0.013,34,44,4.95,76,0.000,true,'östra','Kopparlegeringshantverk / animaliehantering i östra ringen (starkaste skillnaden).','Papmehl-Dufay & Isaksson 2025 (tab. 1)'),
 ('39413875-c3a3-4180-b2dd-7d208981a5aa','Treby borg','Sr',0.0091,0.010,34,44,-3.03,76,0.003,true,'mellersta','Sannolikt naturlig mineralogisk skillnad, ej mänsklig aktivitet.','Papmehl-Dufay & Isaksson 2025 (tab. 1)'),
 ('39413875-c3a3-4180-b2dd-7d208981a5aa','Treby borg','Pb',0.0035,0.00,34,44,-1.42,76,0.159,false,null,'Ingen signifikant skillnad.','Papmehl-Dufay & Isaksson 2025 (tab. 1)')
on conflict do nothing;
