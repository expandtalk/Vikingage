-- Härnösands stifts biskopslängd (1647–2024) -> ecclesiastical_leadership. Körd via MCP.
-- Källa: Härnösands stifts biskopslängd. OBS: källan gav namn i ordning men INTE per-biskop-årtal
-- (bara 1647 start, superintendent→biskop 1772). Årtal null tills berikade (t.ex. via Wikidata).
DELETE FROM public.ecclesiastical_leadership
WHERE role='bishop' AND diocese_id=(SELECT id FROM public.dioceses WHERE code='harnosand');

INSERT INTO public.ecclesiastical_leadership (diocese_id, person_name, role, from_year, to_year, source)
SELECT (SELECT id FROM public.dioceses WHERE code='harnosand'), v.person, 'bishop',
       CASE WHEN v.person LIKE 'Steuchius Petrus%' THEN 1647 ELSE NULL END, NULL,
       'Härnösands stifts biskopslängd (1647–2024); superintendent→biskop 1772; årtal ej i källan'
FROM (VALUES
 ('Steuchius Petrus Erici'),('Steuchius Matthias Petri'),('Micrander Julius Erici'),
 ('Wallin Georgius (Göran) Nicolai'),('Asp Petrus Jonae'),('Sternell Nicolaus'),('Kiörning Olof'),
 ('Hesselgren Eric'),('Nordin Carl Gustaf'),('Almquist Eric Abraham'),('Franzén Frans Michael'),
 ('Bergman Israel'),('Beckman Anders Fredrik'),('Landgren Lars'),('Johansson Martin'),
 ('Lönegren Ernst Frithiof'),('Bohlin Torsten Bernhard'),('Hultgren Gunnar Axel'),('Josefson Per Love Ruben'),
 ('Palmqvist Arne Per Olof'),('Werkström Bertil Fredrik'),('Hallgren Bengt Gustaf'),('Tyrberg Karl-Johan'),
 ('Guldbrandzén Nils Tony'),('Koivunen Bylund Tuulikki Maritta'),('Nordung-Byström Eva')
) AS v(person);
