-- #3: three demolished/renamed old churches whose ortnamn-entity (as clicked/labelled) resolved to no
-- centre, because the resolver's "gamla kyrka"->"kyrka"/"kyrkoruin" normalization can't bridge a word-order
-- variant, a parish rename, or a malformed label:
--   "Kävlinge gamla kyrka"        -> church exists as "Gamla kyrkan i Kävlinge" (word order)
--   "Särestads gamla kyrka"       -> church renamed "Särestad-Bjärby kyrka" (parish merge)
--   "Sjörup, Sjörups gamla kyrka" -> church exists as "Sjörups gamla kyrka" (malformed label prefix)
-- Add each as a place_names gazetteer row carrying the EXACT coordinate of its matching heritage_sites
-- feature (RAÄ, CC0) — copied from the row, never typed/guessed — so resolve_place resolves them and the
-- nearby runestones (e.g. Vg 105 at Särestad, Vg 108/109 at Tängs kyrkoruin already handled) surface.
INSERT INTO public.place_names (name, lat, lng, source, source_license, name_authority)
SELECT DISTINCT ON (v.name) v.name, h.lat, h.lng, 'raa_heritage_link', 'CC0', 'raa'
FROM (VALUES
  ('Kävlinge gamla kyrka',        'Gamla kyrkan i Kävlinge'),
  ('Särestads gamla kyrka',       'Särestad-Bjärby kyrka'),
  ('Sjörup, Sjörups gamla kyrka', 'Sjörups gamla kyrka')
) AS v(name, heritage_name)
JOIN public.heritage_sites h ON lower(h.name) = lower(v.heritage_name) AND h.lat IS NOT NULL
WHERE NOT EXISTS (SELECT 1 FROM public.place_names p WHERE lower(p.name) = lower(v.name))
ORDER BY v.name, h.id;
