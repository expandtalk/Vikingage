-- Fornvännens redaktörer 1906–2018 som forskare/källor (research_scholars) — proveniens.
-- Plattformen citerar Fornvännen genomgående (Wildte 1926, Stenberger m.fl.); redaktörerna = auktoritativa källor.
INSERT INTO research_scholars (name, affiliation, role_title, active_period, life_status, biography, external_ref, source)
SELECT v.name, 'Fornvännen (Kungl. Vitterhets Historie och Antikvitets Akademien)', 'Redaktör, Fornvännen',
       v.period, v.life, v.bio, v.ext, 'Fornvännens redaktionshistoria; sv.wikipedia'
FROM (VALUES
 ('Emil Eckhoff','1906–1923','1846–1923','Per Emil Cornelius Eckhoff (före 1919 Ekhoff), 1846–1923, svensk arkeolog. Studerade geologi i Uppsala. Amanuens Vitterhetsakademien 1880; intendent Livrustkammaren 1883–93; antikvarie 1910–15; redaktör Antikvarisk tidskrift (t.o.m. 1903) och Fornvännen fram till sin död 1923. Motståndare till stilrestaureringar; konserveringsarbeten i Sigtuna och på Gotland; utforskade Visby ringmur de sista 25 åren. Skrifter: Qville härads fornminnen (1881), Tjörns härads fasta fornlämningar (1882), S:t Clemens kyrka i Visby (1912), Svenska stavkyrkor (1914–16), Visby stadsmur (1922).','https://sv.wikipedia.org/wiki/Emil_Eckhoff'),
 ('Sigurd Curman','1925–1946','1879–1966',NULL,NULL),
 ('Mårten Stenberger','1947–1952','1898–1973','Arkeolog; Ölands forntida borgar (1933) — grundkälla för Ölands fornborgar i plattformen.',NULL),
 ('Erik Bohrn','1953–1965',NULL,NULL,NULL),('Ingrid Swartling','1966–1972',NULL,NULL,NULL),
 ('Bo Gräslund','1966–1972',NULL,NULL,NULL),('Åke Hyenstrand','1972–1975',NULL,NULL,NULL),
 ('Lars O Lagerqvist','1972–1975',NULL,NULL,NULL),('Göran Tegnér','1975–2016',NULL,NULL,NULL),
 ('Jan Peder Lamm','1976–2016',NULL,NULL,NULL),('Torgny Säve-Söderberg','1976–1985',NULL,NULL,NULL),
 ('Gustaf Trotzig','1997–2007',NULL,NULL,NULL),('Martin Rundkvist','1999–2018',NULL,NULL,NULL),
 ('Elisabet Regner','2007–2019',NULL,NULL,NULL),('Lars Larsson','2008–2016',NULL,NULL,NULL)
) AS v(name,period,life,bio,ext)
WHERE NOT EXISTS (SELECT 1 FROM research_scholars s WHERE s.name=v.name AND s.role_title='Redaktör, Fornvännen');
