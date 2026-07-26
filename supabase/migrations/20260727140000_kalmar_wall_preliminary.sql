-- Kalmar gamla stads stadsmur — PRELIMINÄR rekonstruktion (första steget).
-- INTEGRITET: detta är INTE georefererad precision. Geometrin är approximerad från
-- dokumenterade, ännu bevarade landmärken i Gamla stan (Skansgatan, kyrkogården, gatunät,
-- slottet) + portlägen ur Arkeologernas beskrivning. Därför evidence='rekonstruerad' med
-- STORA pos_accuracy_m (halo-band visar osäkerheten ärligt). Den ~70 m bevarade muren S om
-- Skansgatan är 'dokumenterad' (mindre halo). Ersätts segment för segment av QGIS-georefererad
-- geometri. Datering: stadsmuren påbörjad första halvan av 1300-talet; nedbruten vid
-- stadsflytten till Kvarnholmen 1640-1660-tal (utdragen materialåtervinning → vid end-spann).
-- Koordinater är WGS84 (lng lat) och transformeras till lagringens EPSG:3006.

-- 1) Stadsmurens ungefärliga sträckning (kurtin, hela kretsen).
INSERT INTO public.fort_element (site, element_type, name, start_earliest, start_latest,
  end_earliest, end_latest, evidence, pos_accuracy_m, published, geom)
SELECT 'Kalmar gamla stad','kurtin','Stadsmurens ungefärliga sträckning (preliminär rekonstruktion)',
  1300,1350,1647,1690,'rekonstruerad',60,true,
  public.ST_Transform(public.ST_GeomFromText(
    'LINESTRING(16.3550 56.6583,16.3556 56.6598,16.3520 56.6609,16.3495 56.6606,16.3488 56.6598,16.3495 56.6587,16.3515 56.6585,16.3545 56.6582,16.3550 56.6583)'
  ,4326),3006)
WHERE NOT EXISTS (SELECT 1 FROM public.fort_element WHERE site='Kalmar gamla stad' AND element_type='kurtin' AND name LIKE 'Stadsmurens ungefärliga%');

-- 2) Bevarat ~70 m muravsnitt S om Skansgatan (fysiskt bevarat → dokumenterad, liten halo).
INSERT INTO public.fort_element (site, element_type, name, start_earliest, start_latest,
  end_earliest, end_latest, evidence, pos_accuracy_m, published, geom)
SELECT 'Kalmar gamla stad','kurtin','Bevarat muravsnitt S om Skansgatan (~70 m, rund torngrund i väster)',
  1300,1350,1647,1690,'dokumenterad',15,true,
  public.ST_Transform(public.ST_GeomFromText(
    'LINESTRING(16.3512 56.6586,16.3495 56.6586)'
  ,4326),3006)
WHERE NOT EXISTS (SELECT 1 FROM public.fort_element WHERE site='Kalmar gamla stad' AND name LIKE 'Bevarat muravsnitt%');

-- 3) Tre landportar + sjöporten (punkter, rekonstruerade lägen ur beskrivningen).
INSERT INTO public.fort_element (site, element_type, name, start_earliest, start_latest,
  end_earliest, end_latest, evidence, pos_accuracy_m, published, geom)
SELECT 'Kalmar gamla stad','port',v.n,1300,1350,1647,1690,'rekonstruerad',30,true,
  public.ST_Transform(public.ST_SetSRID(public.ST_MakePoint(v.lng,v.lat),4326),3006)
FROM (VALUES
  ('Norreport (mellan Västerlånggatan och Molinsgatan)', 16.3520::float8, 56.6609::float8),
  ('Västerport (vid Krusenstiernska gården)',            16.3488,        56.6598),
  ('Söderport (vid Mosaiska kyrkogården)',               16.3515,        56.6585),
  ('Stadsbroporten/Sjöbroporten (mot hamnen)',           16.3556,        56.6598)
) AS v(n,lng,lat)
WHERE NOT EXISTS (SELECT 1 FROM public.fort_element WHERE site='Kalmar gamla stad' AND element_type='port' AND name=v.n);

-- Källkopplingar (Arkeologerna-beskrivningen + Pahr 1585 för sträckningen).
INSERT INTO public.fort_element_source (element_id, source_id, note)
SELECT e.id, s.id, 'Sträckning/portlägen tolkade ur beskrivning + gatunät'
FROM public.fort_element e JOIN public.fort_source s ON s.citation ILIKE 'Det medeltida Kalmar%'
WHERE e.site='Kalmar gamla stad'
ON CONFLICT DO NOTHING;

INSERT INTO public.fort_element_source (element_id, source_id, note)
SELECT e.id, s.id, 'Jfr Pahrs karta 1585'
FROM public.fort_element e JOIN public.fort_source s ON s.citation ILIKE 'Dominicus Pahrs%'
WHERE e.site='Kalmar gamla stad' AND e.element_type='kurtin' AND e.name LIKE 'Stadsmurens ungefärliga%'
ON CONFLICT DO NOTHING;
