-- Rättar data jag satte ur minnet (ej verifierad källa) → verifierade Wikidata-värden.
-- Gokstadhögen: 59.0885,10.2246 (fel, ~6 km) → 59.1408,10.2531 (Wikidata Q11972326).
-- Sverresborg:  63.4130,10.3630 (fel, ~0.8 km) → 63.4195,10.3570 (Wikidata Q18342461).
UPDATE public.archaeological_sites
SET coordinates = point(10.2531,59.1408), geom = ST_SetSRID(ST_MakePoint(10.2531,59.1408),4326)
WHERE name = 'Gokstadhaugen';
UPDATE public.archaeological_sites
SET coordinates = point(10.3570,63.4195), geom = ST_SetSRID(ST_MakePoint(10.3570,63.4195),4326)
WHERE name = 'Sverresborg (Trondheim)';
UPDATE public.heritage_sites SET lat = 59.1408, lng = 10.2531 WHERE name = 'Gokstadhögen' AND raa_type='skeppsgrav';

-- Brunnmannen: förankra ålder/fenotyp i källan (bekräftade av studien) + precisera Vest-Agder.
UPDATE public.genetic_individuals
SET ancestry = '{"ursprung": "Vest-Agder (sydligaste Norge)", "fenotyp": "blå ögon, ljus hud, blont/ljusbrunt hår"}'::jsonb,
    age = '30–40 år',
    burial_context = 'Kastad i brunnen vid belägringen av Sverresborg 1197 (Kung Sverres saga; baglerhären). Skelett funnet 1938, återfunnet 2014/2018. DNA gick EJ ur benen → extraherat ur en TAND. C14 bekräftar tiden (~1197). Fenotyp och ursprung ur aDNA. Första person ur en nordisk saga identifierad via DNA.',
    source = 'Ellegaard et al. 2024, iScience: "Corroborating written history with ancient DNA: The case of the Well-man" (NTNU, M.D. Martin); ålder 30–40 år ur osteologi 2014/2016; Kung Sverres saga'
WHERE sample_id = 'Brunnmannen';
