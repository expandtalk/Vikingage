-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap DE, 14 rader).
-- 14 kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
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
($$6343b0a3-845b-4bdf-906c-b5611d48feb7$$,$$DE StOl4$$,$$X StOl4$$,NULL,NULL,$$§A abi : bataba : iestaba §B kukr : kuc kutu ¶ kys$$,$$§A … … … §B Kúkr kyss kuntu, kyss!$$,NULL,$$§A … §B Prick kiss the cunt, kiss!$$,$$Slutet av 1000-talet$$,$$Fyndår 1979. Inskriften på sidan A är kanske ett runsyllabarium.$$,$$Runben$$,$$Ben$$,NULL,$$Sweden$$),
($$0bf4d348-8df8-45d2-83a0-9eeee9cb2030$$,$$DE Scripta65;171A$$,NULL,NULL,NULL,$$§A fo §B l$$,$$§A … §B …$$,NULL,$$§A … §B …$$,$$Eller sentida?$$,NULL,$$Amulettsten$$,$$Täljsten$$,NULL,$$Sweden$$),
($$9dec5f79-bb56-4ac8-9f3b-9f8fd4114ca0$$,$$DE StOl8$$,$$X StOl8$$,NULL,NULL,$$fuþorkhniastbmlʀ$$,$$<fuþorkhniastbmlʀ>$$,NULL,$$<fuþorkhniastbmlʀ>$$,$$1100–1150 (arkeologisk datering)$$,$$Fyndår 1984.$$,$$Runben$$,$$Ben$$,NULL,$$Sweden$$),
($$6a15fea1-76f1-4259-8195-fab3686ffeed$$,$$DE StOl7$$,$$X StOl7$$,NULL,NULL,$$§A -ak : eigi : ha : a : hafi : uti : heltr : tak : hu… §B …uran : marum$$,$$§A [T]ak æigi ha a hafi uti, heldr tak hu[n](?). §B <…uran> <marum>$$,NULL,$$§A Don't take the oarlock out at the sea; rather take the top of the mast (for hoisting the sail)(?) §B <…uran> <marum>$$,$$1100–1150 (arkeologisk datering)$$,$$Fyndår 1984.$$,$$Runben$$,$$Ben$$,NULL,$$Sweden$$),
($$60d07696-233d-419c-b707-38c8c9544c42$$,$$DE StOl2$$,$$X StOl2$$,NULL,NULL,$$§A urn §B urn ¶ ???$$,$$§A "Ørn/ørn §B "Ørn/ørn …$$,NULL,$$§A Ǫrn/eagle §B Ǫrn/eagle …$$,$$Slutet av 1000-talet$$,$$Fyndår 1973.$$,$$Runben$$,$$Ben$$,NULL,$$Sweden$$),
($$b00f5c22-d9eb-4ba5-9797-6d58832c0337$$,$$DE StOl5$$,$$X StOl5$$,NULL,NULL,$$sinkn :$$,$$…$$,NULL,$$…$$,$$1050–1100 (arkeologisk datering)$$,$$Fyndår 1985.$$,$$Runben$$,$$Ben$$,NULL,$$Sweden$$),
($$08bb7227-09ee-43eb-8e7b-58005046594d$$,$$DE VK;297$$,$$X PomVK;297$$,54.4737,13.4477,$$tu…$$,$$…$$,NULL,$$…$$,NULL,NULL,$$Runben$$,$$Ben$$,NULL,$$Sweden$$),
($$c3be5239-a647-4012-a600-c404910f020c$$,$$DE Scripta65;171B$$,NULL,NULL,NULL,$$fuþork : hnins : tbmlʀ$$,$$<fuþork hnias tbmlʀ>$$,NULL,$$<fuþork hnias tbmlʀ>$$,$$1000–1100-talet$$,$$Fyndår 2003. futhark$$,$$Runben$$,$$Ben$$,NULL,$$Sweden$$),
($$55f2ff5a-cbee-49ca-a580-2cec228e2e7f$$,$$DE StOl1$$,$$X StOl1$$,NULL,NULL,$$§A þorki §B fuþo ¶ a(s)…$$,$$§A "Þorki[ll]/"Þorge[rr]/"Þorgi[sl]/"Þorgi[ls] §B <fuþo[rk]> …$$,NULL,$$§A Þorkell/Þorgeirr/Þorgísl §B <fuþork> …$$,$$1050–1100$$,$$Fyndår 1973.$$,$$Runben$$,$$Ben$$,NULL,$$Sweden$$),
($$18e812e9-f8cf-4136-a830-b893aa2fbcd1$$,$$DE EM85;534$$,$$X HlstEM85;534B|DR EM85;534B$$,53.8683,10.6876,$$pa a · knif · koþa…$$,$$"Pai a knif goþa[n].$$,NULL,$$Pái owns a good knife.$$,NULL,$$Hittad 1947.$$,$$Runben$$,$$Ben$$,NULL,$$Sweden$$),
($$93e862b4-7f48-4aa4-9b92-4e06354e5fa8$$,$$DE StOl6$$,$$X StOl6$$,NULL,NULL,$$ber min : erinde : þat : ik : ei : hafa : skyrte$$,$$Bær min ærindæ þat ek æi hafa skørtæ(?).$$,NULL,$$Convey my errands so I don't get [any] disadvantage(?).$$,$$1100–1150 (arkeologisk datering)$$,$$Fyndår 1985.$$,$$Runben$$,$$Ben$$,NULL,$$Sweden$$),
($$3a628d90-7b0f-483d-ba5f-e37463b2f7e3$$,$$DE EM85;370$$,$$DR EM85;370A$$,54.3087,8.927,$$kobr$$,$$kambr$$,NULL,$$comb$$,$$775–875 (Imer 2007)$$,NULL,$$Kam$$,$$Ben$$,NULL,$$Sweden$$),
($$a11d9642-cc50-4048-b391-37b4ad700e94$$,$$DE DR415$$,$$DR 415|X BerlinDR415$$,NULL,NULL,$$t·þ·i·m·n·h/<boalin> · a·l·a·s·n·o/<systir> · b·n·h/<min> · <raþ> <þa->$$,$$"Pálín, systir mín, ráð þat!$$,NULL,$$Pálín, my sister, interpret that/this!$$,NULL,$$Inskriften anses numera vara av västnordiskt ursprung.$$,$$Relief$$,$$Elfenben$$,NULL,$$Sweden$$),
($$ccd2faad-15c1-4924-8084-028b8072ee17$$,$$DE StOl3$$,$$X StOl3$$,NULL,NULL,$$faksi$$,$$"Faxi/faxi$$,NULL,$$Faxi/horse$$,$$1050–1100 (arkeologisk datering)$$,$$Fyndår 1980.$$,$$Runben$$,$$Ben$$,NULL,$$Sweden$$)
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
