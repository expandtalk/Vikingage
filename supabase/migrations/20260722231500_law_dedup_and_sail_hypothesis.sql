-- (a) Dedup av landskapslagar + (b) segel/rodd-hypotesen i bryte-temat.
-- Daniel 2026-07-22.
--
-- (a) Lag-importen (#45) la en andra uppsättning lagrader ovanpå en tidigare seed → 7
--     exakta dubblettpar (Gutalagen, Hälsingelagen, Magnus Erikssons landslag, Skånelagen,
--     Södermannalagen, Upplandslagen, Västmannalagen). Regel: behåll raden med referenser,
--     annars den kuraterade (landskapslag + bias_types), och kopiera in den rikare
--     beskrivningen. Alla 7 förlorare har 0 referenser (relationship/source_inscription_links/
--     source_texts) → säkert borttag. Dalalagen lämnas orörd (egen titel; samma lagtradition
--     som Västmannalagen = "Västmanna-Dalalagen", men det är ett redaktionellt ställningstagande
--     som Daniel får avgöra separat).
--
-- (b) Segel-hypotesen: seglet kom till Norden ~750–800 (Nydam/Kvalsund rodda → Oseberg/Gokstad
--     seglande; gotländska bildstenar visar segel från ~700–800). Om äldre flottor var roddflottor
--     namnger róðr → Ruotsi/Rus "roddarna" ett pre-segel-folk. Ledungens hamna/skeppslag räknas
--     i åror. Testbar mot bildstenar + skeppsfynd; segeldateringen är det oberoende benet.

-- (a) Berika keepers
UPDATE historical_sources SET description=(SELECT description FROM historical_sources WHERE id='34da221a-07d0-48d6-8cd8-7dad3e630b1a')
 WHERE id='c2b72cbd-0260-4510-a759-67096d7edf19';  -- Gutalagen
UPDATE historical_sources SET description=(SELECT description FROM historical_sources WHERE id='f20b7de4-0e59-4eaf-9ee8-b486ceb23f3d')
 WHERE id='a9d87583-47d6-4c6b-ba15-24edb6d82011';  -- Skånelagen
UPDATE historical_sources SET description=(SELECT description FROM historical_sources WHERE id='b3ed567b-395f-4bd1-8cef-f1a3bd1a99e6')
 WHERE id='fbb3dd8d-5158-41c9-92c7-839eeaa3b1d5';  -- Södermannalagen
UPDATE historical_sources SET work_type='landslag'     WHERE id='64dce14c-29fe-4c70-96c2-012769f09476';  -- Magnus Erikssons landslag
UPDATE historical_sources SET work_type='landskapslag' WHERE id='353a5821-40fd-42f6-9067-702cfb1fd478';  -- Upplandslagen
UPDATE historical_sources SET work_type='landskapslag', bias_types='{political_legitimacy,christian_anti_pagan}', written_year=1320
 WHERE id='524e0cd5-9b93-45b2-800c-b83ad08441ba';  -- Västmannalagen

-- (a) Radera 7 barnlösa dubbletter
DELETE FROM historical_sources WHERE id IN (
 '34da221a-07d0-48d6-8cd8-7dad3e630b1a','33b1a054-0a2f-422c-97f1-51abe781df20',
 '739a241a-787c-4005-bb82-5760adac63a4','f20b7de4-0e59-4eaf-9ee8-b486ceb23f3d',
 'b3ed567b-395f-4bd1-8cef-f1a3bd1a99e6','07fa8c04-8615-45cd-818d-21715b1535a8',
 '5a4080cf-a957-4381-b5f2-b91fbc9e7060');

-- (b) Segel/rodd-hypotesen in i temat
UPDATE themes SET description = description ||
  ' HYPOTES (segel ~800 & rodd-substratet, testbar): (1) Segeldatering — Nydam/Kvalsund rodda, Oseberg(~820)/Gokstad(~890) seglande → seglet till Norden ~750–800 [arkeologi, starkt]. (2) Gotländsk bildstensikonografi — fyrkantssegel dyker upp ~700–800 (Oehrl 2019-data) [ikonografiskt, starkt]. (3) róðr-etymologin — Ruotsi/Rus = "roddarna", ett pre-segel-namn [lingvistiskt, dominerande men normaniststrids-laddat]. Slutsats: en rodd-baserad flottkultur (ledungens hamna/skeppslag räknas i åror, ej segel) föregår seglet; namnet "roddarna" fossiliseras och seglet ~800 superladdar räckvidden = vikingatidens start. Rök (~800) "stilliʀ flutna" visar sjömaktens centralitet vid transitionen. Källkritik: rodd-vokabulären i 1200-talslagarna bevisar EJ pre-segel-ursprung (galärer rodde även med segel ombord); segeldateringen är det oberoende benet.'
WHERE slug='bryte-forvaltningsorganisation' AND description NOT LIKE '%HYPOTES (segel%';
