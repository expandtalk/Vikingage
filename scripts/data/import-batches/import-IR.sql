-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap IR, 16 rader).
-- 16 kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
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
('75c43eb8-32ce-4b4d-bf97-50e89b491006','IR 9',NULL,53.3432,-6.27064,'§A teli --… ¶ sua : sua… §B …(i)--ir ehhe ¶ tal','§A … … … … §B … … …',NULL,'§A … §B …','Mitten av 1000-talet',NULL,'Skulderblad','Nötkreatur',NULL,'Sweden'),
('c60b648c-708d-4915-be88-f4dfd757a185','IR 1',NULL,53.871,-6.39155,'tomnal selshofoþ a soerþ| |þeta','"Domnall "Selshǫfuð á sverð þetta.',NULL,'Domnall seal''s head owns this sword.','Ca. 1100',NULL,'Ändskoning till rem','Brons',NULL,'Sweden'),
('bebeb2b9-6779-42a9-b5fd-c836ac706bb6','IR 16',NULL,53.344,-6.27035,'- sb---','… sp[ýta](?)',NULL,'… stick(?)/pin(?)','Mitten av 1000-talet',NULL,'Runben','Ben',NULL,'Sweden'),
('bfccf0a3-e25e-481f-94fb-7495c02ed60e','IR 15',NULL,55.1085,-7.92389,'r','…',NULL,'…','Början av 1000-talet',NULL,'Armring','Silver',NULL,'Sweden'),
('221bfb79-230f-4d7c-8a48-12b8dfa6fd0e','IR 6',NULL,53.3432,-6.27064,'§A so[þ]r miþ [f]ris… §B …u(m)-oþ · sis : is-m--…','§A Saðr(?) með(?) frís[um](?). §B … … …',NULL,'§A A truthful man among the Frisians. §B …',NULL,NULL,'Hyvel','Trä',NULL,'Sweden'),
('10b96532-e704-44ee-8ca0-9473a4f31672','IR 7',NULL,53.3432,-6.27064,'§A [stil(t)(i)r-] §B [stili(n)r ka…]','§A … §B "Stillingr/"Stílingr …',NULL,'§A … §B Stillingr ''The quiet one/Stílingr ''The chap with the stylus''','Mitten av 1000-talet','Inga runor är nu synliga.','Trähandtag med doppsko av kopparlegering','Trä och koppar',NULL,'Sweden'),
('583ec6f0-1fac-4be3-bc1a-1f1237697eb2','IR 8',NULL,53.344,-6.27035,'nubʀ nubþi-','"Gnúpr(?) gnúfði(?).',NULL,'Gnúpr drooped.',NULL,NULL,'Runben, revben','Nötkreatur',NULL,'Sweden'),
('9a7f7482-468c-46a2-a482-d6cd92a7e8df','IR 2',NULL,52.8069,-8.44447,'(þ)(u)rgri- [⁓] risli + ¶ (k)rus þina','"Þorgrí[mr] reisti/risti kross þenna.',NULL,'Þorgrímr erected/carved this cross.',NULL,'Stenen har även en oghaminskrift och en sannolik kristusfigur.','Fragment av stammen av ett stenkors','Sten',NULL,'Sweden'),
('8e41df38-f2c4-4bb8-8b12-3e35a9f669f1','IR 14',NULL,53.3432,-6.2676,'fuþor u^n/n^u','<fuþor[k]> "Unnr(?)',NULL,'fuþork Unnr','1000-talet',NULL,'Kam','Ben',NULL,'Sweden'),
('2cf9cb21-28eb-4594-9e92-533eaf9ff9f6','IR 12',NULL,53.344,-6.27035,'hurn : hiartaʀ · la : a ys aʀ','Horn hjartar lá á ósi ár.',NULL,'The deer''s antler lay at the river mouth.','Ca. 1000',NULL,'Hjorthorn','Hjorthorn',NULL,'Sweden'),
('604d361e-c19d-481e-a689-387095fcd8c4','IR 4',NULL,53.3432,-6.27064,'kirlak-','"Geirlak[r]',NULL,'Geirlak',NULL,NULL,'Paddel','Trä',NULL,'Sweden'),
('239106b9-7bc6-469d-bbd5-1b692b894cd7','IR 10',NULL,53.344,-6.27035,'§A (s)(a)- riti sanat kaolu a^mn -… §B a(i)kua(i)tu','§A … riti sanat gálu. Amen … §B …',NULL,'§A … by writing heals the crazy woman. Amen …',NULL,NULL,'Skulderblad','Ben av får',NULL,'Sweden'),
('a8054a71-82b8-4bd0-88c6-f7230594b9bf','IR 11',NULL,53.344,-6.27035,'§A fuþork × hniastbmlʀ §B fuþorkhniastbmlʀ','§A <fuþork hniastbmlʀ> §B <fuþorkhniastbmlʀ>',NULL,'§A fuþork inscription §B fuþork inscription','Mitten av 1000-talet',NULL,'Pinne','Trä',NULL,'Sweden'),
('aecb06dd-d427-4fb4-bff7-f340b9d5f94b','IR 13',NULL,53.344,-6.27035,'…','…',NULL,'…','Andra hälften av 900-talet','Tveksamt om runor, eventuellt runliknande tecken.','Runben, revben','Nötkreatur',NULL,'Sweden'),
('ae34e769-c66a-409f-9861-510399d7aced','IR 5',NULL,53.3432,-6.27064,'on a a?su ??','"Ónn á "Ásu …',NULL,'Ónn owns Ása.','1000-talet',NULL,'Runben, revben','Nötkreatur',NULL,'Sweden'),
('8ee9c2de-746b-4252-80f2-5dca2afd7376','IR 3',NULL,52.1154,-10.5069,'-(i)r (·) r(i)(s)ti (·) st(i)- (·) --n- -m(u)-(u)--- (r)(i)(s)t(i) …','"… reisti stei[n] [þe]nn[a]. "… risti …',NULL,'… erected this stone. … carved …','1000-talet',NULL,'Överliggare av sten till dörr','Sten',NULL,'Sweden')
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
