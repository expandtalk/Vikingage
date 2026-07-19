-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap Hr, 5 rader).
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
($$ac9d85d1-5dba-4e00-a86e-f7c731eb8433$$,$$Hr Peterson2006;157$$,$$X HrPipping1924;462|X HrPeterson2006;157$$,62.277,14.8048,$$-- × (k)uþbu$$,$$… guðbú$$,NULL,$$… the gods' dwelling.$$,NULL,$$Inskriften är vävd upp och ner.$$,$$Bonad$$,$$Övrigt$$,NULL,$$Sweden$$),
($$f7f74d02-9cda-4800-be88-a28e8a8a3ca5$$,$$Hr Rv201$$,NULL,NULL,NULL,$$dena ÷ skålen ÷ är ÷ giord ÷ ili÷s÷kåölär÷dalen oc ÷ öfra ÷ buden ÷ anno 1729$$,NULL,$$Denna skål är gjord i Lissköl i Ärdalen (dvs. Lillhärdal) och i övre boden (där) anno 1729.$$,NULL,$$1729$$,$$Det finns ytterst svaga spår av fler runor, som troligen återger samma text som i början av inskriften.$$,$$Skål$$,$$Björk$$,NULL,$$Sweden$$),
($$b6bc6a2f-3ac6-498c-aa80-09e0dcb3210f$$,$$Hr Rv221$$,NULL,NULL,NULL,$$uer . og . en . sir . fost . å[n] . ¶ ed . han . har . siofue . gart . feld ¶ han . strafuer . ed . ig . har . gat$$,NULL,$$Var och en ser först på det han har själv gjort, innan han klandrar det jag har gjort.$$,NULL,$$1600-talets förra hälft$$,NULL,$$Stol$$,$$Björk och furu$$,NULL,$$Sweden$$),
($$6116909f-def5-4384-96a4-ececad07b094$$,$$Hr Rv186$$,NULL,NULL,NULL,$$EES (bomärke) 1759 ¶ eiär ⁝ yful$$,NULL,$$EES (bomärke) 1759 äger hyveln.$$,NULL,$$1759$$,NULL,$$Härvskaftshyvel$$,$$Trä$$,NULL,$$Sweden$$),
($$c0153ade-8287-4187-bdc8-b4e9be6d5f0f$$,$$Hr Rv211$$,NULL,NULL,NULL,$$§A (bomärke) §B dena : skålen : afuer : iag : giort : vid : roten:siögarea$$,NULL,$$§A (bomärke) §B Denna skålen har jag gjort vid Rotensjöarna.$$,NULL,$$1700 +/- 15 år$$,NULL,$$Skål$$,$$Björk$$,NULL,$$Sweden$$)
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
