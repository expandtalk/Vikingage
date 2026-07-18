-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap E, 20 rader).
-- 20 kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
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
('d349b97c-256d-43e4-b7dc-5f3455ed0901','E 12','Br E12',51.0614,-1.30926,'…(ʀ) : auk : ol:-… … ¶ …-usk--…','"… ok "Ól… … …',NULL,'… and Ól-… …','Början av 1000-talet','Röd färg bevarad i runorna.','Runsten','Sten',NULL,'Sweden'),
('a32cd14c-8f3f-411f-add7-819261199ad9','E 11','Br E11',54.1722,-3.06632,'dotbrt','"Dotbert',NULL,'Dotbert','1200-talet',NULL,'Sten från altare','Sten',NULL,'Sweden'),
('b6635098-df3a-4f91-99ec-948ca19092d9','E 3','Br E3',54.8941,-2.9356,'§A tolf(i)n urait þ-sar| |runr a þ-sa stain §B ai-','§A "Dólgfinnr vreit þ[e]ssar rúnar á þ[e]ssa stein. §B …',NULL,'§A Dólgfinnr carved these runes on this stone. §B …','1100-talet',NULL,'Vägginskrift','Sandsten',NULL,'Sweden'),
('a2fc1ba0-fcb5-4a5a-90af-1800f7472963','E 6','Br E6',54.7139,-3.43912,'hnirm','…',NULL,'…','1100-talet?',NULL,'Gravhäll','Sandsten',NULL,'Sweden'),
('8528b702-3bcb-46a4-a67f-ca5067c852dc','E 7','Br E7|DR 412A',51.3882,0.505361,'[…-(k)(i) : -…]','… …',NULL,'…','Början av 1000-talet?','Samma som E 7.','Fragment av gravhäll, gavelhäll','Sten',NULL,'Sweden'),
('5a32860c-e037-4bca-b03d-0afb13cef5fd','E 15','Br E15',54.6513,-2.83081,'§A fuþorkhniastbmm §B fu','§A <fuþorkhniastbm[lʀ]> §B …',NULL,'§A <fuþorkhniastbmlʀ> §B …','900-talet?',NULL,'Brosch','Silver',NULL,'Sweden'),
('ca8326e7-da7b-481b-972f-5499f67da64b','E 16','Br NOR1995;10|Br E16',53.228,-0.540921,'------l × hitir × stin × …','… heitir stein/"Stein …',NULL,'… is called stone/Stein … / … heats the stone …','1000-talet?','Funnet 1992 vid utgrävning.','Runben, revben','Nötkreatur',NULL,'Sweden'),
('bb754131-df46-4b07-bff4-7f8f70819e02','E 1','Br E1|L 1979',54.6915,-3.3714,'+ rikarþ : he : m^e : i{Ƿ}r(o)kt^e : {⁊} : to : þis : me:r{Ð} : {Ȝ}er : -- : m^e : brokt^e','"Ricarþ he me i{ƿ}rocte. {⁊} to þis mer{ð} {Ȝ}er … me brocte.',NULL,'Ricarþ he made me. And to this splendour … brought me.','1100-talet','Inskrift på medeltidsengelska.','Dopfunt','Sten',NULL,'Sweden'),
('01d15369-c2c4-4d8e-8e81-b045409a35c0','E 18',NULL,53.3995,0.179423,'× oþen · ok · einmtalr · ok : þalfa '' þeir ¶ ('') ielba '' þer uolflt '' ok '' kiriuesf ''','"Óðinn ok "Heimdallr ok "Þjálfa, þeir hjálpa þér "Úlfljót, ok …',NULL,'Óðinn and Heimdallr and Þjálfa, they help you, Úlfljót, and …','1000-talet','Funnen sommaren 2010.','Sländtrissa','Bly',NULL,'Sweden'),
('84153539-8f7c-4cf2-86d2-e8fca2c84f96','E 9','Br E9',54.1869,-3.13107,'… kml : leta : þena : kirk : -ub-rt : masun : --- : ----… +','… "Gamall(?) léta(?) þenna kirk. "[H]ub[e]rt mason/"Mássonr [vann](?) …',NULL,'… Gamall(?) … this church. Hubert the mason/Már''s son produced(?) …','1100-talet',NULL,'Tympanon','Röd sandsten',NULL,'Sweden'),
('44f31f8f-3ccb-4ac5-be53-1e9b7e601059','E 13','Br E13',51.7509,-0.342696,'§A …-þ:þu:uur:uur ¶ risti §B runaʀ : tr…','§A "Þórr(?)/"…Þórðr(?) risti §B rúnar …',NULL,'§A Þórr(?)/-Þórðr(?) carved §B runes …','1000-talet','Runföljden ...-þ:þu:uur:uur placeras under Otolkade belägg i NRL, s. 303.','Skulderblad','Rådjur',NULL,'Sweden'),
('c3e53674-5b28-49f7-be95-e5aa6159a040','E 19',NULL,54.4582,-1.46195,'[… …ist(i) : krus : -… ¶ …(i)r : mol:mu… …]','"… [r]eisti kross … [ept]ir "Maelmu[ire] …',NULL,'… raised (this?) cross in memory of Maelmuire …',NULL,'Funnen november 2013. Sannolikt senare återanvänd som byggnadssten. Den undre raden läses först.','Fragment av stenkors','Rödbrun sandsten',NULL,'Sweden'),
('7736fb06-4af2-4410-acb7-32a27fcbe722','E 8','Br E8',54.5619,-0.991591,'…--… ¶ …---ebel : ok : …','… … ok …',NULL,'… and …','1000-talet?',NULL,'Solurssten','Sten',NULL,'Sweden'),
('6f9ec9b5-fce8-4071-b52c-11a624b941d4','E 14','Br E14',51.7509,-0.342696,'wufri(k)','"Wulfric/"Ulfríkr',NULL,'Wulfric/Ulfríkr','1000-talet',NULL,'Skulderblad','Ben',NULL,'Sweden'),
('f27d4aed-4b68-4f90-861b-7e1553a055f7','E DR419','DR 419',51.2797,1.08145,'kuril sarþuara far þu nu funtin istu þur uigi þik þorsa trutin iuril sarþuara uiþr aþra uari ·','"Gyrill sárþvara, far þú nú, fundinn ertu; "Þórr vígi þik, þursa dróttinn, "Gyrill sárþvara. Viðr aðra vari.',NULL,'Gyril wound-causer, go now, you are found. Thor hallow you (to perdition), lord of giants (demons), Gyril wound-causer. Against blood-poison (literally: blood-vessel pus).','Efter 1073','Samma som E DR419. Sedan fyndet av U NOR1998;25 i Sigtuna som inleds med runföljden <iorils> kan emenderingen av <iuril> till <kuril> i DR och Moltke 1985 ifrågasättas.','Handskrift','Pergament',NULL,'Sweden'),
('290d83d5-2067-49d8-9925-3c907f32bcea','E 5',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Läsning: o^framr','Sten','Sten',NULL,'Sweden'),
('97554055-8da9-4023-82d8-d41167dfc787','E 10','Br E10',51.2795,1.08861,'[…an--…]/[…naþ-…]','…',NULL,'…','Början av 1000-talet?',NULL,'Stenfragment','Sten',NULL,'Sweden'),
('7b7c01b7-2583-4ebf-8a59-cbebb1896f85','E 4','Br E4|DR 418',53.2259,-0.537852,'kamb : koþan : kiari : þorfastr','Kamb góðan gerði "Þorfastr.',NULL,'A good comb Þorfastr made.',NULL,'Samma som E 4.','Kamfodral','Hjorthorn',NULL,'Sweden'),
('4c725435-abdf-421c-94a1-a1ff0ccd75ef','E 2','Br E2|DR 412',51.5129,-0.0975336,': k-na : let : legia : st¶in : þensi : auk : tuki :','"G[i]nna(?)/"G[í]na(?) lét leggja stein þenna ok "Tóki.',NULL,'Ginna(?)/Gína(?) had this stone laid and (i.e. with) Tóki.','Början av 1000-talet','Samma som E 2. Reliefhuggen, mörkblå och röd färg.','Gavelsten i gravkista','Kalksten',NULL,'Sweden'),
('ba2ccd32-03ee-4a30-be64-61711443abfe','E 17',NULL,54.8941,-2.9356,'r--n(a)lt','"R[ag]nvaldr',NULL,'Ragnvaldr','1100-talet – början av 1200-talet','Upptäckt i december 2008.','Vägginskrift','Sten',NULL,'Sweden')
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
