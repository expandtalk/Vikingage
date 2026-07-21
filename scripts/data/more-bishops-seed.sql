-- Fler biskopslängder -> ecclesiastical_leadership. Körd via MCP 2026-07-21. Fakta ur Wikipedia.
-- Hamburg-Bremen (mission), Kalmar (kategori, utan år), Uppsala hjälpbiskopar, Lund (fullt daterad).

-- Hamburg-Bremen: Nordens missionsärkebiskopar (ersätter Ansgar/Rimbert-piloten).
DELETE FROM public.ecclesiastical_leadership WHERE diocese_id=(SELECT id FROM public.dioceses WHERE code='hamburg_bremen');
INSERT INTO public.ecclesiastical_leadership (diocese_id, person_name, role, from_year, to_year, source)
SELECT (SELECT id FROM public.dioceses WHERE code='hamburg_bremen'), v.person, 'archbishop', v.f, v.t,
       'Wikipedia: Ärkebiskopar av Hamburg-Bremen (Nordens mission)'||coalesce(v.note,'')
FROM (VALUES
 ('Ansgar (Nordens apostel)',831,865,'; Birka 829/830'),('Rimbert',865,888,'; Nordens andre apostel'),
 ('Adalgar',888,909,NULL),('Hoger',909,916,NULL),('Reginwart',917,918,NULL),
 ('Unni',918,936,'; död i Birka 936'),('Adaldag',936,988,NULL),('Libentius',988,1013,NULL),
 ('Unwan',1013,1029,NULL),('Libentius II',1029,1032,NULL),('Hermann',1032,1035,NULL),
 ('Adalbrand',1035,1043,NULL),('Adalbert (Patriark av Norden)',1043,1072,NULL),
 ('Liemar',1072,1101,'; Bremen'),('Humbert',1101,1104,'; Bremen')
) AS v(person,f,t,note);

-- Kalmar stift (Wikipedia-kategori, alfabetisk, årtal saknas).
INSERT INTO public.ecclesiastical_leadership (diocese_id, person_name, role, from_year, to_year, source)
SELECT (SELECT id FROM public.dioceses WHERE code='kalmar'), v.person, 'bishop', NULL, NULL,
       'Wikipedia: Biskopar i Kalmar stift (kategori); årtal ej i källan'
FROM (VALUES ('Magnus Beronius'),('Nicolaus Nicolai Braun'),('Paulus Genberg'),('Anders Carlsson af Kullberg'),
 ('N.J.O.H. Lindström'),('Carl Gustaf Schröder'),('Herman Schröder'),('Henning Schütte'),
 ('Pehr Sjöbring'),('Magnus Stagnelius'),('Henry Tottie'),('Martin Georg Wallenstråle')) AS v(person);

-- Uppsala hjälpbiskopar (biskop i stiftet fr.o.m. 1990).
INSERT INTO public.ecclesiastical_leadership (diocese_id, person_name, role, from_year, to_year, source)
SELECT (SELECT id FROM public.dioceses WHERE code='uppsala'), v.person, 'bishop', v.f, v.t,
       'Wikipedia: Övriga biskopar i Uppsala stift (fr.o.m. 1990)'
FROM (VALUES ('Tord Harlin',1990,2000),('Ragnar Persenius',2000,2019),('Karin Johannesson',2019,NULL)) AS v(person,f,t);

-- Lunds stift: ärkebiskopar (1103–1536) + biskopar (för/efter). Se ecclesiastical_leadership för fulla raden.
DELETE FROM public.ecclesiastical_leadership WHERE diocese_id=(SELECT id FROM public.dioceses WHERE code='lund');
INSERT INTO public.ecclesiastical_leadership (diocese_id, person_name, role, from_year, to_year, source)
SELECT (SELECT id FROM public.dioceses WHERE code='lund'), v.person, v.role, v.f, v.t,
       'Wikipedia: Ärkebiskopar och biskopar i Lunds stift'||coalesce(v.note,'')
FROM (VALUES
 ('Gotebald','bishop',980,1010,'; ca, före stiftsindelningen'),('Bernhard','bishop',1010,1030,'; ca'),
 ('Henrik','bishop',1060,1065,'; förste i Lund efter avskiljning från Roskilde'),('Egino','bishop',1065,1072,NULL),('Ricwald','bishop',1072,1089,NULL),
 ('Ascer (Asser Svendsen)','archbishop',1089,1137,'; Nordens förste ärkebiskop 1103'),('Eskil','archbishop',1137,1177,NULL),
 ('Absalon Hvide','archbishop',1178,1201,NULL),('Anders Sunesen','archbishop',1201,1228,'; krönte Valdemar Sejr'),
 ('Peder Saxesen','archbishop',1224,1228,NULL),('Uffe Thrugotsen','archbishop',1228,1252,NULL),
 ('Jacob Erlandsen','archbishop',1254,1274,NULL),('Erland Erlandsen','archbishop',1274,1276,NULL),
 ('Trugot Torstensen','archbishop',1276,1280,NULL),('Jens Dros','archbishop',1280,1289,NULL),
 ('Jens Grand','archbishop',1289,1302,NULL),('Isarnus','archbishop',1302,1310,NULL),
 ('Esger Juul','archbishop',1310,1325,NULL),('Karl Eriksen (Galen)','archbishop',1325,1334,NULL),
 ('Peder Jensen (Galen)','archbishop',1334,1355,NULL),('Jacob Kyrning (Thott)','archbishop',1355,1361,NULL),
 ('Niels Jensen (Bild)','archbishop',1361,1379,NULL),('Magnus Nielsen','archbishop',1379,1390,NULL),
 ('Peder Jensen','archbishop',1390,1391,NULL),('Jacob Gertsen (Ulfstand)','archbishop',1392,1410,'; krönte Erik av Pommern'),
 ('Peder Mickelsen Kruse','archbishop',1410,1418,NULL),('Peder Lykke (Bille)','archbishop',1418,1436,NULL),
 ('Hans Laxmand','archbishop',1436,1443,NULL),('Tuve Nielsen (Juul)','archbishop',1443,1472,NULL),
 ('Jens Brostrup','archbishop',1472,1497,NULL),('Birger Gunnersen','archbishop',1497,1519,'; siste vigde ärkebiskopen i Lund'),
 ('Jørgen Skodborg','archbishop',1520,1523,NULL),('Didrik Slagheck','archbishop',1521,1522,'; avrättad'),
 ('Johan Weze','archbishop',1522,1523,NULL),('Aage Jepsen Sparre','archbishop',1526,1532,'; skenbiskop'),
 ('Torben Bille','archbishop',1532,1536,'; avsatt vid reformationen'),
 ('Frans Vormordsen','bishop',1537,1551,'; förste superintendent efter reformationen'),('Niels Palladius','bishop',1551,1560,NULL),
 ('Tyge Asmundsen','bishop',1560,1577,NULL),('Niels Hvid','bishop',1578,1589,NULL),('Mogens Madsen','bishop',1589,1611,NULL),
 ('Poul Aastrup','bishop',1611,1619,NULL),('Mads Jensen Medelfar','bishop',1620,1637,NULL),
 ('Peder Winstrup','bishop',1638,1679,'; biskop då Skåne blev svenskt 1658'),('Canutus Hahn','bishop',1680,1687,NULL),
 ('Enevald Svenonius','bishop',1687,1688,'; electus'),('Christian Papke','bishop',1688,1694,NULL),
 ('Mattias Steuchius','bishop',1694,1714,NULL),('Jonas Petri Linnerius','bishop',1715,1734,NULL),
 ('Andreas Rydelius','bishop',1734,1738,NULL),('Carl Papke','bishop',1738,1740,NULL),
 ('Henric Benzelius','bishop',1740,1747,NULL),('Johan Engeström','bishop',1748,1777,NULL),
 ('Olof Celsius d.y.','bishop',1777,1794,NULL),('Petrus Munck','bishop',1794,1803,NULL),
 ('Nils Hesslén','bishop',1803,1811,NULL),('Wilhelm Faxe','bishop',1811,1854,NULL),
 ('Henrik Reuterdahl','bishop',1854,1856,NULL),('Johan Henrik Thomander','bishop',1856,1865,NULL),
 ('Wilhelm Flensburg','bishop',1865,1897,NULL),('Gottfrid Billing','bishop',1898,1925,NULL),
 ('Edvard Magnus Rodhe','bishop',1925,1948,NULL),('Anders Nygren','bishop',1949,1958,NULL),
 ('Nils Bolander','bishop',1958,1959,NULL),('Martin Lindström','bishop',1960,1970,NULL),
 ('Olle Nivenius','bishop',1970,1980,NULL),('Per-Olof Ahrén','bishop',1980,1992,NULL),
 ('K.G. Hammar','bishop',1992,1997,NULL),('Christina Odenberg','bishop',1997,2007,'; första kvinnliga biskopen i Sverige'),
 ('Antje Jackelén','bishop',2007,2014,NULL),('Johan Tyrberg','bishop',2014,NULL,NULL)
) AS v(person,role,f,t,note);
