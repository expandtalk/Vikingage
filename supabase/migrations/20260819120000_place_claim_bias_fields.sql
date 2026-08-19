-- Epistemisk motor (Agneta Nyholm + Daniel): claim-liggaren får bära den BIAS som mest hotar ett
-- påstående, dess motåtgärd, och evidensens polaritet (positiv vs negativ/frånvaro). Gör hotet synligt
-- bredvid konfidensen i stället för dolt. Falsifiering-först (Popper/Wason): ett claim är starkare när
-- man aktivt sökt motbevis. Se /sv/vetenskapsmetodik ("Bias & motåtgärder").

alter table public.place_claim
  add column if not exists threatening_bias text,   -- t.ex. survivorship, confirmation, shared_root_assumption, publication
  add column if not exists bias_mitigation  text,   -- vad som gjorts/krävs för att motverka biasen
  add column if not exists evidence_polarity text;   -- 'positive' | 'negative' | 'absence' (negativ evidens väger lägre)

comment on column public.place_claim.threatening_bias is
  'Den kognitiva/urvals-bias som mest hotar detta påstående (survivorship, confirmation, shared_root_assumption, publication, …).';
comment on column public.place_claim.bias_mitigation is
  'Konkret motåtgärd: vilken falsifierande sökning gjordes, eller vilka oberoende evidenslinjer som krävs.';
comment on column public.place_claim.evidence_polarity is
  'positive = fynd stödjer; negative/absence = frånvaro av fynd (väger LÄGRE — frånvaro ≠ motbevis).';

-- Registrera attribut (FK-mål i place_claim_attribute) för bias-exemplen.
insert into public.place_claim_attribute (attribute, claim_type, description) values
  ('cult_strength', 'interpretation', 'Kultens styrka/utbredning för en gudom (ofta negativ evidens).'),
  ('independence_of_evidence', 'method', 'Metodpåstående om huruvida evidenslinjer är oberoende.')
on conflict (attribute) do nothing;

-- Seed 1 — NEGATIV EVIDENS (Njord). "Hittade inga spår → svag kult" blandar bevarings-, identifikations-
-- och negativ-evidens-bias. Lågt bevisvärde, tydligt märkt. (Vår teofor-analys: endast Närtuna håller.)
insert into public.place_claim
  (claim_key, entity_type, place_slug, attribute, statement, confidence, verification_status,
   evidence_polarity, threatening_bias, bias_mitigation, source_locator, created_by_method, note)
select 'c_bias_njord_cult', 'deity_cult', 'njord', 'cult_strength',
  'Njord-kulten lämnade få säkra teofora spår i Sverige (endast Närtuna håller källkritiskt).',
  0.30, 'needs_verification', 'negative', 'survivorship+identification',
  'Frånvaro av identifierade fynd ≠ belägg för svag kult: teofora orter bevaras och identifieras ojämnt, '
  || 'och gud-identifikation i material är osäker. Behandlas som negativ evidens med lågt bevisvärde.',
  'SOL 2003 (Närtuna); intern teofor-analys', 'seed_bias_example',
  'Illustrerar negativ evidens. Jfr Vikstrand; teofor-linsen i svarspanelen.'
where not exists (select 1 from public.place_claim where claim_key = 'c_bias_njord_cult');

-- Seed 2 — DELAT ROT-ANTAGANDE (Högom, METODEXEMPEL — påstår INGET om den verkliga gravens kön).
-- Könsbestämning enbart ur gravgods som upprepas litteratur→popvet→museinamn ("Högommannen") är ETT
-- antagande reproducerat, inte flera oberoende belägg.
insert into public.place_claim
  (claim_key, entity_type, place_slug, attribute, statement, confidence, verification_status,
   evidence_polarity, threatening_bias, bias_mitigation, source_locator, created_by_method, note)
select 'c_bias_hogom_method', 'method_example', 'hogom', 'independence_of_evidence',
  'Metodexempel: könsbestämning som enbart vilar på gravgods (vapen) och upprepas i litteratur → '
  || 'populärvetenskap → museinamn utgör ETT antagande reproducerat, inte flera oberoende belägg.',
  0.20, 'unpublished_hypothesis', 'positive', 'shared_root_assumption',
  'Kräver oberoende evidenslinjer: osteologi + aDNA + gravinventarium bedömda var för sig. '
  || 'Konvergens räknas bara mellan fristående kedjor.',
  'Metodexempel (Popper/Wason; jfr Agneta Nyholm)', 'seed_bias_example',
  'Påstår INGET om den verkliga Högomgravens kön — illustrerar mönstret att vakta mot.'
where not exists (select 1 from public.place_claim where claim_key = 'c_bias_hogom_method');
