-- Regentlängden komplett till nutid: DB:n stannade vid Gustav Vasa (1523).
-- Lägger in de 22 saknade svenska regenterna Erik XIV → Carl XVI Gustaf, samt de
-- moderna ätterna (Pfalziska/Holstein-Gottorpska/Bernadotte; Vasaätten fanns).
-- Källa: Sveriges regentlängd (Lagerqvist, Sveriges regenter).

-- 1) Moderna ätter (idempotent på namn).
INSERT INTO public.royal_dynasties (name, name_en, description, period_start, period_end, region)
SELECT * FROM (VALUES
  ('Pfalziska ätten', 'House of Palatinate-Zweibrücken', 'Regerade Sverige 1654–1720 (Karl X Gustav till Karl XII och Ulrika Eleonora d.y.).', 1654, 1720, 'Sweden'),
  ('Holstein-Gottorpska ätten', 'House of Holstein-Gottorp', 'Regerade Sverige 1751–1818 (Adolf Fredrik till Karl XIII).', 1751, 1818, 'Sweden'),
  ('Bernadotteätten', 'House of Bernadotte', 'Regerar Sverige från 1818 (Karl XIV Johan, tidigare fransk marskalk Jean Baptiste Bernadotte).', 1818, NULL, 'Sweden')
) AS d(name, name_en, description, period_start, period_end, region)
WHERE NOT EXISTS (SELECT 1 FROM public.royal_dynasties x WHERE x.name = d.name);

-- 2) De 22 saknade regenterna, länkade till rätt ätt (Fredrik I = Hessen, ingen listad ätt → dynasty NULL).
INSERT INTO public.historical_kings
  (name, dynasty_id, reign_start, reign_end, region, gender, role, status, description)
SELECT v.name,
       (SELECT id FROM public.royal_dynasties dy WHERE dy.name = v.dyn LIMIT 1),
       v.rs, v.re, 'Sweden', v.gender, v.role, 'historical', v.descr
FROM (VALUES
  ('Erik XIV',        'Vasaätten',                 1560, 1568, 'male',   'King',  'Gustav Vasas äldste son; avsattes 1568 efter sinnessjukdom och Sturemorden.'),
  ('Johan III',       'Vasaätten',                 1568, 1592, 'male',   'King',  'Bror till Erik XIV; katolskt närmande (röda boken), gift med Katarina Jagellonica.'),
  ('Sigismund',       'Vasaätten',                 1592, 1599, 'male',   'King',  'Även kung av Polen; katolik, avsattes i Sverige av farbrodern hertig Karl.'),
  ('Karl IX',         'Vasaätten',                 1599, 1611, 'male',   'King',  'Yngste son till Gustav Vasa; kung 1604 (de facto från 1599).'),
  ('Gustav II Adolf', 'Vasaätten',                 1611, 1632, 'male',   'King',  'Stormaktstidens grundare; stupade vid Lützen 1632 under trettioåriga kriget.'),
  ('Kristina',        'Vasaätten',                 1632, 1654, 'female', 'Queen', 'Abdikerade 1654, konverterade till katolicismen; Vasaättens siste regent.'),
  ('Karl X Gustav',   'Pfalziska ätten',           1654, 1660, 'male',   'King',  'Kristinas kusin; tåget över Bält, freden i Roskilde 1658 (Skåne m.m.).'),
  ('Karl XI',         'Pfalziska ätten',           1660, 1697, 'male',   'King',  'Genomförde det karolinska enväldet och reduktionen.'),
  ('Karl XII',        'Pfalziska ätten',           1697, 1718, 'male',   'King',  'Stora nordiska kriget; stupade vid Fredriksten 1718 — stormaktstidens slut.'),
  ('Ulrika Eleonora den yngre', 'Pfalziska ätten', 1719, 1720, 'female', 'Queen', 'Karl XII:s syster; abdikerade 1720 till förmån för maken Fredrik I.'),
  ('Fredrik I',       NULL,                        1720, 1751, 'male',   'King',  'Av Hessen; gift med Ulrika Eleonora. Frihetstidens inledning.'),
  ('Adolf Fredrik',   'Holstein-Gottorpska ätten', 1751, 1771, 'male',   'King',  'Frihetstiden; begränsad kungamakt under ständerväldet.'),
  ('Gustav III',      'Holstein-Gottorpska ätten', 1771, 1792, 'male',   'King',  'Statskuppen 1772; upplyst envälde; mördad på Operan 1792.'),
  ('Gustav IV Adolf', 'Holstein-Gottorpska ätten', 1792, 1809, 'male',   'King',  'Avsattes 1809 efter förlusten av Finland.'),
  ('Karl XIII',       'Holstein-Gottorpska ätten', 1809, 1818, 'male',   'King',  '1809 års regeringsform; barnlös, adopterade Karl Johan Bernadotte.'),
  ('Karl XIV Johan',  'Bernadotteätten',           1818, 1844, 'male',   'King',  'Fransk marskalk (Jean Baptiste Bernadotte), vald till tronföljare 1810.'),
  ('Oscar I',         'Bernadotteätten',           1844, 1859, 'male',   'King',  'Reformkung; skandinavism.'),
  ('Karl XV',         'Bernadotteätten',           1859, 1872, 'male',   'King',  'Representationsreformen 1866.'),
  ('Oscar II',        'Bernadotteätten',           1872, 1907, 'male',   'King',  'Unionsupplösningen med Norge 1905.'),
  ('Gustaf V',        'Bernadotteätten',           1907, 1950, 'male',   'King',  'Borggårdskrisen 1914; Sveriges längst regerande monark.'),
  ('Gustaf VI Adolf', 'Bernadotteätten',           1950, 1973, 'male',   'King',  'Arkeolog-kung; folkkär.'),
  ('Carl XVI Gustaf', 'Bernadotteätten',           1973, NULL, 'male',   'King',  'Regerande statschef; 1974 års regeringsform (representativ roll).')
) AS v(name, dyn, rs, re, gender, role, descr)
WHERE NOT EXISTS (SELECT 1 FROM public.historical_kings hk WHERE hk.name = v.name AND hk.region ILIKE 'Sweden');
