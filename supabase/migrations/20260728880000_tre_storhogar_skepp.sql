-- Tre platser Daniel verifierat mot Wikipedia/FMIS. Koordinater från FMIS/Wikipedia (ej gissade).
-- Ärliga förbehåll om traditionsattributioner inskrivna i description (tolkning ≠ fakta).

-- 1. Östens hög (Kung Östen hög) — Björksta 106:1, järnåldershög öster om Västerås.
insert into public.heritage_sites
  (raa_type, name, landscape, municipality, parish, lat, lng, period, existence, description,
   source_uri, register_system, register_id)
values ('hög', 'Östens hög (Kung Östen hög)', 'Västmanland', 'Västerås', 'Björksta',
  59.621586, 16.871064, 'Järnålder (anlagd ca 500–600-tal e.Kr.)', 'extant',
  'Storhög i Östanbro, Björksta sn, vid Sagån på gränsen mot Enköpings kommun — 5 m hög, 60 m i diameter, en av Mälardalens största storhögar (jämngammal med närbelägna Anundshög). Två gropar i mitten (3–4 m) + svacka i öster (trolig jordtäkt). Vid platsen låg Eriksgatans vattenövergång "Östens bro" (Östanbro): enligt Upplandslagen möttes västmanlänningar och upplänningar här vid gränsen, med "Kung Östens hög" och "Kung Skutes hög" på var sin sida. Traditionellt — men enligt Wikipedia/RAÄ inte tillförlitligt — förknippad med sagokungen Östen av Ynglingaätten. OBS: den ofta återgivna uppgiften att "Östen dräptes på härnadståg till Estland" avser i Ynglingatal egentligen Yngvar (Bröt-Anunds far); Östen är där Bröt-Anunds farfar.',
  'raa:Björksta106:1', 'RAÄ Fornsök', 'Björksta 106:1')
on conflict (source_uri) do nothing;

-- 2. Dagshög (Bjäre) — bronsåldershög, Skånes största. Disambiguerad mot befintliga
--    "Dags hög, Gravfält" i Västrum/Västervik (annan plats, Småland).
insert into public.heritage_sites
  (raa_type, name, landscape, municipality, parish, lat, lng, period, existence, description,
   source_uri, register_system, register_id)
values ('hög', 'Dagshög (Bjäre, Skåne)', 'Skåne', 'Båstad', 'Västra Karup',
  56.391658, 12.646319, 'Bronsålder (1800–500 f.Kr.)', 'extant',
  'Skånes största gravhög, på Bjärehalvön strax söder om Torekov, i ett öppet kustlandskap. Bjäre har över 700 registrerade gravhögar (varav ~100 ≥20 m diameter) samt skeppssättningar och ~40 rösen. Aldrig arkeologiskt utgrävd. Under andra världskriget uppfördes en observationsplats på krönet (riven 1956, då högen restaurerades). Förvaltas av Statens fastighetsverk sedan 2015. Folktradition: en skånsk kung skulle ligga begravd här, död i strid mot hallänningar och blekingar utsända av kungen i Uppsala — inga belägg. Namnet knyts traditionellt till Dag (Ynglingaätten). FMIS-typ: röse.',
  'raa:lamning/1be60b8d-ff77-40c8-9875-07dce43d6560', 'RAÄ Fornsök', null)
on conflict (source_uri) do nothing;

-- 3. Äskekärrsskeppet — Starrkärr 13:1, Sveriges enda utgrävda & utställda vikingaskepp.
insert into public.heritage_sites
  (raa_type, name, landscape, municipality, parish, lat, lng, period, existence, description,
   source_uri, register_system, register_id)
values ('fartygslämning', 'Äskekärrsskeppet', 'Västergötland', 'Ale', 'Starrkärr',
  57.93853, 12.07724, 'Vikingatid (byggt ca 900–920; i bruk till ca 1010–1030)', 'extant',
  'Sveriges enda arkeologiskt utgrävda och utställda vikingaskepp (Göteborgs stadsmuseum sedan 1995, utställt som det hittades). Fyndplats: strandäng vid Göta älv, Månsgården, Äskekärr. Rapporterat 1933, utgrävt under Philibert Humbla. Klinkbyggt av ek, ca 16 m långt, last ~20 ton — trolig knarr (handelsskepp). Oskarvad, svagt bågformad köl 12,7 m (jfr Gokstad). Datering: pollen gav först sent 700-/tidigt 800-tal, men C14 (omkal.) + dendrokronologi (Bråten, bekr. N. Bonde, Nationalmuseet København) ger bygge ca 900–920 (tidigt 900-tal); reparerat ca 1010 med icke-lokalt (troligen danskt) virke, övergivet som vrak ca 1010–1030. Runor: två klara runor + runliknande tecken på mastfoten (Runverkets bedömning) — ett av få vikingaskepp med runor. Fullskalig rekonstruktion "Vidfamne" sjösatt 1994. I närheten Äskekärr 2 (Starrkärr 192:1, ca 1050–1150) och "Petréns båt" (Starrkärr 177:1) — möjligt vikingatida varvsområde.',
  'raa:Starrkärr13:1', 'RAÄ Fornsök', 'Starrkärr 13:1')
on conflict (source_uri) do nothing;
