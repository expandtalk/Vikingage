-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap Sc, 15 rader).
-- 15 kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
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
('4cda40a1-fa7c-4128-8ed3-5f974726bb41','Sc 1','Br Sc1|Br Olsen;178',56.5043,-2.8269,'[…mkitil : þa…]','"[Grí]mketill(?) …',NULL,'Grimketill(?) …',NULL,'Funnen 1796, avritning från efter 1856.','Platta','Brons',NULL,'Sweden'),
('69a2d202-1012-4bd3-a8b5-64cd33000acb','Sc 12','Br Olsen;169A|Br Sc12',55.5223,-5.07678,'ola(b)r','"Ólafr',NULL,'Ólafr','1200-talet','Läses från höger till vänster.','Vägginskrift','Sten',NULL,'Sweden'),
('f2cfc118-9c87-424e-bf8d-752d5d836cda','Sc 14','Br Sc14',56.335,-6.39173,'× kali × ouluis × sunr × laþi × stan × þinsi × ubir × fukl × bruþur …','"Kali, "Ǫlvis sonr, lagði stein þenna yfir "Fugl, bróður …',NULL,'Kali, Ǫlvir''s son, laid this stone over Fugl, (his) brother.','1000-talet',NULL,'Gravhäll','Sten',NULL,'Sweden'),
('ec74bc37-e424-4598-8d99-3beec5f6f87b','Sc 13','Br Sc13',55.5223,-5.07678,'(m)','…',NULL,'…','1200-talet',NULL,'Vägginskrift','Sten',NULL,'Sweden'),
('1d037a3a-d079-458d-a09b-e95434191f27','Sc 3','Br Sc3',55.5223,-5.07678,'(+) (n)[ik]ul(o)(s) (:) [a] (h)(æ)[n]e [:] ræist (:)','"Nikulás á "Hæni reist.',NULL,'Nikulás of Hæn carved.','1200-talet',NULL,'Vägginskrift','Sten',NULL,'Sweden'),
('c3ea6685-4e8f-4df3-a32f-ad1598d5e6c0','Sc 6','Br Sc6',55.5223,-5.07678,'amudar','"Ámundr',NULL,'Ámundr','1200-talet',NULL,'Vägginskrift','Sten',NULL,'Sweden'),
('e15f5f7e-b6ed-48c4-8a23-ec5143dd170a','Sc 11','Br Sc11|Br Olsen;179',58.5968,-3.51427,'… …-þi ⁓ ubirlak þita ⁓ aft : ikulb ⁓ foþur (s)in','… [ger]ði yfirlag þetta ept "Ingulf, fǫður sinn.',NULL,'… made this overlay in memory of Ingulfr, his/her father.','1000-talet',NULL,'Kors avsett att ligga','Sten',NULL,'Sweden'),
('16cfd03a-a242-4d57-b9f8-51c9cd2c9f7a','Sc 7','Br Sc7',55.5223,-5.07678,'uiglæikr s-alla^re ræi-s(t)','"Vígleikr s[t]allari re[i]st.',NULL,'Vígleikr [the king''s] marshal carved.','1263(?)',NULL,'Vägginskrift','Sten',NULL,'Sweden'),
('43a47911-0157-4e78-8119-3db32bdebe11','Sc 4','Br Sc4',55.5223,-5.07678,'su(æ)in','"Sveinn',NULL,'Sveinn','1200-talet',NULL,'Vägginskrift','Sten',NULL,'Sweden'),
('0f7e629a-00e5-4fb5-92ea-ba80a1766651','Sc 2','Br Sc2|Br Olsen;169C',55.7136,-4.90071,'malbriþa a stilk ⁓ …','"Melbrigða á stilk …',NULL,'Melbrigða owns the pin … / Melbrigða stilkr owns [this] …',NULL,'Ytterligare ca 25 tecken finns.','Keltisk brosch','Metall',NULL,'Sweden'),
('67325aa8-26b3-4647-b6b0-8140a0c50a3c','Sc 5','Br Olsen;169B|Br Sc5',55.5223,-5.07678,'ono(n)tr : r(a)-st : ru','"Ǫnundr re[i]st rú[nar].',NULL,'Ǫnundr carved the runes.','1200-talet',NULL,'Vägginskrift','Sten',NULL,'Sweden'),
('7c0e8d2d-ec96-4c5b-9046-814ffd0f94fb','Sc 10','Br Olsen;172|Br Sc10',55.7902,-5.15214,'§A … (k)rus : þine : til : kuþ-e--… §B …(i) : k(r)u(s) : …','§A … kross þenna til … §B … kross …',NULL,'§A … this cross for(?) … §B … cross …',NULL,NULL,'Sönderbrutet kors','Skiffer',NULL,'Sweden'),
('db5ea9fc-3cc0-4558-88cc-f351bae12e87','Sc 9','Br Sc9',55.5223,-5.07678,'ioan','"Jóan',NULL,'Jóan',NULL,NULL,'Vägginskrift','Sten',NULL,'Sweden'),
('1e449441-633f-439f-b288-383da88a59eb','Sc 15','Br Sc15',58.5968,-3.51427,'… …unil-i (:) kunu : s(i)(n)… …','… "[G]unnhil[d]i konu sín[a] …',NULL,'… Gunnhildr his wife …','1000-talet?','Inmurad 6,2 m över marken.','Sten','Sten',NULL,'Sweden'),
('d8ed26e5-6887-4cb6-bff7-e49bdd77ea4e','Sc 8','Br Sc8|Br Olsen;174',57.0397,-7.4337,'…-ir : þur(:)kirþu : s(t)i-(a)r ¶ …-r (:) is (:) kurs : s-- (:) ristr ¶ …- (:) --','[Ept]ir(?) "Þorgerðu "Stei[n]ars [dóttu]r(?) er kross s[já] reistr. … …',NULL,'In memory of Þorgerðr, Steinarr''s daughter(?), this cross is raised. …',NULL,NULL,'Kors','Sten',NULL,'Sweden')
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
