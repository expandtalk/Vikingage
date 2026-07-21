-- Kyrkligt ledarskap (ecclesiastical_leadership). Ren data, körd via MCP 2026-07-21. Idempotent
-- genom DELETE + re-insert. Ledarskap gäller ETT STIFT (ärkebiskop) el. EN KYRKA (kyrkoherde).
-- Kräver dioceses-seed.sql först. wikipedia_url fylls i separat steg (riktiga URL:er, ej gissade).

DELETE FROM public.ecclesiastical_leadership;

-- Ansgar ("Nordens apostel") + Rimbert → Hamburg-Bremen. Norden låg under detta stift.
INSERT INTO public.ecclesiastical_leadership (diocese_id, person_name, role, from_year, to_year, source) VALUES
 ((SELECT id FROM dioceses WHERE code='hamburg_bremen'),'Ansgar (Nordens apostel)','archbishop',831,865,'Vita Ansgari (Rimbert); signum.se — mission till Birka 829/830'),
 ((SELECT id FROM dioceses WHERE code='hamburg_bremen'),'Rimbert','archbishop',865,888,'Vita Ansgari; Ansgars lärjunge och efterträdare');

-- Ärkebiskopar av Uppsala 1164– (Wikipedia: Ärkebiskopar i Uppsala stift).
INSERT INTO public.ecclesiastical_leadership (diocese_id, person_name, role, from_year, to_year, source)
SELECT (SELECT id FROM dioceses WHERE code='uppsala'), v.person, 'archbishop', v.f, v.t,
       'Wikipedia: Ärkebiskopar i Uppsala stift'
FROM (VALUES
 ('Stephanus',1164,1185),('Johannes',1185,1187),('Petrus',1187,1197),('Olavus Lambatunga',1198,1206),
 ('Valerius',1207,1219),('Olavus Basatömer',1224,1234),('Jarlerius',1236,1255),('Laurentius',1257,1267),
 ('Fulco Johannis',1274,1277),('Jacobus Israelis',1278,1281),('Magnus Boethii',1285,1289),('Johannes (1290)',1290,1291),
 ('Nicolaus Allonis',1295,1305),('Nicolaus Katilli',1308,1314),('Olavus Beronis',1315,1332),('Petrus Philippi',1332,1341),
 ('Hemmingus Nicolai',1342,1351),('Petrus Thyrgilli',1351,1366),('Birgerus Gregorii',1367,1383),('Henricus Karoli',1383,1408),
 ('Johannes Gerechini',1408,1422),('Johannes Haquini',1422,1432),('Olavus Laurentii',1432,1438),('Nicolaus Ragvaldi',1438,1448),
 ('Jöns Bengtsson Oxenstierna',1448,1467),('Jacob Ulvsson',1469,1515),('Gustav Trolle',1515,1521),('Johannes Magnus',1523,1528),
 ('Laurentius Petri Nericius',1531,1573),('Laurentius Petri Gothus',1574,1579),('Andreas Laurentii Björnram',1583,1591),
 ('Abraham Andreae Angermannus',1594,1599),('Nicolaus Olai Bothniensis',1599,1600),('Olaus Martini',1601,1609),
 ('Petrus Kenicius',1609,1636),('Laurentius Paulinus Gothus',1637,1646),('Johannes Canuti Lenaeus',1647,1669),
 ('Laurentius Stigzelius',1670,1676),('Johannes Baazius d.y.',1677,1681),('Olaus Swebilius',1681,1700),
 ('Eric Benzelius',1700,1709),('Haquin Spegel',1711,1714),('Matthias Steuchius',1714,1730),('Johannes Steuchius',1730,1742),
 ('Eric Benzelius d.y.',1742,1743),('Jacob Benzelius',1744,1747),('Henric Benzelius',1747,1758),('Samuel Troilius',1758,1764),
 ('Magnus Beronius',1764,1775),('Carl Fredric Mennander',1775,1786),('Uno von Troil',1786,1803),('Jacob Axelsson Lindblom',1805,1819),
 ('Carl von Rosenstein',1819,1836),('Johan Olof Wallin',1837,1839),('Carl Fredrik af Wingård',1839,1851),('Hans Olof Holmström',1852,1855),
 ('Henrik Reuterdahl',1856,1870),('Anton Niklas Sundberg',1870,1900),('Johan August Ekman',1900,1913),('Nathan Söderblom',1914,1931),
 ('Erling Eidem',1931,1950),('Yngve Brilioth',1950,1958),('Gunnar Hultgren',1958,1967),('Ruben Josefson',1967,1972),
 ('Olof Sundby',1972,1983),('Bertil Werkström',1983,1993),('Gunnar Weman',1993,1997),('KG Hammar',1997,2006),
 ('Anders Wejryd',2006,2014),('Antje Jackelén',2014,2022),('Martin Modéus',2022,NULL)
) AS v(person,f,t);
