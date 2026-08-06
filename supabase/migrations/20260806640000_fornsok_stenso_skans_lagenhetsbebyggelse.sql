-- Två Fornsök-lämningar på Stensö-halvön, Kalmar sn (Småland). Verifierade SWEREF99TM→WGS84 (CC0).
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
INSERT INTO public.heritage_sites (name, raa_type, period, parish, landscape, lat, lng, description)
SELECT * FROM (VALUES
  ('Stensö skans', 'Fästning/skans', '1600-tal', 'Kalmar', 'Småland', 56.6502, 16.3282,
    'Skans (rest av, nu i två delar; sammanlagt ~260 m). Bröstvärn av jord och sten, 2,5–4 m br, intill 1 m h, med en 160 m lång löpgrav N om värnet. Daterad till 1600-talet. Delvis förstörd av odling, camping och kanalbygge. Källor: RAÄ spec.inv. Kalmar landsförs. 1930; Alexandersson, K. (2007) "Skadad 1600-tals skans på Stensö" (Kalmar läns museum). Fornsök L1958:8096 / Kalmar 27:1.'),
  ('Lägenhetsbebyggelse, Stensö (Kalmar hamnläge)', 'lägenhetsbebyggelse', '1200–1400-tal (ev. omkring 1600)', 'Kalmar', 'Småland', 56.6533, 16.3421,
    'Bebyggelseområde ~30×50 m med fyndrikt kulturlager och stolphål, tolkat som bodar för fiske och bosättning vid ett hamnläge. Spår av Kalmarkriget 1611 (projektiler). Ej synlig ovan mark; delundersökt (SHM 2021). Fornsök L2021:1620.')
) AS v(name, raa_type, period, parish, landscape, lat, lng, description)
WHERE NOT EXISTS (SELECT 1 FROM public.heritage_sites h WHERE h.name = v.name);
