-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap NL, 3 rader).
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
('c18441d0-805f-49a8-8ae3-60ca9a7e7636','NL ABÄG1984;76','L 1893|X NlABÄG1984;76',52.0905,5.12323,'§A þuyh §B (s)uærri §C ?','§A … §B "Sverri(?) §C …',NULL,'§A … §B Sverrir(?) §C …','1100-talet?','I Utrecht Mariakyrkas skattkamare före 1524.','Valrosstand','Valrosstand',NULL,'Sweden'),
('3a09f63f-2668-4cdb-bb4f-584338d37084','NL Aarb1987;194','X NlAarb1987;194|DR Aarb1987;194',NULL,NULL,'agerot(r)(a) : mosel- ¶ mahtelt ok pætær r--','… "Mosel(?) "Mekthild(?) ok "Pætær …',NULL,'… Mosel(?) Mekthildr(?) and Pétr …','1100–1200-talet',NULL,'Spelbricka','Valrosstand',NULL,'Sweden'),
('3388c8ce-5f3a-4fc3-941a-f73140c52504','NL NOR1987;16','X NlNOR1987;16',NULL,NULL,'ænua^rs','"Ærnwars(?)/"Ærnwarðs(?)',NULL,'Ernvarr''s(?)/Ernvarðr''s(?)',NULL,NULL,'Nyckel','Järn',NULL,'Sweden')
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
