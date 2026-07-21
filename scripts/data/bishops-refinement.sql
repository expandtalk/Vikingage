-- Förfining av biskopsdata (körd via MCP 2026-07-21, efter more-bishops-seed.sql).
-- Kalmar: daterad lista (superintendenter 1603–1650 + biskopar 1711–1915) ersätter namn-listan.
-- Härnösand: exakta datum för de tre första. + notabla missionsgestalter. Fakta ur Wikipedia.

DELETE FROM public.ecclesiastical_leadership WHERE diocese_id=(SELECT id FROM public.dioceses WHERE code='kalmar');
INSERT INTO public.ecclesiastical_leadership (diocese_id, person_name, role, from_year, to_year, source)
SELECT (SELECT id FROM public.dioceses WHERE code='kalmar'), v.person, 'bishop', v.f, v.t,
       'Wikipedia: Biskopar/superintendenter i Kalmar stift'||coalesce(v.note,'')
FROM (VALUES
 ('Nicolaus Petri',1603,1606,'; superintendent (förste)'),('Johannes Petri Ungius',1607,1617,'; superintendent'),
 ('Jonas Rothovius',1618,1626,'; superintendent'),('Nicolaus Eschilli',1627,1650,'; superintendent'),
 ('Nicolaus Nicolai Braun',NULL,NULL,'; biskop, datering oklar (biskopstitel 1678)'),
 ('Henning Schütte',NULL,1711,'; företrädare till H. Schröder'),('Herman Schröder',1711,1729,NULL),
 ('Carl Fredrik Mennander',1745,1764,'; sedan ärkebiskop i Uppsala'),('Carl Gustaf Schröder',1764,1789,'; ca'),
 ('Martin Georg Wallenstråle',1789,1807,NULL),('Magnus Stagnelius',1807,1829,NULL),
 ('Anders Carlsson af Kullberg',1829,1852,NULL),('Paulus Genberg',1852,1875,NULL),
 ('Pehr Sjöbring',1876,1900,NULL),('Henry Tottie',1900,1915,'; Kalmar uppgick i Växjö 1915'),
 ('Magnus Beronius',NULL,NULL,'; datering oklar'),('N.J.O.H. Lindström',NULL,NULL,'; datering oklar')
) AS v(person,f,t,note);

UPDATE public.ecclesiastical_leadership SET from_year=1647, to_year=1683 WHERE person_name='Steuchius Petrus Erici' AND diocese_id=(SELECT id FROM public.dioceses WHERE code='harnosand');
UPDATE public.ecclesiastical_leadership SET from_year=1683, to_year=1695 WHERE person_name='Steuchius Matthias Petri' AND diocese_id=(SELECT id FROM public.dioceses WHERE code='harnosand');
UPDATE public.ecclesiastical_leadership SET from_year=1695, to_year=1702 WHERE person_name='Micrander Julius Erici' AND diocese_id=(SELECT id FROM public.dioceses WHERE code='harnosand');

INSERT INTO public.ecclesiastical_leadership (diocese_id, person_name, role, from_year, to_year, source) VALUES
 ((SELECT id FROM public.dioceses WHERE code='vaxjo'),'Helige Sigfrid','bishop',1000,1045,'Växjös apostel; döpte enl. tradition Olof Skötkonung i Husaby'),
 ((SELECT id FROM public.dioceses WHERE code='linkoping'),'Hans Brask','bishop',1513,1527,'siste katolske biskopen i Linköping'),
 ((SELECT id FROM public.dioceses WHERE code='vaxjo'),'Nicolaus Canuti','bishop',1553,1567,'ordinarie/biskop i Växjö; utvidgade stiftet'),
 ((SELECT id FROM public.dioceses WHERE code='hamburg_bremen'),'Gautbert','bishop',836,845,'ledde kristna församlingen i Birka (Ebo av Reims mission)'),
 ((SELECT id FROM public.dioceses WHERE code='hamburg_bremen'),'Ebo av Reims','bishop',822,851,'påvlig legat i Norden 822; Ansgars mentor');
