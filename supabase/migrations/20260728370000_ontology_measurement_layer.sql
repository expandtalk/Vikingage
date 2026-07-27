-- Ontologi-uppdatering: lyft MÄTLAGRET till förstaklass. Vetenskapsteoretisk grund — observation ≠
-- tolkning. Mätningarna (metall, isotop, hällristnings-observation, dateringsargument) är single
-- source of truth (rent, källfört, avdubblat); tolkningar hålls plurala + attribuerade + tidsstämplade.
-- Registrerar BARA tabeller som finns (metal_analyses/isotope_measurements/observation/rock_art_dating).
-- stone_features finns ej → registreras ej (fingerprint-verktyget jobbar från beskrivning + AI, ej vektor).
begin;

insert into public.ontology_entity_types (code, label_sv, label_en, physical_table, id_column, coord_kind, provenance_columns, status, description) values
  ('metal_analysis','Metallanalys','Metal analysis','metal_analyses','id','via_site','method,lab,source,uncertainty,confidence','active',
     'Mätning: bly-/koppar-isotoper + spårämnen på ett metallföremål. Single source of truth — bär metod, labb, osäkerhet. Matchas mot ore_source via metallproveniens-måttet.'),
  ('isotope_measurement','Isotopmätning','Isotope measurement','isotope_measurements','id','via_site','method,lab,source,uncertainty,confidence','active',
     'Mätning: strontium-/syre-isotoper (osteologi/proveniens) på individ eller föremål. Bär metod, labb, osäkerhet.'),
  ('rock_art_observation','Hällristnings-observation','Rock-art observation','observation','observation_id','via_site','method,source_id','active',
     'Dokumenterad observation av en hällristningsyta (kalkning/frottage/foto/3D). Skild från tolkningen av motivet — observationen är fakta, motivtolkningen är plural.'),
  ('rock_art_dating_argument','Hällristnings-dateringsargument','Rock-art dating argument','rock_art_dating','id','none','confidence,sources,heritage_source_uri','active',
     'Ett enskilt dateringsargument (strandlinje, motiv-seriation, superposition) med egen konfidens + källa. Flera argument kan stödja ELLER motsäga varandra.')
on conflict (code) do nothing;

-- Observation/tolkning-kontraktet: knyt mätning till objekt och till (plural) tolkning.
insert into public.rel_predicates (code, label_sv, label_en, subject_type, object_type, description) values
  ('observation_of','observation av','observation of','mätning/observation','objekt',
     'Kopplar en mätning/observation till objektet den gäller. Mätlagret är single source of truth.'),
  ('supports','stöder tolkning','supports interpretation','mätning/observation','tolkning',
     'Mätning/observation som stödjer en tolkning. Tolkningen förblir attribuerad + tidsstämplad, aldrig konsoliderad.'),
  ('contradicts','motsäger tolkning','contradicts interpretation','mätning/observation','tolkning',
     'Mätning/observation som talar EMOT en tolkning — gör oenighet synlig i stället för att dölja den.'),
  ('similar_to','liknar (fingerprint)','similar to (fingerprint)','objekt','objekt',
     'Fingerprint-granne: objekt med liknande multimodal signatur (form/ornamentik/arkeometri). Riktning + likhetsgrad i qualifiers.')
on conflict (code) do nothing;

-- Fingerprint som mått — multimodal likhet. PLANERAD: verktyget gör idag AI-forensik (analyze-runic:
-- form/typologi/datering + caveats, ingen mock) + metallprovenienis-match; vektor-NN är nästa bygge.
insert into public.ontology_measures (code, label_sv, label_en, rpc, inputs, output_unit, applies_to, status, description) values
  ('fingerprint_match','Fingerprint-matchning','Fingerprint match','(planerad)','objekt-id',
     'likhet 0–1','{inscription,hillfort,fortress,artefact}','planned',
     'Multimodal likhet (form + ornamentik + arkeometri: metall/isotop/datering) → närmaste grannar. Speglar metal_provenance_match men över flera modaliteter. Idag: AI-forensik + metallprovenienis; vektor-NN planerad.')
on conflict (code) do nothing;

commit;
