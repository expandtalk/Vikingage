-- Stift (dioceses). Ren data, körd via MCP execute_sql 2026-07-21. Idempotent (ON CONFLICT code).
-- Källa: etablerad kyrkohistoria (Adam av Bremen m.fl.). Se docs/superpowers/plans/2026-07-21-kyrkor-stift-ledarskap.md
INSERT INTO public.dioceses (code, name, name_en, seat, realm, founded_year, archdiocese_from_year, dissolved_year, source) VALUES
 ('hamburg_bremen','Ärkestiftet Hamburg-Bremen','Archdiocese of Hamburg-Bremen','Bremen','hre',831,831,NULL,'Adam av Bremen; etablerad kyrkohistoria'),
 ('lund','Ärkestiftet Lund','Archdiocese of Lund','Lund','danmark',1060,1103,NULL,'Lund blev ärkesäte 1103 för hela Norden'),
 ('uppsala','Ärkestiftet Uppsala','Archdiocese of Uppsala','Uppsala (Gamla Uppsala→1273 Östra Aros)','sverige',1123,1164,NULL,'Uppsala eget ärkestift 1164 (Stefan)'),
 ('skara','Skara stift','Diocese of Skara','Skara','sverige',1014,NULL,NULL,'Sveriges äldsta stift'),
 ('linkoping','Linköpings stift','Diocese of Linköping','Linköping','sverige',1120,NULL,NULL,'etablerad kyrkohistoria'),
 ('strangnas','Strängnäs stift','Diocese of Strängnäs','Strängnäs','sverige',1120,NULL,NULL,'etablerad kyrkohistoria'),
 ('vasteras','Västerås stift','Diocese of Västerås','Västerås','sverige',1120,NULL,NULL,'etablerad kyrkohistoria'),
 ('vaxjo','Växjö stift','Diocese of Växjö','Växjö','sverige',1170,NULL,NULL,'etablerad kyrkohistoria'),
 ('abo','Åbo stift','Diocese of Turku','Åbo','sverige',1276,NULL,NULL,'Finland under svenska kyrkan'),
 ('roskilde','Roskilde stift','Diocese of Roskilde','Roskilde','danmark',1022,NULL,NULL,'danskt stift')
ON CONFLICT (code) DO NOTHING;

-- Svenska stift blev metropolit under Uppsala fr.o.m. 1164.
UPDATE public.dioceses SET metropolitan_of = (SELECT id FROM public.dioceses WHERE code='uppsala')
WHERE code IN ('skara','linkoping','strangnas','vasteras','vaxjo','abo');
