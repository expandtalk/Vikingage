-- Treby borg — completeness-svep: fånga allt substantiellt ur rapporten UTAN att lagra
-- upphovsrättsskyddad fulltext. Registrerar källan (författare + citat, licens ej verifierad),
-- ger borgen en heritage_sites-lämningsnod, ankrar 14C strukturerat, inför en generell
-- material_analyses-tabell (glas/pigment/lipid) och skriver in Daniels kronologi-hypotes som
-- en MÄRKT tolkning (has_theme), med det som stödjer/motsäger den utskrivet. Tolkning ≠ fakta.

-- ==========================================================================================
-- 1. Källan som vetenskaplig referens (INGEN fulltext; licens ärligt "ej verifierad").
-- ==========================================================================================
insert into public.scientific_references (id, authors, year, title, container, volume, pages, doi, url, license, note)
values ('a7eb1956-3284-4000-8000-000000000003',
  'Papmehl-Dufay, L. & Isaksson, S.', 2025,
  'Treby borg. Arkeologiska undersökningar av Treby fornborg, L1956:3284, RAÄ Segerstad 22:1, Mörbylånga kn, Kalmar län, i maj och september/oktober 2024',
  'Rapporter från Arkeologiska forskningslaboratoriet', '42', null, null, null,
  'ej verifierad (ingen fulltext lagras)',
  'Stockholms universitet (AFL) + Linnéuniversitetet; forskningsprogr. "Kris, konflikt och klimat – Skandinavien 300–700" (Riksbankens jubileumsfond). Endast metadata + strukturerade slutsatser i DB.')
on conflict (id) do nothing;

-- ==========================================================================================
-- 2. (Struken) 14C-ankring i dating_argument — blockeras av rock-art-palimpsest-triggern
--    (c14 direkt på lämning ej tillåtet; ristningsdatering hör på figur). 14C ligger ärligt
--    som attribuerad text i swedish_hillforts.dating_basis. Ett rent fornborgs-14C-hem är
--    en separat modellfråga — abusa inte hällristnings-tabellen.
-- ==========================================================================================

-- ==========================================================================================
-- 3. Generell material_analyses-tabell (glas/pigment/lipid m.m. — metal_analyses är metall-only).
-- ==========================================================================================
create table if not exists public.material_analyses (
  id                        uuid primary key default gen_random_uuid(),
  object_type               text,            -- polymorf, som metal_analyses
  object_id                 uuid,
  find_ref                  text,            -- fyndnummer (F298 …)
  material                  text,            -- glas | pigment | keramik/lipid | ben …
  analysis_type             text,            -- glass_composition | pigment_mineralogy | lipid_residue …
  method                    text,            -- XRF | XRD | FTIR | GC-MS | GC-C-IRMS
  result                    text,
  provenance_interpretation text,
  confidence                text check (confidence = any (array['certain','probable','possible','uncertain'])),
  lab                       text,
  source                    text,
  created_at                timestamptz default now()
);
comment on table public.material_analyses is 'Materialanalyser (icke-metallisotop): glaskomposition, pigmentmineralogi, lipidrester m.m. Bär metod/labb/proveniens-tolkning. Komplement till metal_analyses.';
alter table public.material_analyses enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='material_analyses' and policyname='material_analyses_public_read') then
    create policy material_analyses_public_read on public.material_analyses for select using (true);
  end if;
end $$;

insert into public.material_analyses (object_type, object_id, find_ref, material, analysis_type, method, result, provenance_interpretation, confidence, lab, source)
values
 ('hillfort_find','39413875-c3a3-4180-b2dd-7d208981a5aa','F298','glas','glass_composition','XRF',
  'Ingen detekterbar kalium (K/Si ≈ 0); relativt hög Ca/Si.',
  'Sodaglas (natron) — troligen romerskt ursprung. Draget blått transparent glas; paralleller i Sandby borg och på storgården Gamla Skogsby → handels-/kontaktvektor. Funnen i K86, hus M24a.',
  'probable','AFL/SU (pXRF)','Papmehl-Dufay & Isaksson 2025 (AFL 42)'),
 ('hillfort_find','39413875-c3a3-4180-b2dd-7d208981a5aa','F216/F221/F223/F248/F256/F271/F307','glas','glass_composition','XRF',
  'Hög K/Si-kvot (röda/orange opaka pärlor).',
  'Kaliglas (pottaska) — ej av romerskt ursprung. Antingen den nordeuropeiska övergången till kaliglas eller glasmassa av östligt ursprung (jfr sasanidiskt/mesopotamiskt). 13 pärlor i schaktkanten (hus M25), flera eldpåverkade — ev. gravkontext.',
  'probable','AFL/SU (pXRF)','Papmehl-Dufay & Isaksson 2025 (AFL 42)'),
 ('hillfort_find','39413875-c3a3-4180-b2dd-7d208981a5aa','F45','pigment','pigment_mineralogy','XRD + FTIR',
  'XRD: hematit (rödockra). FTIR: karbonat + proteinbaserat bindemedel (gelatin/benlim/hudlim/äggtempera).',
  'Bemålad väggsten i rött — mineralpigment med proteinbindemedel. Sällsynt för folkvandringstid. Rapporten: preliminärt men "väldigt lovande".',
  'possible','AFL/SU','Papmehl-Dufay & Isaksson 2025 (AFL 42)'),
 ('hillfort_find','39413875-c3a3-4180-b2dd-7d208981a5aa','F91','pigment','pigment_mineralogy','XRD + FTIR',
  'XRD: goethit (gulockra). FTIR: karbonat + proteinbaserat bindemedel.',
  'Bemålad väggsten i gult (hus M24a). Samma teknik som F45.',
  'possible','AFL/SU','Papmehl-Dufay & Isaksson 2025 (AFL 42)'),
 ('hillfort_find','39413875-c3a3-4180-b2dd-7d208981a5aa','F61','keramik/lipid','lipid_residue','GC-MS + GC-C-IRMS',
  'Idisslar-mjölkfett (δ13C C16:0 = −26,9; C18:0 = −30,7) + litet inslag vegetabiliskt (1-hexakosanol).',
  'Kärlet använt för matlagning/förvaring av mjölkfett — en av få indikationer på "vardaglig" hantering i en borg som annars tolkas icke-boplats.',
  'probable','AFL/SU','Papmehl-Dufay & Isaksson 2025 (AFL 42)')
on conflict do nothing;

-- registrera material_analysis i ontologin (fullständig mall).
insert into public.ontology_entity_types
  (code, label_sv, label_en, physical_table, id_column, coord_kind, provenance_columns, status, description)
values ('material_analysis','Materialanalys','Material analysis','material_analyses','id','via_site','method,lab,source,confidence','active',
  'Icke-metallisotop materialanalys (glaskomposition, pigmentmineralogi, lipidrester). Bär metod/labb/proveniens-tolkning.')
on conflict (code) do nothing;

-- Arvegods-varning på silverringen (Daniels poäng: kurerat/ärvt föremål → för gammal TPQ).
update public.metal_analyses
  set note = note || ' ARVEGODS-VARNING: en kurerad/ärvd ring daterar sin nedläggning löst; den omsmälta metallen är dessutom äldre än föremålet → terminus post quem skevar för gammal.'
 where object_type='hillfort_find' and system='Ag' and value=81.5;

-- ==========================================================================================
-- 5. Daniels kronologi-hypotes som MÄRKT tolkning (theme) + graf-ankring (has_theme).
-- ==========================================================================================
insert into public.themes (id, name, name_en, description, slug, keywords, icon)
values ('a7eb1956-3284-4000-8000-000000000002',
  'Träby borg — två ringar, två slut?',
  'Treby borg — two rings, two endings?',
  'HYPOTES (Daniel 2026): sädeskornen (mellersta ringen) speglar tidig aktivitet/odling → mellersta ringen byggs först; senare tar fler människor sin tillflykt, och människobenet (östra ringen) markerar slutet. '
  || 'STÖDS AV: stratigrafin (mellersta ringen äldst, schakt 2–3) och geokemin (rumsligt differentierad aktivitet mellan borgrummen) → olika bruk/olika historia per ring. '
  || 'MOTSÄGS AV: de två 14C-intervallen överlappar nästan helt (sädeskorn 418–538, människoben 430–559) → inget daterbart 22-årsgap går att belägga; sekvensen vilar på stratigrafi, ej på tid. Ett människobens dödsår ≠ platsens övergivande (rapporten: möjligt dramatiskt förlopp, jfr Sandby). Det utgrävda huset i mellersta ringen visar tvärtom ett ORDNAT övergivande. '
  || 'Källa till data: Papmehl-Dufay & Isaksson 2025 (AFL 42).',
  'treby-tva-ringar-tva-slut',
  ARRAY['fornborg','kronologi','folkvandringstid','Öland','tolkning']::text[],
  'castle')
on conflict (id) do nothing;

-- Registrera noderna i entity_registry (relationship FK:ar dit).
insert into public.entity_registry (id, entity_type, label) values
 ('39413875-c3a3-4180-b2dd-7d208981a5aa','hillfort','Träby borg'),
 ('a7eb1956-3284-4000-8000-000000000002','theme','Träby borg — två ringar, två slut?'),
 ('a7eb1956-3284-4000-8000-000000000003','reference','Papmehl-Dufay & Isaksson 2025 (AFL 42)')
on conflict (id) do nothing;
insert into public.entity_registry (id, entity_type, label)
  select id, 'investigation', title from public.archaeological_investigations where source_uri like 'treby-borg:%'
on conflict (id) do nothing;

-- Graf-kanter: borg → tolkning (märkt possible), borg → källa (dated_by), borg → undersökningar.
insert into public.relationship (subject_id, predicate, object_id, confidence, source_ref, created_by)
values
 ('39413875-c3a3-4180-b2dd-7d208981a5aa','has_theme','a7eb1956-3284-4000-8000-000000000002','possible','Hypotes (Daniel 2026); data: Papmehl-Dufay & Isaksson 2025','daniel+claude'),
 ('39413875-c3a3-4180-b2dd-7d208981a5aa','dated_by','a7eb1956-3284-4000-8000-000000000003','certain','Papmehl-Dufay & Isaksson 2025','claude')
on conflict do nothing;
insert into public.relationship (subject_id, predicate, object_id, confidence, source_ref, created_by)
  select '39413875-c3a3-4180-b2dd-7d208981a5aa','investigated_by', id, 'certain', source_institution, 'claude'
  from public.archaeological_investigations where source_uri like 'treby-borg:%'
on conflict do nothing;
