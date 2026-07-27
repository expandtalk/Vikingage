-- Acceptanstest för hällristnings-proveniensschemat. Kör EFTER 20260728170000.
-- Två fall, var sitt hörn av modellen (Daniels testdesign):
--   A. RUNAMO — pareidolia. 4 obs, 4 agenter, 3 metoder, 2 oförenliga tolkningar, konsensus som
--      skiftar med 11 års fördröjning. Dispyten lagras UTAN fritext-tolkning: present=true (1833)
--      vs present=false (1836→1844) + authenticity=pareidolia, källa=Worsaae 1844 (EJ konsensus).
--      Auktoritativ geometri: Fornsök Bräkne-Hoby 191:1 (L1979:5365), SWEREF99 TM → is_current=true.
--   B. BORNHOLM — seriation. FYND: inga publicerade numeriska asymmetrivärden (Kaul 1998 typologi;
--      Bengtsson 2024 skrov-index, ej asymmetri; PLOS 2026 kvalitativt). Tre PLOS-skepp (1/5/11) på
--      Madsebakke laddas som seriationssubjekt med ship_asymmetry_idx=NULL, figure.geom=NULL.
--      Testet avslöjar ett DATAGAP, inte ett schemafel.
--
-- KOORDINAT-PROVENIENS (Daniels regel): danska koord = Google Places (svagast möjliga källa) →
--   provisorisk lamning_geometry, is_current=false, api_response-källa. Registergeometri tar över
--   senare via unika is_current-indexet. Runamo = auktoritativ Fornsök-koord, is_current=true.
--   Alla lagras kanoniskt i 4326; metric_srid=3006 (Blekinge OCH Bornholm ligger nära 15°Ö → exakt).
--
-- HAMMERSHOLM-FÄLLAN (verifierad mot register): "Hammersholm" gården är en FREDAD BYGGNAD i FBB
--   (sag=95593156) — ett annat register. Ristningsfältet vid Moseløkkevej är ett fortidsminde.
--   Denna rad = FÄLTET, aldrig gården. En figur får inte hänga på en byggnad.
--
-- OBS #3: tabelltillhörighet kodar ingen tolkning. Finner en live-koll en runic_inscriptions-Runamo:
--   radera ALDRIG — sätt pareidolia, behåll sökbar (Saxo, kommittén 1833, Brate 1922 förde debatten
--   under namnet "Runamo"). Kuriosa: Google listar lokalen som Runamo "runristning" — Worsaaes dom
--   1844 i typografi 180 år senare.
-- FLAGGA (ej laddad): Madsebakkes målningsstatus omtvistad i besökarkällor. Sätt EJ paint_state utan
--   dansk förvaltning; ändrad målning = intervention-rad som påverkar dokumentation efter det datumet.

begin;

do $$
declare
  v_runamo uuid; v_made uuid; v_hamm uuid;
  s_google uuid; s_forn uuid; s_magn uuid; s_berz uuid; s_nils uuid; s_wors uuid; s_kaul uuid; s_beng uuid;
  o1 uuid; o2 uuid; o3 uuid; o4 uuid; o_made uuid; o_hamm uuid;
  f_run uuid; f_m1 uuid; f_m5 uuid; f_m11 uuid; f_hamm uuid;
  runamo_lat double precision; runamo_lng double precision;
begin
  -- ===== KÄLLOR =====
  -- Google Places = api_response (svagast). author/language undantagna via kind-CHECK.
  select id into s_google from public.historical_sources where kind='api_response' and api_endpoint='places.googleapis.com/v1/places:searchText' limit 1;
  if s_google is null then insert into public.historical_sources (title, title_en, reliability, kind, api_endpoint, api_query, retrieved_at)
    values ('Google Places API — platscentroid', 'Google Places API — place centroid', 'tertiary', 'api_response',
      'places.googleapis.com/v1/places:searchText', 'searchText: Madsebakke / Hammersholm helleristningsfelt', now()) returning id into s_google; end if;

  -- Fornsök = auktoritativt register (archive_item; author/language krävs).
  select id into s_forn from public.historical_sources where repository_ref='Bräkne-Hoby 191:1 (L1979:5365)' limit 1;
  if s_forn is null then insert into public.historical_sources (title, title_en, author, reliability, language, kind, repository, repository_ref, url)
    values ('Fornsök: Runamohallen/Runamoristningen', 'Fornsök: Runamo', 'Riksantikvarieämbetet (Fornreg)', 'primary', 'sv', 'archive_item',
      'Riksantikvarieämbetet/Fornreg', 'Bräkne-Hoby 191:1 (L1979:5365)', 'https://app.raa.se/open/fornsok/lamning/publicerad/print?id=2f378fc6-4cc5-435c-943f-a6c585e83528') returning id into s_forn; end if;

  select id into s_magn from public.historical_sources where title='Runamo og Runerne (1841)' limit 1;
  if s_magn is null then insert into public.historical_sources (title, title_en, author, written_year, reliability, language, kind)
    values ('Runamo og Runerne (1841)', 'Runamo and the Runes (1841)', 'Finnur Magnússon (Finn Magnusen)', 1841, 'secondary', 'da', 'publication') returning id into s_magn; end if;
  select id into s_berz from public.historical_sources where title='Om Runamo, Vitterhetsakademiens handlingar del 14 (1838)' limit 1;
  if s_berz is null then insert into public.historical_sources (title, title_en, author, written_year, reliability, language, kind)
    values ('Om Runamo, Vitterhetsakademiens handlingar del 14 (1838)', 'On Runamo, VAH vol. 14 (1838)', 'Jöns Jacob Berzelius', 1838, 'secondary', 'sv', 'publication') returning id into s_berz; end if;
  select id into s_nils from public.historical_sources where title='Om Runamo, Vitterhetsakademiens handlingar del 16' limit 1;
  if s_nils is null then insert into public.historical_sources (title, title_en, author, written_year, reliability, language, kind)
    values ('Om Runamo, Vitterhetsakademiens handlingar del 16', 'On Runamo, VAH vol. 16', 'Sven Nilsson', 1840, 'secondary', 'sv', 'publication') returning id into s_nils; end if;
  select id into s_wors from public.historical_sources where title='Runamo-undersökningen (1844)' limit 1;
  if s_wors is null then insert into public.historical_sources (title, title_en, author, written_year, reliability, language, kind)
    values ('Runamo-undersökningen (1844)', 'The Runamo investigation (1844)', 'Jens Jacob Asmussen Worsaae', 1844, 'secondary', 'da', 'publication') returning id into s_wors; end if;
  select id into s_kaul from public.historical_sources where title='Ships on Bronzes (1998)' limit 1;
  if s_kaul is null then insert into public.historical_sources (title, title_en, author, written_year, reliability, language, kind)
    values ('Ships on Bronzes (1998)', 'Ships on Bronzes (1998)', 'Flemming Kaul', 1998, 'secondary', 'en', 'publication') returning id into s_kaul; end if;
  select id into s_beng from public.historical_sources where doi='10.1080/00293652.2024.2357135' limit 1;
  if s_beng is null then insert into public.historical_sources (title, title_en, author, written_year, reliability, language, kind, doi, peer_reviewed)
    values ('Evidence of Large Vessels and Sail in Bronze Age Scandinavia', 'Evidence of Large Vessels and Sail in Bronze Age Scandinavia', 'Boel Bengtsson m.fl.', 2024, 'secondary', 'en', 'publication', '10.1080/00293652.2024.2357135', true) returning id into s_beng; end if;

  -- ===== LÄMNINGAR =====
  -- Runamo: auktoritativ registerkoordinat SWEREF99 TM (3006) → 4326 vid ingest.
  select ST_Y(p), ST_X(p) into runamo_lat, runamo_lng
  from (select ST_Transform(ST_SetSRID(ST_MakePoint(510415.666, 6229404.836), 3006), 4326) as p) q;
  select id into v_runamo from public.heritage_sites where source_uri='Fornsök RAÄ Bräkne-Hoby 191:1' limit 1;
  if v_runamo is null then
    insert into public.heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, period,
      description, source_uri, existence, context_state, register_system, register_id)
    values ('Naturföremål/-bildning med tradition', 'Runamo', 'Blekinge', 'Ronneby', 'Bräkne-Hoby', runamo_lat, runamo_lng, 'omtvistad',
      'Diabas-gång ("trapp") i granithäll. Historiskt läst som runinskrift (Saxo ~1200; kommittén 1833). Naturliga sprickor enligt Berzelius 1836/Worsaae 1844. Koord = Fornsök-register (SWEREF99 TM).',
      'Fornsök RAÄ Bräkne-Hoby 191:1', 'extant', 'open_bedrock', 'raa', 'Bräkne-Hoby 191:1 (L1979:5365)')
    returning id into v_runamo;
  end if;

  -- Madsebakke: Google-koord (provisorisk).
  select id into v_made from public.heritage_sites where source_uri='Google Places: Madsebakke' limit 1;
  if v_made is null then
    insert into public.heritage_sites (raa_type, name, landscape, municipality, lat, lng, period,
      description, source_uri, existence, context_state, register_system)
    values ('Hällristning', 'Madsebakke', 'Bornholm', 'Bornholm', 55.28188, 14.78884, 'bronsålder',
      'Danmarks största bronsåldersristningsfält (skepp, hjulkors, fotsulor). Koord PROVISORISK = Google Places-centroid; FoF sb-nummer/registerkoord ej nåbar (SPA), verifiering kvarstår.',
      'Google Places: Madsebakke', 'extant', 'open_bedrock', 'ffm')
    returning id into v_made;
  end if;

  -- Hammersholm helleristningsfelt (FÄLTET vid Moseløkkevej) — EJ gården (FBB sag=95593156).
  select id into v_hamm from public.heritage_sites where source_uri='Google Places: Hammersholm helleristningsfelt' limit 1;
  if v_hamm is null then
    insert into public.heritage_sites (raa_type, name, landscape, municipality, lat, lng, period,
      description, source_uri, existence, context_state, register_system)
    values ('Hällristning', 'Hammersholm helleristningsfelt', 'Bornholm', 'Bornholm', 55.27663, 14.77428, 'bronsålder',
      'Ristningsfält vid Moseløkkevej (Sandvig–Hammershus), ~65-80 ristningsytor; senupptäckt (M. Thorsen, Bornholms Museum, 2017-18). SKILT från Hammersholm GÅRD (fredad byggnad, FBB sag=95593156, annat register). Koord PROVISORISK = Google Places; FoF-registerkoord ej nåbar, verifiering kvarstår.',
      'Google Places: Hammersholm helleristningsfelt', 'extant', 'open_bedrock', 'ffm')
    returning id into v_hamm;
  end if;

  -- ===== GEOMETRI-PROVENIENS (lamning_geometry) =====
  -- Runamo: auktoritativ, is_current=true.
  if not exists (select 1 from public.lamning_geometry where lamning_id=v_runamo and is_current) then
    insert into public.lamning_geometry (lamning_id, geom, metric_srid, method, source_crs, was_transformed, transform_note,
      stated_precision, is_current, source_id)
    values (v_runamo, ST_Transform(ST_SetSRID(ST_MakePoint(510415.666, 6229404.836), 3006), 4326), 3006, 'map_digitised',
      'SWEREF99 TM', true, 'SWEREF99 TM (N 6229404.836, E 510415.666) → 4326 via ST_Transform vid ingest',
      'Fornsök registerkoordinat', true, s_forn);
  end if;
  -- Madsebakke + Hammersholm-fältet: provisoriska Google-punkter, is_current=false → register tar över.
  if not exists (select 1 from public.lamning_geometry where lamning_id=v_made and source_id=s_google) then
    insert into public.lamning_geometry (lamning_id, geom, metric_srid, method, source_crs, stated_precision, horizontal_unc_m, is_current, source_id)
    values (v_made, ST_SetSRID(ST_MakePoint(14.78884, 55.28188), 4326), 3006, 'unknown', 'WGS84',
      'platscentroid från kommersiell gazetteer (Google Places), ej registerdata', 50, false, s_google);
  end if;
  if not exists (select 1 from public.lamning_geometry where lamning_id=v_hamm and source_id=s_google) then
    insert into public.lamning_geometry (lamning_id, geom, metric_srid, method, source_crs, stated_precision, horizontal_unc_m, is_current, source_id)
    values (v_hamm, ST_SetSRID(ST_MakePoint(14.77428, 55.27663), 4326), 3006, 'unknown', 'WGS84',
      'platscentroid från kommersiell gazetteer (Google Places), ej registerdata', 50, false, s_google);
  end if;

  -- ===== RUNAMO: 4 förstahandsobservationer =====
  select id into o1 from public.observation where lamning_id=v_runamo and agent='Finnur Magnússon' limit 1;
  if o1 is null then insert into public.observation (lamning_id, agent, obs_date, method, is_primary, source_id, notes)
    values (v_runamo, 'Finnur Magnússon', daterange('1833-01-01','1833-12-31','[]'), 'autopsy_visual', true, s_magn,
      'Läste höger-till-vänster som bindrunor; kommittén (Molbech/Finn Magnusen/Forchhammer) godkände som äkta runinskrift i diabas-gång.') returning id into o1; end if;
  select id into o2 from public.observation where lamning_id=v_runamo and agent='J.J. Berzelius' limit 1;
  if o2 is null then insert into public.observation (lamning_id, agent, obs_date, method, is_primary, source_id, notes)
    values (v_runamo, 'J.J. Berzelius', daterange('1836-01-01','1836-12-31','[]'), 'autopsy_visual', true, s_berz,
      'Besökte platsen 1836; enbart naturligt bildade sprickor i trapp(diabas)-gång, ej runor.') returning id into o2; end if;
  select id into o3 from public.observation where lamning_id=v_runamo and agent='Sven Nilsson' limit 1;
  if o3 is null then insert into public.observation (lamning_id, agent, obs_date, method, is_primary, source_id, notes)
    values (v_runamo, 'Sven Nilsson', daterange('1839-01-01','1840-12-31','[]'), 'autopsy_visual', true, s_nils,
      'Biträdde Berzelius naturförklaring (VAH del 16).') returning id into o3; end if;
  select id into o4 from public.observation where lamning_id=v_runamo and agent='J.J.A. Worsaae' limit 1;
  if o4 is null then insert into public.observation (lamning_id, agent, obs_date, method, is_primary, source_id, notes)
    values (v_runamo, 'J.J.A. Worsaae', daterange('1844-01-01','1844-12-31','[]'), 'casting', true, s_wors,
      'Tredje undersökningen 1844; gipsavgjutningar + jämförelse; vände lärd opinion mot naturförklaringen.') returning id into o4; end if;

  if not exists (select 1 from public.intervention where lamning_id=v_runamo and kind='moulding') then
    insert into public.intervention (lamning_id, kind, event_date, agent, contaminates_interpretation, source_id, notes)
    values (v_runamo, 'moulding', daterange('1844-01-01','1844-12-31','[]'), 'J.J.A. Worsaae', false, s_wors, 'Gipsavgjutning av de påstådda runorna.');
  end if;

  select id into f_run from public.figure where lamning_id=v_runamo and local_label='Påstådd runrad (Runamo-inskriften)' limit 1;
  if f_run is null then insert into public.figure (lamning_id, local_label, authenticity, authenticity_source_id, authenticity_note)
    values (v_runamo, 'Påstådd runrad (Runamo-inskriften)', 'pareidolia', s_wors,
      'Naturliga sprickor i diabas-gång tolkade som runrad. Vederlagd Berzelius 1836 → Nilsson → Worsaae 1844. Källa = Worsaae 1844, EJ modern konsensus.') returning id into f_run; end if;

  insert into public.figure_record (figure_id, observation_id, present, motif_class)
    select f_run, o1, true,  'runrad (påstådd)' where not exists (select 1 from public.figure_record where figure_id=f_run and observation_id=o1);
  insert into public.figure_record (figure_id, observation_id, present, motif_class)
    select f_run, o2, false, 'runrad (påstådd)' where not exists (select 1 from public.figure_record where figure_id=f_run and observation_id=o2);
  insert into public.figure_record (figure_id, observation_id, present, motif_class)
    select f_run, o3, false, 'runrad (påstådd)' where not exists (select 1 from public.figure_record where figure_id=f_run and observation_id=o3);
  insert into public.figure_record (figure_id, observation_id, present, motif_class)
    select f_run, o4, false, 'runrad (påstådd)' where not exists (select 1 from public.figure_record where figure_id=f_run and observation_id=o4);

  -- ===== MADSEBAKKE: seriationssubjekt skepp 1/5/11 (PLOS 2026). geom NULL, asymmetri NULL. =====
  select id into o_made from public.observation where lamning_id=v_made and source_id=s_kaul limit 1;
  if o_made is null then insert into public.observation (lamning_id, agent, method, is_primary, source_id, notes)
    values (v_made, 'Kaul/PLOS (typologi)', 'autopsy_visual', true, s_kaul, 'Skeppsristningar; Kauls ändskepps-typokronologi. Målningsstatus EJ satt (omtvistad, flaggad).') returning id into o_made; end if;

  select id into f_m1  from public.figure where lamning_id=v_made and local_label='Skepp 1'  limit 1;
  if f_m1  is null then insert into public.figure (lamning_id, local_label, authenticity, authenticity_source_id) values (v_made,'Skepp 1', 'accepted', s_beng) returning id into f_m1;  end if;
  select id into f_m5  from public.figure where lamning_id=v_made and local_label='Skepp 5'  limit 1;
  if f_m5  is null then insert into public.figure (lamning_id, local_label, authenticity, authenticity_source_id) values (v_made,'Skepp 5', 'accepted', s_beng) returning id into f_m5;  end if;
  select id into f_m11 from public.figure where lamning_id=v_made and local_label='Skepp 11' limit 1;
  if f_m11 is null then insert into public.figure (lamning_id, local_label, authenticity, authenticity_source_id) values (v_made,'Skepp 11','accepted', s_beng) returning id into f_m11; end if;

  -- ship_asymmetry_idx = NULL: ingen publicerad ordinal mätning (fyndet). Redo för egen morfometri.
  insert into public.figure_record (figure_id, observation_id, present, motif_class, ship_asymmetry_idx, depicted_object_note)
    select f_m1, o_made, true, 'skepp', NULL, 'Seriationssubjekt (PLOS 2026 fig.). Ordinal asymmetri ej publicerad → kräver egen morfometri.'
    where not exists (select 1 from public.figure_record where figure_id=f_m1 and observation_id=o_made);
  insert into public.figure_record (figure_id, observation_id, present, motif_class, ship_asymmetry_idx, depicted_object_note)
    select f_m5, o_made, true, 'skepp', NULL, 'Seriationssubjekt (PLOS 2026 fig.). Ordinal asymmetri ej publicerad.'
    where not exists (select 1 from public.figure_record where figure_id=f_m5 and observation_id=o_made);
  insert into public.figure_record (figure_id, observation_id, present, motif_class, ship_asymmetry_idx, depicted_object_note)
    select f_m11, o_made, true, 'skepp', NULL, 'Seriationssubjekt (PLOS 2026 fig.). Ordinal asymmetri ej publicerad.'
    where not exists (select 1 from public.figure_record where figure_id=f_m11 and observation_id=o_made);

  -- ===== HAMMERSHOLM-FÄLTET: 1 representativt skepp =====
  select id into o_hamm from public.observation where lamning_id=v_hamm and source_id=s_kaul limit 1;
  if o_hamm is null then insert into public.observation (lamning_id, agent, method, is_primary, source_id, notes)
    values (v_hamm, 'Kaul (typologi)', 'autopsy_visual', true, s_kaul, 'Skeppsristningar; kvalitativt beskrivna som symmetriskare (Hjortspring-profil). Ingen mätt asymmetri.') returning id into o_hamm; end if;
  select id into f_hamm from public.figure where lamning_id=v_hamm and local_label='Skepp (Hammersholm-fältet)' limit 1;
  if f_hamm is null then insert into public.figure (lamning_id, local_label, authenticity, authenticity_source_id) values (v_hamm,'Skepp (Hammersholm-fältet)', 'accepted', s_kaul) returning id into f_hamm; end if;
  insert into public.figure_record (figure_id, observation_id, present, motif_class, ship_asymmetry_idx, depicted_object_note)
    select f_hamm, o_hamm, true, 'skepp', NULL, 'Kvalitativt symmetriskare än Madsebakke, inget tal. Ordinal axel väntar morfometri.'
    where not exists (select 1 from public.figure_record where figure_id=f_hamm and observation_id=o_hamm);

  raise notice 'Testdata: Runamo (auktoritativ, pareidolia, 4 obs) + Madsebakke (3 seriationsskepp) + Hammersholm-FÄLTET (ej gården). Danska koord provisoriska.';
end $$;

commit;

-- ===== ACCEPTANSKONTROLLER (kör efter apply) =====
--  Runamo-dispyten utan fritext:
--   select o.agent, lower(o.obs_date) yr, fr.present from public.figure_record fr
--     join public.observation o using(observation_id) join public.figure f using(figure_id)
--     join public.heritage_sites l on l.id=f.lamning_id where l.name='Runamo' order by yr;
--     → Magnússon 1833 present=true; Berzelius/Nilsson/Worsaae present=false. authenticity=pareidolia, källa Worsaae 1844.
--  Geometri-proveniens (provisorisk vs auktoritativ):
--   select l.name, g.is_current, g.source_crs, g.method, s.kind from public.lamning_geometry g
--     join public.heritage_sites l on l.id=g.lamning_id join public.historical_sources s on s.id=g.source_id;
--     → Runamo: is_current=true, SWEREF99 TM, archive_item. Danska: is_current=false, WGS84, api_response.
--  Seriationsfyndet:
--   select l.name, f.local_label, fr.ship_asymmetry_idx from public.figure_record fr join public.figure f using(figure_id)
--     join public.heritage_sites l on l.id=f.lamning_id where l.landscape='Bornholm' order by f.local_label;
--     → skepp 1/5/11 + Hammersholm, ship_asymmetry_idx = NULL. Axeln finns, datan saknas → morfometri-uppgift.
--  Lat/lon-omkastningsskyddet: försök infoga en omkastad punkt → lamning_geom_within_europe fäller den.
--  UPPFÖLJNING: FoF sb-nummer + registerkoord för Madsebakke & Hammersholm-fältet (ersätter Google, is_current).
