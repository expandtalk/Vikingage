-- Stift (dioceses) — AUKTORITATIV uppsättning. Körd via MCP. Idempotent (upsert på code).
-- Fakta ur Wikipedia "Svenska kyrkans stift" (stift, grundår, område, domkyrka) — ej prosa.
-- 13 nuvarande svenska stift (stift_code 01–13) + historiska (Hamburg-Bremen, Sigtuna, Tuna,
-- Kalmar, Mariestad, Viborg, Åbo, Borgå, Roskilde). Temporala övergångar bärs i
-- church_diocese_history (se oland-kalmar-diocese-history.sql). Se plan 2026-07-21-kyrkor-stift-ledarskap.

ALTER TABLE public.dioceses ADD COLUMN IF NOT EXISTS stift_code text;
ALTER TABLE public.dioceses ADD COLUMN IF NOT EXISTS territory text;
ALTER TABLE public.dioceses ADD COLUMN IF NOT EXISTS cathedral text;
ALTER TABLE public.dioceses ADD COLUMN IF NOT EXISTS is_current boolean NOT NULL DEFAULT true;

INSERT INTO public.dioceses
 (code,name,name_en,seat,realm,founded_year,archdiocese_from_year,dissolved_year,stift_code,territory,cathedral,is_current,source) VALUES
 ('uppsala','Ärkestiftet Uppsala','Archdiocese of Uppsala','Uppsala','sverige',1123,1164,NULL,'01','Uppland (utom södra), Gästrikland, Hälsingland','Uppsala domkyrka',true,'Wikipedia: Svenska kyrkans stift'),
 ('linkoping','Linköpings stift','Diocese of Linköping','Linköping','sverige',1120,NULL,NULL,'02','Östergötland, norra-nordöstra Småland','Linköpings domkyrka',true,'Wikipedia: Svenska kyrkans stift'),
 ('skara','Skara stift','Diocese of Skara','Skara','sverige',1014,NULL,NULL,'03','Mellersta och norra Västergötland, södra Dalsland','Skara domkyrka',true,'Wikipedia: Svenska kyrkans stift'),
 ('strangnas','Strängnäs stift','Diocese of Strängnäs','Strängnäs','sverige',1120,NULL,NULL,'04','Södermanland (utom nordöstra), Närke','Strängnäs domkyrka',true,'Wikipedia: Svenska kyrkans stift'),
 ('vasteras','Västerås stift','Diocese of Västerås','Västerås','sverige',1120,NULL,NULL,'05','Västmanland, Dalarna','Västerås domkyrka',true,'Wikipedia: Svenska kyrkans stift'),
 ('vaxjo','Växjö stift','Diocese of Växjö','Växjö','sverige',1170,NULL,NULL,'06','Småland (utom nordöstra), Öland','Växjö domkyrka',true,'Wikipedia: Svenska kyrkans stift'),
 ('lund','Ärkestiftet Lund','Archdiocese of Lund','Lund','danmark',1060,1103,NULL,'07','Skåne, Blekinge','Lunds domkyrka',true,'Wikipedia: Svenska kyrkans stift'),
 ('goteborg','Göteborgs stift','Diocese of Gothenburg','Göteborg','sverige',1620,NULL,NULL,'08','Västra Västergötland, Halland, Bohuslän, sydvästra Dalsland','Göteborgs domkyrka',true,'Wikipedia: Svenska kyrkans stift'),
 ('karlstad','Karlstads stift','Diocese of Karlstad','Karlstad','sverige',1647,NULL,NULL,'09','Värmland, delar av Dalsland','Karlstads domkyrka',true,'Wikipedia: Svenska kyrkans stift'),
 ('harnosand','Härnösands stift','Diocese of Härnösand','Härnösand','sverige',1647,NULL,NULL,'10','Jämtland, Medelpad, Ångermanland, Härjedalen','Härnösands domkyrka',true,'Wikipedia: Svenska kyrkans stift'),
 ('lulea','Luleå stift','Diocese of Luleå','Luleå','sverige',1904,NULL,NULL,'11','Norrbottens län, Västerbottens län','Luleå domkyrka',true,'Wikipedia: Svenska kyrkans stift'),
 ('visby','Visby stift','Diocese of Visby','Visby','sverige',1645,NULL,NULL,'12','Gotland','Visby Sankta Maria domkyrka',true,'Wikipedia: Svenska kyrkans stift'),
 ('stockholm','Stockholms stift','Diocese of Stockholm','Stockholm','sverige',1942,NULL,NULL,'13','Södra Uppland, nordöstra Södermanland','Storkyrkan',true,'Wikipedia: Svenska kyrkans stift'),
 ('hamburg_bremen','Ärkestiftet Hamburg-Bremen','Archdiocese of Hamburg-Bremen','Bremen','hre',831,831,NULL,NULL,'Norden före 1103','Bremen',false,'Wikipedia: Svenska kyrkans stift'),
 ('sigtuna','Sigtuna stift','Diocese of Sigtuna','Sigtuna','sverige',1060,NULL,1160,NULL,'Svealand','Sankt Pers kyrkoruin',false,'Wikipedia: Svenska kyrkans stift'),
 ('tuna','Tuna stift','Diocese of Tuna','Tuna','sverige',1100,NULL,1170,NULL,'Södermanland','Fors kyrka',false,'Wikipedia: Svenska kyrkans stift'),
 ('kalmar','Kalmar stift','Diocese of Kalmar','Kalmar','sverige',1603,NULL,1915,NULL,'Södra delen av Kalmar län','Kalmar domkyrka',false,'Wikipedia: Svenska kyrkans stift'),
 ('mariestad','Mariestads superintendentia','Superintendency of Mariestad','Mariestad','sverige',1580,NULL,1646,NULL,'Värmland, nordöstra Västergötland','Mariestads domkyrka',false,'Wikipedia: Svenska kyrkans stift'),
 ('viborg','Viborgs stift','Diocese of Vyborg','Viborg','sverige',1554,NULL,1723,NULL,'Sydöstra Finland','Viborgs gamla domkyrka',false,'Wikipedia: Svenska kyrkans stift'),
 ('abo','Åbo stift','Diocese of Turku','Åbo','sverige',1180,NULL,1809,NULL,'Västra och norra Finland','Åbo domkyrka',false,'Wikipedia: Svenska kyrkans stift'),
 ('borga','Borgå stift','Diocese of Porvoo','Borgå','sverige',1723,NULL,1923,NULL,'Sydöstra Finland','Borgå domkyrka',false,'Wikipedia: Svenska kyrkans stift'),
 ('roskilde','Roskilde stift','Diocese of Roskilde','Roskilde','danmark',1022,NULL,NULL,NULL,'Själland (Danmark)','Roskilde domkyrka',false,'dansk stiftsindelning')
ON CONFLICT (code) DO UPDATE SET
  name=excluded.name, name_en=excluded.name_en, seat=excluded.seat, realm=excluded.realm,
  founded_year=excluded.founded_year, archdiocese_from_year=excluded.archdiocese_from_year,
  dissolved_year=excluded.dissolved_year, stift_code=excluded.stift_code,
  territory=excluded.territory, cathedral=excluded.cathedral, is_current=excluded.is_current, source=excluded.source;

-- Svenska stift blev metropolit under Uppsala fr.o.m. 1164.
UPDATE public.dioceses SET metropolitan_of = (SELECT id FROM public.dioceses WHERE code='uppsala')
WHERE code IN ('skara','linkoping','strangnas','vasteras','vaxjo','abo','kalmar');
