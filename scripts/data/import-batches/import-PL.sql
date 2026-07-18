-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap PL, 3 rader).
-- 3 kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
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
('2e5c38ec-aabc-4a5a-a054-4c6153b291a8','PL MLUHM1962-63;326','X PomMLUHM1962-63;326',53.967,14.7713,'§A fuþ §B kur','§A <fuþ[ork]>/fuð §B "Kúrr(?)',NULL,'§A <fuþork>/pussy §B Kúrr(?)','1030–1050 (arkeologisk datering)',NULL,'Runben','Ben',NULL,'Sweden'),
('59a7f7b6-e101-46b8-867a-8ec2a88aba72','PL NOR2003;19','X PomNOR2003;19|X PomChudziak2003;123',53.3194,18.398,'(i)on a taf(l)','"Ion a tafl.',NULL,'John owns the gamepiece/game.','1000–1050','Fyndår 2002, o-runa med dubbelsidiga bistavar, ensidig t-runa.','Spelbricka','Horn',NULL,'Sweden'),
('e6730dc3-58ae-46a8-b546-6cedddeab9ac','PL VK;296','X PomVK;296',53.8415,14.6165,'????????????','…',NULL,'…','Början av 1000-talet','Runliknande tecken eller ornamentik.','Pinne','Idegran',NULL,'Sweden')
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
