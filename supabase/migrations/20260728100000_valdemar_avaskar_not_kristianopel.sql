-- Källkritisk fix: Valdemars segelled ~1231 (Kung Valdemars jordebok). Blekinge-punkten var
-- felmärkt "Kristianopel" — en fästningsstad grundad 1599–1611, ~370 år EFTER leden (anakronism).
-- Det tidsenliga hamnläget var Avaskär, medeltida köpstad ~500 m norr om senare Kristianopel.
-- Leden listar naturhamnar/lotsställen; Ava-"skär" är just en sådan, äldre än staden.
UPDATE public.valdemar_route_points
SET name = 'Avaskär',
    description = 'Medeltida hamn och köpstad i östra Blekinge (danskt område); staden säkert belagd från 1350, hamnläget/skäret äldre. Tidsenlig ledpunkt för Valdemars segelled (~1231) — leden listar naturhamnar, och Ava-skär är en sådan. Ersattes 1599–1611 av fästningsstaden Kristianopel ~500 m söderut, som gav platsen dess nutida namn. (Kristianopel existerade INTE när leden nedtecknades.)'
WHERE name = 'Kristianopel' AND section = 'Blekinge östkust';
