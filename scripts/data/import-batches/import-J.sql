-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap J, 4 rader).
-- 4 kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
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
('e8deee64-b90c-4b4b-92b6-832e10603303','J RS1928;66','B 1112|L 1085',63.1834,14.6187,'austmoþ[(r)] kuþfastaʀ sun '' lit ra(i)[(s)]… …(-)[(n)] (þ)(i)no auk| |kirua bru þisa| |auk h[on] [li](t) kristno eo(t)alont (o)sbiurn kirþi bru (t)riun rai(s)t auk (t)sain runoʀ þisaʀ','"Austmaðr, "Guðfastaʀ sunn, let ræis[a stæi]n þenna ok gærva bro þessa ok hann let kristna "Iamtaland. "Asbiorn gærði bro, "Trionn ræist ok "Stæinn runaʀ þessaʀ.',NULL,'Austmaðr, Guðfastr''s son had this stone raised and this bridge made and he had Jamtaland Christianized. Ásbjǫrn made the bridge, Trjónn and Steinn carved these runes.',NULL,'Gjord av runristare från Svealand.','Runsten','Sten','Jämtland','Sweden'),
('c8d291d5-37d2-47fb-8b1a-13663a380c70','J Fv1959;99','J JLM',62.9218,14.5046,'fuþarkhnis-mlʀ','<fuþorkhni[a]s[tb]mlʀ>',NULL,'<fuþorkhniastbmlʀ>',NULL,NULL,'Putsinskrift','Kalkputs','Jämtland','Sweden'),
('7d9de5cd-4551-40e0-b456-38def7d2548a','J Fv1988;244',NULL,NULL,NULL,'sþt^o-umʀt^uk','…',NULL,'…','800–1100','pilspetsen är från stenålder el. tidig bronsålder.','Pilspets','Skiffer','Jämtland','Sweden'),
('37ab8386-6852-4b11-830a-479d2e6efcaf','J Fv1970;86',NULL,63.0785,14.875,'+ pahs portanti ⁓ salus abænt(i) ⁓ ingiua^(l)tr','Pax portanti, salus habenti. "Ingivaldr.',NULL,'Peace to the wearer, prosperity to the owner. Ingivaldr.',NULL,NULL,'Sländtrissa','Täljsten','Jämtland','Sweden')
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
