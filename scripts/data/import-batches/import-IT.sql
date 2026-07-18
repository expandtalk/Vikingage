-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap IT, 1 rader).
-- 1 kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
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
($$d9503bbd-2904-49c3-9995-c220b9f7753c$$,$$IT UOÅ1979;229$$,$$X ItUOÅ1979;229$$,43.7687,11.2568,$$andres ¶ gerdi mik$$,$$"Andrés gerði mik$$,NULL,$$Andrés made me$$,$$Slutet av 1200-talet (konsthistorisk datering)$$,$$Av västnordisk proveniens. Kallas också "Gånge-Rolfs Drikkehorn". Inlämnad till museet i F. från Sainte Chapelle i Paris.$$,$$Ornerat dryckeshorn$$,$$Valrosstand$$,NULL,$$Sweden$$)
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
