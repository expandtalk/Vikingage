-- STEG 3: import av saknade inskrifter ur rundata.sql (landskap Sh, 7 rader).
-- 7 kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
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
('edbb1831-5f74-480f-b67b-6027db1e4093','Sh 7','Br Sh7',60.1492,-1.04732,'…-uko^ktu','…',NULL,'…',NULL,'Funnet 1994 vid utgrävning av medeltida kapell och kyrkogård. Troligen grafitti.','Fragment av gravhäll, oornerad','Sten',NULL,'Sweden'),
('37c8b100-6f0e-4936-8001-d6cc42b3138f','Sh 6','Br Sh6',60.4857,-1.61421,'+ þenna staen --…(n)-(n)(i)o-…','þenna stein …',NULL,'This stone …',NULL,NULL,'Gravsten','Sandsten',NULL,'Sweden'),
('92c799b1-7e2c-4ee0-899b-dccd4e294c6d','Sh 5','Br Sh5',60.4857,-1.61421,'…-- : -(k)ku--…','… …',NULL,'…',NULL,NULL,'Fragment av runsten','Sandsten',NULL,'Sweden'),
('0b11a931-9a4c-4efc-a382-2c007271494e','Sh 3','Br Sh3',60.0341,-1.22461,'§A …þi---- (+) -ftir + foþur (:) sin (:) þurbio-… §B f','§A … [e]ptir fǫður sinn "Þorbjǫ[rn]. §B …',NULL,'§A … in memory of his father Þorbjǫrn. §B …','1000-talet',NULL,'Fragment av gravhäll','Sandsten',NULL,'Sweden'),
('32270a6a-55a5-4d6d-bbcf-24df83af008b','Sh 2','Br Sh2',60.0404,-1.21549,'…-- + --…','… …',NULL,'…','1000-talet',NULL,'Fragment av gravhäll?','Sandsten',NULL,'Sweden'),
('3e1af13b-f647-4880-a80c-e62e53f41bec','Sh 4','Br Sh4',60.0671,-1.33703,'…r : ra(i)s(t)(i) : s… …','"… reisti s[tein] …',NULL,'… raised the stone …','1000-talet',NULL,'Fragment av runsten','Sandsten',NULL,'Sweden'),
('ec93cf1a-05be-4969-833c-70c40942d66c','Sh 1','Br Sh1',60.0404,-1.21549,'… (k)(r)(i)(m)(r) + …','… "Grímr(?) …',NULL,'… Grímr(?) …','1000-talet',NULL,'Fragment av gravhäll?','Sandsten',NULL,'Sweden')
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\s+',' ','g')) = lower(regexp_replace(v.signum,'\s+',' ','g'))
)
on conflict (id) do nothing;
