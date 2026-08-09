-- Egen fakta-nod för söksvaret: den sökta entitetens EGEN beskrivning + datering (kyrkor + heritage),
-- så svaret inte bara visar "geografisk mittpunkt + närområde". Exakt namnträff; rikaste beskrivning vinner.
CREATE OR REPLACE FUNCTION public.entity_node(p_name text)
RETURNS TABLE (kind text, title text, description text, dating text)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT kind, title, description, dating FROM (
    SELECT 'Kyrka'::text AS kind, e.name AS title, e.description, e.founded_year::text AS dating, 1 AS pri
    FROM ecclesiastical_sites e WHERE lower(e.name) = lower(btrim(p_name)) AND coalesce(e.description,'') <> ''
    UNION ALL
    SELECT coalesce(cs.site_type,'Kristen plats'), cs.name, cs.description, NULL, 2
    FROM christian_sites cs WHERE lower(cs.name) = lower(btrim(p_name)) AND coalesce(cs.description,'') <> ''
    UNION ALL
    SELECT h.raa_type, h.name, h.description, h.period, 3
    FROM heritage_sites h WHERE lower(h.name) = lower(btrim(p_name)) AND coalesce(h.description,'') <> ''
  ) x ORDER BY pri LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.entity_node(text) TO anon, authenticated;
