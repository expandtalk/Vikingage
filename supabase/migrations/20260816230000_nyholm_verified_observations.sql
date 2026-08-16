-- Nyholm/Sofiainstitutet: proveniens-märkt källa + VERIFIERADE OBSERVATIONER i claim-liggaren.
-- Källkritik (filolog-genomläsning 2026-08-16): materialet är en andlig-aktivistisk rekonstruktion
-- (opubl., ej fackgranskad, AI-stödd, självmedgivna faktafel) → HYPOTESGENERATOR, ej auktoritet.
-- Endast OBSERVATIONER (frekvens/rumsligt) förs in, oberoende verifierade. INGA etymologier
-- (-anger=ånger, Val, ed, Ross/Jor/Mar=häst osv.) eller kult-som-faktum rör kanon.

-- 1) Proveniens-märkt källa.
insert into public.historical_sources
  (title, title_en, author, written_year, language, work_type, collection, catalog_role, rights, reliability, description)
select 'I modern, valan och den heliga hästens spår (upplaga 16)',
       'I modern, valan och den heliga hästens spår (ed. 16)',
       'Agneta Nyholm', 2026, 'sv', 'reconstruction',
       'Sofiainstitutet (opublicerad, ej fackgranskad)', 'scholarship', 'copyrighted', 'tertiary',
       'PROVENIENS: Nyholm/Sofiainstitutet, privatfinansierad, EJ akademiskt förankrad, AI-stödd (ChatGPT/Gemini som analysverktyg), självmedgivna faktafel. Behandlas som HYPOTESGENERATOR: endast frekvens-/rumsliga OBSERVATIONER kan prövas (status ≤ hypotes); etymologier + moderskult-som-realitet + systematisk namnradering = EJ kanon (folketymologi/ofalsifierbart, filolog-genomläsning 2026-08-16). Kärnan som HÅLLER (oberoende): völva/vala=reell central sejd-roll; Ångermanlands hög-status kvinnogravar; runstensglesheten.'
where not exists (select 1 from public.historical_sources where author='Agneta Nyholm' and title ILIKE 'I modern%');

-- 2) Verifierade observationer → place_claim (entity_type=landscape; tolkning HÅLLS UTANFÖR).
insert into public.place_claim
  (claim_key, entity_type, place_slug, attribute, statement, value, source_id, confidence,
   verification_status, created_by_method, note)
select v.claim_key, 'landscape', 'angermanland', v.attribute, v.statement, v.value,
       (select id from public.historical_sources where author='Agneta Nyholm' and title ILIKE 'I modern%'),
       v.conf, v.vstatus, v.method, v.note
from (values
  ('ang_runsten_sparse', 'runestone_density',
   'Ångermanland är runstensglest: saknar egen runstensserie (~0) mot Medelpad ~18, Hälsingland ~22 — skarp gräns i norr.',
   0::numeric, 0.9::numeric, 'verified', 'orkestrator-verifierad mot runic_inscriptions/Rundata',
   'OBSERVATION (Nyholm hypotesgenerator), VERIFIERAD oberoende. Nyholms TOLKNING (=förkristen kultöverlevnad/matriarkat) är EJ del av detta claim — separat obelagd hypotes.'),
  ('ang_theophoric_enrichment', 'theophoric_placename_enrichment',
   'Teofora/sakrala ortnamn ~1,58× tätare i Ångermanland (0,735%, 48/6529) än riket (0,464%, 1664/358248).',
   1.58::numeric, 0.5::numeric, 'verified', 'orkestrator-mätt: place_names, genitiv-förankrad regex, spatial ST_Contains landskapspolygon',
   'EGEN mätning inspirerad av Nyholms tes. SIGNAL ej bevis: heuristisk matchning (ej element-hits), denominator-konfund (norr=annan namntyps-mix), litet N=48 (statistiskt förhöjt). Testar cult-ortnamns-NÄRVARO, EJ personnamns-tabu och EJ Nyholms etymologier.')
) as v(claim_key, attribute, statement, value, conf, vstatus, method, note)
where not exists (select 1 from public.place_claim pc where pc.claim_key = v.claim_key);
