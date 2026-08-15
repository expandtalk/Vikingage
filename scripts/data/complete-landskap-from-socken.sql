-- Komplettera de 4 landskap som saknade OSM-geometri (Dalarna, Halland, Härjedalen, Lappland)
-- genom att UNIONERA Lantmäteri-socken-polygoner (admin_boundaries level='socken').
--
-- METOD (rigorös, ur egen data):
--  Geoklassificering: en socken tillhör ett av de 21 OSM-landskapen om dess centroid ligger inuti.
--  De 160 "orphans" (utanför alla 21) klustrar per län: Halland 90, Dalarna 48, Lappland (Norr+Väster-
--  botten) 16. Härjedalen absorberas i Jämtland-polygonen → tas i stället via sina 9 socken-namn i
--  Jämtlands län. Kant-artefakter (Gotland/Örebro/Gävleborg/VG) exkluderas genom län-filtret.
-- Källa: härledd union av Lantmäteri "Socken och stad" (© Lantmäteriet). Idempotent (upsert på code).

-- Halland = orphan-socknar i Hallands län
INSERT INTO public.admin_boundaries (level, code, name, year, geom, centroid, source)
SELECT 'landskap','Q626045','Halland',NULL, m.mp, ST_PointOnSurface(m.mp),
       'Härledd: union av Lantmäteri-socknar i Hallands län (© Lantmäteriet)'
FROM (SELECT ST_Multi(ST_CollectionExtract(ST_Union(ST_MakeValid(s.geom)),3))::geometry(MultiPolygon,4326) mp
      FROM admin_boundaries s
      JOIN admin_boundaries lan ON lan.level='lan' AND lan.name='Halland' AND ST_Contains(lan.geom, s.centroid)
      WHERE s.level='socken'
        AND NOT EXISTS (SELECT 1 FROM admin_boundaries l WHERE l.level='landskap' AND ST_Contains(l.geom, s.centroid))) m
ON CONFLICT (level, coalesce(code,''), coalesce(year,0))
DO UPDATE SET name=EXCLUDED.name, geom=EXCLUDED.geom, centroid=EXCLUDED.centroid, source=EXCLUDED.source, updated_at=now();

-- Dalarna = orphan-socknar i Dalarnas län
INSERT INTO public.admin_boundaries (level, code, name, year, geom, centroid, source)
SELECT 'landskap','Q205218','Dalarna',NULL, m.mp, ST_PointOnSurface(m.mp),
       'Härledd: union av Lantmäteri-socknar i Dalarnas län (© Lantmäteriet)'
FROM (SELECT ST_Multi(ST_CollectionExtract(ST_Union(ST_MakeValid(s.geom)),3))::geometry(MultiPolygon,4326) mp
      FROM admin_boundaries s
      JOIN admin_boundaries lan ON lan.level='lan' AND lan.name='Dalarna' AND ST_Contains(lan.geom, s.centroid)
      WHERE s.level='socken'
        AND NOT EXISTS (SELECT 1 FROM admin_boundaries l WHERE l.level='landskap' AND ST_Contains(l.geom, s.centroid))) m
ON CONFLICT (level, coalesce(code,''), coalesce(year,0))
DO UPDATE SET name=EXCLUDED.name, geom=EXCLUDED.geom, centroid=EXCLUDED.centroid, source=EXCLUDED.source, updated_at=now();

-- Lappland = orphan-socknar i Norrbottens + Västerbottens län
INSERT INTO public.admin_boundaries (level, code, name, year, geom, centroid, source)
SELECT 'landskap','Q212640','Lappland',NULL, m.mp, ST_PointOnSurface(m.mp),
       'Härledd: union av Lantmäteri-socknar i Norr-/Västerbottens län (© Lantmäteriet)'
FROM (SELECT ST_Multi(ST_CollectionExtract(ST_Union(ST_MakeValid(s.geom)),3))::geometry(MultiPolygon,4326) mp
      FROM admin_boundaries s
      JOIN admin_boundaries lan ON lan.level='lan' AND lan.name IN ('Norrbotten','Västerbotten') AND ST_Contains(lan.geom, s.centroid)
      WHERE s.level='socken'
        AND NOT EXISTS (SELECT 1 FROM admin_boundaries l WHERE l.level='landskap' AND ST_Contains(l.geom, s.centroid))) m
ON CONFLICT (level, coalesce(code,''), coalesce(year,0))
DO UPDATE SET name=EXCLUDED.name, geom=EXCLUDED.geom, centroid=EXCLUDED.centroid, source=EXCLUDED.source, updated_at=now();

-- Härjedalen = de 9 belagda socknarna (Wikipedia) i Jämtlands län
INSERT INTO public.admin_boundaries (level, code, name, year, geom, centroid, source)
SELECT 'landskap','Q207444','Härjedalen',NULL, m.mp, ST_PointOnSurface(m.mp),
       'Härledd: union av Lantmäteri-socknar (Härjedalens 9 socknar, Jämtlands län) (© Lantmäteriet)'
FROM (SELECT ST_Multi(ST_CollectionExtract(ST_Union(ST_MakeValid(s.geom)),3))::geometry(MultiPolygon,4326) mp
      FROM admin_boundaries s
      JOIN admin_boundaries lan ON lan.level='lan' AND lan.name='Jämtland' AND ST_Contains(lan.geom, s.centroid)
      WHERE s.level='socken'
        AND s.name IN ('Hede','Storsjö','Tännäs','Vemdalen','Lillhärdal','Linsell','Sveg','Älvros','Överhogdal')) m
ON CONFLICT (level, coalesce(code,''), coalesce(year,0))
DO UPDATE SET name=EXCLUDED.name, geom=EXCLUDED.geom, centroid=EXCLUDED.centroid, source=EXCLUDED.source, updated_at=now();
