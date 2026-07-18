-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap UA, 2 rader).
-- 2 kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
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
('acddcee2-16b4-4ea8-868d-5307a6e44266','UA Fridell2004;15','X UaFridell2004;15',49.0919,25.4059,'§A si{X}riþ §B f f','§A "Sigríðr §B … …',NULL,'§A Sigríðr §B …','1115–1130','Funnen 1990. Tecknet X återger ett kyrilliskt X.','Sländtrissa','Skiffer',NULL,'Sweden'),
('82a1d2f4-438c-40a9-bcec-ade91bde6a88','UA Fv1914;47','X UaFv1914;47',46.5594,30.4301,'krani : kerþi : (h)alf : þisi : iftir : kal : fi:laka : si(n)','"Grani gerði hvalf þessa eptir "Karl/"Kál, félaga sinn.',NULL,'Grani made this vault in memory of Karl/Káll, his partner.',NULL,'Angående tolkningen ''Kall'' se även NRL art. Karl.','Gavelsten i gravkista','Kalksten',NULL,'Sweden')
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
