-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap FR, 9 rader).
-- 9 kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
-- Dedup: WHERE NOT EXISTS på signum + ON CONFLICT(id). Ren data, idempotent. Kör i editorn.
insert into public.runic_inscriptions
  (id, signum, alternative_signum, coordinates, coord_source, coord_confidence,
   transliteration, normalization, translation_sv, translation_en, dating_text,
   scholarly_notes, object_type, material, landscape, country, data_source)
select
  v.id::uuid, v.signum,
  case when v.alt is not null then string_to_array(v.alt,'|') else null::text[] end,
  case when v.lat is not null then point(v.lng::float8, v.lat::float8) else null::point end,
  case when v.lat is not null then 'rundata_evighetsrunor' else null end,
  case when v.lat is not null then 'high' else null end,
  v.translit, v.norm, v.tsv, v.ten, v.dating, v.notes, v.otype, v.material, v.landscape,
  coalesce(v.country,'Sweden'), 'rundata_evighetsrunor'
from (values
('89813f7b-3346-4354-914e-f2a8ad318ecf','FR 4',NULL,62.2997,-7.0921,'fuþorkhniastb(m)…','<fuþorkhniastbm[lʀ]>',NULL,'<fuþorkhniastbmlʀ>',NULL,NULL,'Pinne','Trä',NULL,'Sweden'),
('611a5f10-e1fa-46ff-83aa-c0efc790b84f','FR 5',NULL,61.7663,-6.7923,'… (i)(s)l(i) ¶ …(g)isl(a) ¶ …m(e)r','… "Ísli(?) "…gísl/"Gísl… …',NULL,'… Íisli(?) …-gísl/Gísl-… …',NULL,NULL,'Fragment av gravhäll','Basalt',NULL,'Sweden'),
('924ab8a5-ee2e-409c-93a9-16a556d9b1e9','FR 1','L 2052',61.9521,-6.79264,'…-----i- uikuf(i) uni ruo','… "Vígulfi(?) unni róa.',NULL,'… may grant peace to Vígulf.',NULL,'Läses från höger till vänster.','Sten','Sten',NULL,'Sweden'),
('c39bf749-e30b-483b-bedf-729885a3d2ed','FR 2',NULL,62.0634,-7.14867,'þo^rkæl ⁓ o^no^nda^r su^n ¶ a^ustma^þr af ruha¶la^nde × bygþe (⁓) þe(n)¶a : sa^þ ⁓ fyst ×','"Þorkell "Ǫnundar sonr, austmaðr af "Rogalandi, bygði þenna stað fyrst.',NULL,'Þorkell Ǫnundr''s son, man of the east from Rogaland, lived in this place first.','Ca. 1200 eller lite senare',NULL,'Sten','Sten',NULL,'Sweden'),
('8f3eebdf-8b73-4d92-96e6-7e167ff30e01','FR 6',NULL,61.9521,-6.79264,'(g)(e)fas a mik','"Kefas(?) á mik.',NULL,'Kefas(?)/Cephas(?) owns me.',NULL,NULL,'Korstol','Trä',NULL,'Sweden'),
('103616a9-ad76-4946-be38-a691b94d0f42','FR 7',NULL,62.2091,-6.70921,'⁓ olaf(r)','"Ólafr',NULL,'Ólafr',NULL,NULL,'Sten','Basalt',NULL,'Sweden'),
('fa9ee275-2d45-41a3-afa0-a531f527ec06','FR 8','FR NOR1995;7',62.2091,-6.70921,'§A + -(i)ksharþr §B þuiufu- §C þi(n)-…(u)-','§A "[V]ígsharðr(?) §B … §C …',NULL,'§A Vígsharðr(?) §B … §C …',NULL,NULL,'Pinne','Trä',NULL,'Sweden'),
('a82e555c-1dfc-4ae6-add1-41a06669779b','FR 3',NULL,62.2997,-7.0921,'mklobi u','… …',NULL,'…',NULL,NULL,'Pinne','Trä',NULL,'Sweden'),
('1354c074-2232-4350-9ce7-aeb1fba65dcf','FR 9',NULL,61.5457,-6.77492,'§A l(i)ni §B (-)arkr §C (t)a(i) §D fu','§A … §B … §C … §D <fu[þork]>(?)',NULL,'§A … §B … §C … §D <fuþork>(?)',NULL,'Graffiti-liknande inskrifter, kors och bomärken, §D-inskriften på den ena smalsidan. Ursprungligen insänd till Nationalmuseet 1823 (Oldnordisk Museum kat. CMXXXVI). Återfunnen 2003.','Byggnadssten','Sten',NULL,'Sweden')
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
