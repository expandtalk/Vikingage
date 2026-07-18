-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap SE, 5 rader).
-- 5 kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
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
('ce06d3a8-a8ae-490f-b56c-7cfab0b6d32c','SE Fv1988;247','X SvFv1988;247',NULL,NULL,'torh','…',NULL,'…',NULL,NULL,'Skafthålsyxa','Mörk grönsten',NULL,'Sweden'),
('34c66ab7-e020-481f-b265-7a1891d595c4','SE Owe1996b;136','X SvOwe1996b:136',NULL,NULL,'… …t ra… …','… [lé]t(?) re[isa](?) …','… lät(?) resa(?) …','… had(?) (the stone) raised(?) …',NULL,NULL,'Fragment av runsten','Sten',NULL,'Sweden'),
('933f4272-64c5-4575-a864-42affe1a306e','SE IK365,7','IK 365,7',NULL,NULL,'ee^lil','ehwe(?)','…','(Dedicated) to the horse (?)',NULL,'Okänd fyndort. Slagen med samma stämpel som SE IK365,1, G 45, G 143, DR IK365,4, G 287, G 89, G IK365,8. Tidigare del av signum: X SvIK365,1,7','Brakteat (C-typ)','Guld',NULL,'Sweden'),
('46bbb0a4-63fe-48cc-b118-a95cb4f44bd1','SE IK365,1','X SvIK365,1,7|IK 365,1',NULL,NULL,'ee^lil','ehwe(?)','…','(Dedicated) to the horse (?)',NULL,'Uppdelad i två signum: SE IK365,1 och SE IK365,7 Okänd fyndort. Slagen med samma stämpel som G 45, G 143, DR IK365,4, G 287, G 89, SE IK365,7, G IK365,8. Tidigare del av signum: X SvIK365,1,7','Brakteat (C-typ)','Guld',NULL,'Sweden'),
('e42a28c4-cb5e-4aeb-8286-d0decb967a7b','SE SHMFid45487',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Fragment av runlös sten','Sten',NULL,'Sweden')
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
