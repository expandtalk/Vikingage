-- Manuella kyrktillägg med användarstyrd, verifierad koordinat (ej gissad). Körd via MCP.
-- Mönster enligt [[never-fabricate-coordinates]]: manuellt tillägg endast med citerad källa.

-- S:ta Britas kapell, Kapelludden/Sikavarp, Bredsättra sn, Öland (Runstens härad).
-- Koord ur Wikipedia (56°49′9.58″N 16°50′26.87″Ö -> 56.81933, 16.84080). Källa: Boström 2011,
-- Sveriges Kyrkor vol. 233; RAÄ Fornsök (Bredsättra 90). Köpmankapell, ca 1200-tal, övergivet ~1550.
INSERT INTO public.ecclesiastical_sites
  (name, kind, lat, lng, landscape, parish, built_from, dating_class, dissolved_year, status,
   diocese_id, source, license, historical_notes)
SELECT 'S:ta Britas kapell','chapel',56.81933,16.84080,'Öland','Bredsättra',1200,'ca 1200-tal',1550,'ruin',
  (select id from dioceses where code='linkoping'),
  'Wikipedia (Boström 2011, Sveriges Kyrkor vol. 233) + RAÄ Fornsök (Bredsättra 90)','koord verifierad (Wikipedia)',
  'Köpmankapell vid medeltida handelsplatsen Sikavarp/Kapelludden, Bredsättra sn. Byggt tidigt/mitten 1200-tal, övergavs senast mitten 1500-tal. Ett av Ölands största medeltida kapell (kalkstensmurat kor+sakristia+långhus). Intill finns brunn och ett 3,3 m högt medeltida stenkors. Källa: Wikipedia/Boström 2011.'
WHERE NOT EXISTS (select 1 from public.ecclesiastical_sites where name='S:ta Britas kapell');

-- Koppla socken + härad (Bredsättra -> Runstens härad).
UPDATE public.ecclesiastical_sites e SET parish_id = p.id
FROM public.parishes p
WHERE e.name='S:ta Britas kapell' AND e.parish_id IS NULL
  AND p.parish_type='socken' AND p.country='Sweden' AND lower(p.name)='bredsättra';
UPDATE public.ecclesiastical_sites e SET hundred_id = h.id
FROM public.parishes p JOIN public.hundreds h ON h.external_id = p.hundred_external_id
WHERE e.name='S:ta Britas kapell' AND e.parish_id = p.id AND e.hundred_id IS NULL;
