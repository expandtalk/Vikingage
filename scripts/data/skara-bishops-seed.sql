-- Skara stifts biskopslängd (Thurgot ~1014 → Lönnermark 1989–) -> ecclesiastical_leadership.
-- Fakta ur Skara stifts biskopslängd (Hilding Johansson, Skara Historia). Ej prosa. Idempotent.
-- Vaga tidiga år flaggade "ca"; elektus som ej tillträdde flaggade "tillträdde ej".
DELETE FROM public.ecclesiastical_leadership
WHERE role='bishop' AND diocese_id=(SELECT id FROM public.dioceses WHERE code='skara');

INSERT INTO public.ecclesiastical_leadership (diocese_id, person_name, role, from_year, to_year, source)
SELECT (SELECT id FROM public.dioceses WHERE code='skara'), v.person, 'bishop', v.f, v.t,
       'Skara stifts biskopslängd (Hilding Johansson, Skara Historia)'||coalesce(v.note,'')
FROM (VALUES
 ('Thurgot',1014,1030,NULL),('Gotskalk',1030,1030,'; tillträdde ej'),('Sigfrid Junior',1030,1050,NULL),
 ('Osmund',1050,1059,NULL),('Adalvard den äldre',1060,1064,NULL),('Acilinus',1064,1064,'; tillträdde ej'),
 ('Adalvard den yngre',1066,1068,NULL),('Rodulvard',1081,NULL,'; omnämnd 1081'),('Rikulf',1095,NULL,'; ca (1000-talets slut)'),
 ('Hervard',1100,NULL,'; ca'),('Styrbjörn',1110,1130,'; ca, död omkring 1130'),('Ödgrim',1130,1150,'; ca'),
 ('Bengt I den gode',1150,1190,'; ca'),('Järpulf',1190,1200,'; ca'),('Jon Hyrne',1201,1205,'; ca'),
 ('Bernhard',1206,1216,'; ca'),('Bengt II den yngre',1219,1228,NULL),('Stenar',1228,1238,'; trol.'),
 ('Lars I',1240,1257,NULL),('Valdemar',1258,1262,NULL),('Ragvald',1262,1263,NULL),('Ulf',1263,1267,NULL),
 ('Erik I',1267,1278,NULL),('Brynolf I Algotsson',1278,1317,NULL),('Bengt III Johansson',1317,1321,NULL),
 ('Erik II',1321,1322,NULL),('Peder Larsson',1322,1336,NULL),('Gunnar Tynnesson',1337,1340,NULL),
 ('Sigge Jonsson',1340,1352,NULL),('Sigfrid Rotgeri',1352,1354,NULL),('Lars II',1354,1356,NULL),
 ('Nils',1356,1386,NULL),('Rudolf av Mecklenburg',1387,1391,NULL),('Torsten',1391,1404,NULL),
 ('Brynolf II Karlsson',1405,1424,NULL),('Sigge Uddsson',1424,1435,NULL),('Sven Grotte',1436,1449,NULL),
 ('Bengt IV Gustavsson',1449,1460,NULL),('Björn Månsson',1461,1465,'; tillträdde ej'),('Hans Markvardsson',1465,1478,NULL),
 ('Brynolf III Gerlaksson',1478,1505,NULL),('Vincent Henningsson',1505,1520,NULL),('Didrik Slagheck',1520,1521,NULL),
 ('Francesco de Potenza',1523,1523,'; tillträdde ej'),('Magnus Haraldsson',1522,1529,NULL),('Sveno Jacobi',1530,1544,NULL),
 ('Erik Svensson Hjort',1544,1545,NULL),('Erik Falck',1547,1558,NULL),('Erik Pedersson Hwass',1558,1560,NULL),
 ('Erik Nicolai Swart',1561,1570,NULL),('Jacob Johannis',1570,1595,NULL),('Henrik Gadolenus',1593,1593,'; utnämnd ej tillträtt'),
 ('Petrus Kenicius',1595,1609,NULL),('Paulus Pauli',1612,1616,NULL),('Sveno Svenonis',1618,1639,NULL),
 ('Jonas Magni',1640,1651,NULL),('Olof Fristadius',1651,1654,NULL),('Johannes Kempe',1655,1673,NULL),
 ('Johannes Baazius d.y.',1673,1677,NULL),('Andreas Omenius',1677,1684,NULL),('Haquin Spegel',1684,1691,NULL),
 ('Petrus Johannis Rudbecius',1692,1701,NULL),('Jesper Svedberg',1702,1735,NULL),('Petrus Schyllberg',1736,1743,NULL),
 ('Daniel Juslenius',1744,1752,NULL),('Engelbert Halenius',1753,1767,NULL),('Anders Forssenius',1767,1788,NULL),
 ('Thure Weidman',1789,1828,NULL),('Sven Lundblad',1829,1837,NULL),('Johan Albert Butsch',1837,1875,NULL),
 ('Anders Fredrik Beckman',1875,1894,NULL),('Ernst Jakob Keijser',1895,1905,NULL),('Hjalmar Danell',1905,1935,NULL),
 ('Gustav Ljunggren',1935,1950,NULL),('Yngve Rudberg',1951,1955,NULL),('Sven Danell',1955,1969,NULL),
 ('Helge Brattgård',1969,1985,NULL),('Karl-Gunnar Grape',1985,1988,NULL),('Lars-Göran Lönnermark',1989,NULL,NULL)
) AS v(person,f,t,note);
