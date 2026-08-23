-- Kanon-befordran av 5 verifierare-godkända Sverige-kopplingar → relationship-edges.
-- Endast VERIFIED (needs_verification/disputed/hypotes stannar i place_claim-staging).
-- Nya person-sociala predikat registreras först (MEDVETEN vokab-utökning, jfr rel_predicates-governance).
-- Provenans: qualifiers bär status/källa/claim_key (spårbart till place_claim) + source_ref + confidence.
-- Känsliga historiska figurer — sakligt, källbelagt. Subjekt/objekt via QID-join (inga hårdkodade uuid).

-- 1) Nya predikat (person→person). married_to + sibling_of finns redan.
INSERT INTO public.rel_predicates (code,label_sv,label_en,subject_type,object_type,qualifier_schema,description,version)
VALUES
 ('met','träffade','met','person','person','{"period":"text","note":"text","source":"text"}'::jsonb,
   'Personer möttes/hade dokumenterad personlig kontakt. Kurerat, källbelagt.',1),
 ('brother_in_law_of','svåger till','brother-in-law of','person','person','{"via":"text","note":"text"}'::jsonb,
   'Svågerskap (person→person), härlett ur giftermål/syskonskap.',1),
 ('nominated_for_nobel','nominerade till Nobelpriset','nominated for Nobel Prize','person','person','{"year":"text","prize":"text","note":"text"}'::jsonb,
   'Subjekt nominerade objekt till ett Nobelpris.',1)
ON CONFLICT (code) DO NOTHING;

-- 2) Edges för de 5 verified kopplingarna
INSERT INTO public.relationship (subject_id,predicate,object_id,qualifiers,source_ref,confidence,created_by)
SELECT s.id, e.predicate, o.id, e.qualifiers::jsonb, e.source_ref, e.confidence,
       'verifierare-signoff (Sverige-koppling aug 2026)'
FROM (VALUES
 ('Q47906','married_to','Q259176',
   '{"status":"belagt","year":"1923","place":"Stockholm","note":"Exakt vigseldag 3 vs 25 jan 1923 osäker.","claim_key":"swconn_goring_carin"}',
   'Carin Göring (Wikipedia); Fontander, Görings Sverige','certain'),
 ('Q47906','brother_in_law_of','Q955847',
   '{"status":"belagt","via":"Carins syster Mary gift med greve Eric von Rosen","note":"Göring mötte Carin på von Rosens Rockelstad 21 feb 1920.","claim_key":"swconn_goring_vonrosen"}',
   'Carin Göring (Wikipedia); rockelstad.se; Svensk Lufttrafik (Wikipedia)','certain'),
 ('Q865173','nominated_for_nobel','Q8016',
   '{"status":"belagt","year":"1953","prize":"litteratur","note":"Birger Nerman (ledamot Sv. Akademien, arkeolog) var ende nominatorn 1953.","claim_key":"swconn_churchill_nerman"}',
   'Nobelprize.org (litteratur 1953); International Churchill Society','certain'),
 ('Q352','met','Q154759',
   '{"status":"belagt","period":"1930-talet","note":"Upprepade möten + korrespondens; Hedin talade vid OS 1936. Redovisas balanserat mot Hedins egen antisemitism (Danielsson 2012).","claim_key":"swconn_hitler_hedin"}',
   'Sven Hedin, Utan uppdrag i Berlin (Fahlcrantz & Gumælius 1949); Danielsson 2012; USHMM','certain'),
 ('Q352','met','Q707785',
   '{"status":"belagt","period":"aug–sep 1939","note":"Birger Dahlerus, Görings svenske vän, hemlig mellanhand Berlin–London; Nürnberg-vittne 19 mars 1946.","claim_key":"swconn_hitler_dahlerus"}',
   'Birger Dahlerus, Sista försöket (1948); Nürnberg-protokollet (IMT)','certain')
) AS e(sq,predicate,oq,qualifiers,source_ref,confidence)
JOIN public.persons s ON s.wikidata_qid = e.sq
JOIN public.persons o ON o.wikidata_qid = e.oq
ON CONFLICT (subject_id,predicate,object_id) DO NOTHING;

-- 3) Markera de befordrade claimsen verified + granskade (staging speglar kanon)
UPDATE public.place_claim
SET verification_status='verified', reviewed_by='verifierare', reviewed_at=now()
WHERE claim_key IN ('swconn_goring_carin','swconn_goring_vonrosen','swconn_churchill_nerman',
                    'swconn_hitler_hedin','swconn_hitler_dahlerus');
