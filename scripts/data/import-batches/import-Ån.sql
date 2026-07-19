-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap Ån, 2 rader).
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
($$656082f5-a05b-4db8-a238-177bf9948120$$,$$Ån Fv1908;298B$$,$$X ÅnFv1908;298B$$,62.8615,18.0464,$$n-þ$$,$$…$$,NULL,$$…$$,NULL,$$Funnen i jord från backe.$$,$$Skifferbit avi form av kniv$$,$$Skiffer$$,NULL,$$Sweden$$),
($$ebff6f16-fcc4-4f67-b358-2f8e8d9117b1$$,$$Ån Fv1908;298A$$,$$X ÅnFv1908;298A$$,62.8615,18.0464,$$ok-þ$$,$$…$$,NULL,$$…$$,NULL,$$Funnen i jord från backe.$$,$$Skifferbit$$,$$Skiffer$$,NULL,$$Sweden$$)
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
