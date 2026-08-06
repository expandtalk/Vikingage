-- Sankta Ragnhild av Tälje → saints. Källkritiskt: historiciteten trolig men osäker (äldsta källor
-- 1400-tal); drottning-/gemål-uppgifterna omtvistade. Applicerad i prod via MCP (repo-spegling). 2026-08-06.
INSERT INTO public.saints (code, name, name_en, variants, saint_type, gender, lived_from, lived_to, cult_era, is_native_nordic, region_significance, patron_of, source)
SELECT 'ragnhild_talje', 'Sankta Ragnhild av Tälje', 'Saint Ragnhild of Tälje',
  ARRAY['Ragnhild','Ragnhild av Tälje','Ragnhild av Södertälje','Sankta Ragnhild'],
  'lokalhelgon', 'F', 1075, 1117, 'medeltid', true,
  'Södertälje (Tälje); östgötsk Bjälbo-tradition',
  'Södertälje-borna (Tälje)',
  'Svenskt helgon, vördad i katolska kyrkan; Tälje-bornas skyddshelgon. KÄLLKRITIK: äldsta källor från 1400-talet, historiciteten trolig men OSÄKER. Uppgifter om att hon var drottning/gemål till Inge (d.ä. vs d.y.) är omtvistade (Lilla rimkrönikan, Prosakrönikan), och fadersuppgiften "Halsten/kung" anses orimlig. Ska hört till Södertälje sedan 1400-talet (grundade sockenkyrkan, begraven där). Källa: Wikipedia (sv), paraphraserad.'
WHERE NOT EXISTS (SELECT 1 FROM public.saints s WHERE s.code = 'ragnhild_talje' OR s.name = 'Sankta Ragnhild av Tälje');
