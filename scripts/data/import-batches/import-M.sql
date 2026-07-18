-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap M, 18 rader).
-- 18 kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
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
('7478ad79-47e5-47c0-945a-288aa6f23dff','M 5',NULL,62.3125,17.0548,'hokun lit rita '' stin þino| |obtiʀ skukna bruþur sin auk abti(ʀ) alþruþi muþur sino kuþ hialbi þiʀa salu auk| |kuþ muþiʀ','"Hakon let retta stæin þenna æftiʀ "Skygna, broður sinn, ok æftiʀ "Alþruði, moður sina. "Guð hialpi þæiʀa salu ok "Guðs moðiʀ.',NULL,'Hákon had this stone erected in memory of Skygni, his brother, and in memory of Alþrúðr, his mother. May God and God''s mother help their souls.',NULL,NULL,'Runsten','Granit','Medelpad','Sweden'),
('9d921e94-79ee-4b0a-97f9-6506bd4309be','M 13','B 1104|L 1080',62.4356,17.1617,'[…au…n… …uissi…] --naʀ','… … [ru]naʀ.',NULL,'… the runes',NULL,NULL,'Fragment av runsten','Gnejs','Medelpad','Sweden'),
('63bfce48-1581-40da-ac3e-41c0b04bd002','M 10',NULL,62.4055,17.2086,'uniʀ : ka[(r)(l) (u)(k) (a)]ni : ritu stain þino : afti(ʀ) … sin','"Unir(?), "Karl(?) ok "Áni réttu stein þenna eptir … sinn.',NULL,'Unir, Karl(?) and Áni erected this stone in memory of … their …',NULL,NULL,'Runsten','Granit','Medelpad','Sweden'),
('8913f8b9-85b2-499b-aa9a-5ec41e6a9aa9','M 15',NULL,62.4479,17.3525,'biurn : riti stain þino : aftiʀ : ufriþ : auk at : un sunu sin','"Bjǫrn rétti stein þenna eptir "Ófrið ok at "Un, sonu sína.',NULL,'Bjǫrn erected this stone in memory of Ófriðr and in memory of Unn, his sons.',NULL,NULL,'Runsten','Sten','Medelpad','Sweden'),
('64de579e-b4ea-4360-9930-c2b28dbb85ed','M 2','L 1073|B 1103',62.2569,17.3741,'oskir barþi','"Ásgeirr/"Ásgerðr barði.',NULL,'Ásgeirr/Ásgerðr struck (the runes).',NULL,NULL,'Fragment av runsten','Sten','Medelpad','Sweden'),
('fb0ad3a6-7165-443c-83ae-33e9aa4b564b','M 11','B 1106|L 1079',62.4007,17.2577,'kunuþr auk þurkairþ| |þaun -itu raisa st(a)(i)(n) aftiʀ þurstain sun sin in aun auk auntr bruþr hons','"Gunnviðr ok "Þorgærð þaun [l]etu ræisa stæin æftiʀ "Þorstæin, sun sinn. En "Aun ok "Øyndr [vaʀu] brøðr hans.',NULL,'Gunnviðr/Gunnuðr and Þorgerðr/Þorgautr, they had the stone raised in memory of Þorsteinn, their son. And Aun/Ǫrn and Eyndr were his brothers.',NULL,NULL,'Runsten','Gnejs eller diabas','Medelpad','Sweden'),
('4d34f950-4a37-4400-b1b1-975d29af0291','M 1','L 1072|B 1102',62.2919,17.3609,'× barksuain uk sihuastr uk friþi raistu stain ¶ þinsa '' aftiʀ buri faþur isin '' in farþaihn markaþi','"Bergsvæinn ok "Sigfastr ok "Friði ræistu stæin þennsa æftiʀ "Buri(?)/"Byri(?), faður sinn. En "Farþegn markaði.',NULL,'Bergsveinn and Sigfastr and Friði raised this stone in memory of Búrir(?)/Býrir(?), their father. And Farþegn marked.',NULL,'Runföljden buri placeras under Otolkade belägg i NRL, s. 298.','Runsten','Ljusgrå granit','Medelpad','Sweden'),
('fb20d6a8-3c89-488e-b5ed-4e83ebc0e603','M 3','B 1105|L 1074',62.2708,17.4108,'alrþuþr ak sihrtifr| |ritu stin þina| |abtiʀ miskik faþur sin ak abtiʀ tisui muþur sina','"Alþruðr ok "Sigræifʀ rettu stæin þenna æftiʀ "<miskik>, faður sinn, ok æftiʀ "Disvi, moður sina.',NULL,'Alþrúðr and Sigreifr erected this stone in memory of <kiskik>, their father, and in memory of Dís, their mother.',NULL,'Hellbom tolkar runföljden kiskik som namnet Giskingr.','Runsten','Ljusgrå gnejsgranit','Medelpad','Sweden'),
('71726c0f-d7cb-4d2b-aab3-7fd2d5361194','M 9','B 1111|L 1078',62.4054,17.2087,'[siuhurþ auk þuriʀ haþin auk harsʀ raistu stain þina| |abtiʀ þurþ siarþu faþur sin]','"Sigurðr ok "Þoriʀ, "Heðinn ok "Hærsiʀ ræistu stæin þenna æftiʀ "Þorð "Siarðu(?), faður sinn.',NULL,'Sigurðr and Þórir (and) Heðinn and Hersir raised this stone in memory of Þórðr Serða(?), their father.',NULL,NULL,'Runsten','Sten','Medelpad','Sweden'),
('874061ca-67fb-406b-969e-a4e78222515b','M 7','B 1108|L 1075|L 1076',62.3275,17.0656,'(þ)(u)rs-i[n] riti stin þin… … …aþur : sin : hakun markaþi','"Þors[t]æinn retti stæin þenn[sa] … [f]aður sinn. "Hakon markaði.',NULL,'Þorsteinn erected this stone … his father. Hákon marked.',NULL,NULL,'Fragment av runsten','Sten','Medelpad','Sweden'),
('49365c0a-e482-4420-80d7-4fc761dde6b9','M 16',NULL,62.4479,17.3525,'bia(r)(n) raiti … …þur sin : kuþ hialbi ant hans … …ti runaʀ','"Biorn ræisti … [fa]ður/[bro]ður sinn. "Guð hialpi and hans … [ris]ti runaʀ.',NULL,'Bjǫrn raised … his father/brother. May God help his spirit … carved the runes.',NULL,NULL,'Fragment av runsten','Granit','Medelpad','Sweden'),
('4a73dbed-7c8d-4161-97a5-d4ea9d359310','M 8','L 1077|B 1110',62.3597,17.0362,'tulha riti stin þi(n)(o) abtiʀ salua u[k at biurn s]unu si(n)n','"Dolga rétti stein þenna eptir "Sǫlva ok at "Bjǫrn sonu sína.',NULL,'Dolga erected this stone in memory of Salvi and in memory of Bjǫrn, his sons.',NULL,NULL,'Runsten','Granit','Medelpad','Sweden'),
('675737f1-1d4f-4abf-848a-b8d257b380ec','M 6','L 1075|L 1076|B 1107',62.314,17.1034,'[(a)(n)ut riti stin þina a-ti- hakun faþuʀ …]','"Anundr retti stæin þenna æ[f]ti[ʀ] "Hakon, faður …',NULL,'Ǫnundr erected this stone in memory of Hákon, (his) father …',NULL,'Numera så gott som oläslig.','Runsten','Gnejs','Medelpad','Sweden'),
('1a2b0876-4e98-44c3-ac7d-3d19abeb00e6','M 4',NULL,62.3125,17.055,'…uki raisti st… … f(u)r austr · miʀ i(i)…ri (i)aisinsiltaikan-… …i · stain þin','"[T]oki/"[Full]ugi/"[Ill]ugi ræisti st[æin] … for austr meðr "Ing[va]ri(?) … … stæin þenna.',NULL,'Tóki/Fullugi/Illugi raised the stone … travelled to the east with Ingvarr(?) … this stone.',NULL,'Runföljden ...uki placeras under Otolkade belägg i NRL, s. 303.','Fragment av runsten','Granit','Medelpad','Sweden'),
('1e4285cc-3e47-4f90-89cc-42322d6a422b','M 14','L 1082',62.4551,17.1327,'[sikuʀþ suain auk hrþuʀ ritu stai- þina abtiʀ ihul foþur sin]','"Sigurðr, "Sveinn ok "Hǫrðr réttu stei[n] þenna eptir "Ígul, fǫður sinn.',NULL,'Sigurðr, Sveinn and Hǫrðr erected this stone in memory of Ígull, their father.',NULL,'Ristningen inte längre läsbar.','Runsten','Grå granit','Medelpad','Sweden'),
('ce825431-008f-49e0-b5cd-7e059db66beb','M 18',NULL,62.4761,17.3158,'[… þinsa oiiuarufþ krimst aisaiuuþ iauoatinoti]','… þenna … … … …',NULL,'… this …',NULL,NULL,'Runsten','Sten','Medelpad','Sweden'),
('275c95ab-50d2-4503-b33f-0f3f89722e05','M 12','L 1081',62.4225,17.184,'[… …u raisa stain þins(a) …]','… [lét]u reisa stein þenna …',NULL,'… had this stone raised …',NULL,NULL,'Runsten','Sten','Medelpad','Sweden'),
('f7f69664-6da5-4196-bc71-90a18bef123c','M 17','B 1109|L 1084|L 1083',62.448,17.3527,'[… raisti stain þinsa aftiʀ ulaif … …i : run--]','… reisti stein þenna eptir "Óleif … [rist]i rún[ar].',NULL,'… raised this stone in memory of Óleifr … carved the runes.',NULL,NULL,'Fragment av runsten','Sten','Medelpad','Sweden')
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
