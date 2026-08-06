-- Kalmar-homonym: Kalmar (Småland, stad) vs Kalmar socken (Uppland).
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
-- 1) Kalmar domkyrka (Småland) hör till Kalmar-stad-parishen, inte Uppland-socknen.
UPDATE public.ecclesiastical_sites
SET parish_id = '9121e6ed-5490-4b12-a289-049e9528d5e7'
WHERE id = '1d1bab4b-63a3-4181-9eeb-cc1bc9aa8ab3';       -- Kalmar domkyrka

-- 2) parish_governance får valfri landskaps-disambiguering (homonyma socknar). DROP av
--    1-arg-varianten för att undvika överlagrings-tvetydighet vid enargs-anrop.
DROP FUNCTION IF EXISTS public.parish_governance(text);
CREATE OR REPLACE FUNCTION public.parish_governance(p_socken text, p_landscape text DEFAULT NULL)
 RETURNS json LANGUAGE sql STABLE SET search_path TO 'public'
AS $function$
  WITH ch AS (
    SELECT e.id, e.name, e.kind, e.built_from, e.dating_class, e.status, e.image_url, e.diocese_id,
           e.lat, e.lng, e.patron_saint, d.name AS diocese_name
    FROM public.ecclesiastical_sites e
    JOIN public.parishes p ON p.id = e.parish_id
    LEFT JOIN public.dioceses d ON d.id = e.diocese_id
    WHERE lower(p.name) = lower(p_socken) AND p.parish_type IN ('socken','stad','other')
      AND (p_landscape IS NULL OR lower(coalesce(e.landscape,'')) = lower(p_landscape))
  )
  SELECT json_build_object(
    'churches', (SELECT coalesce(json_agg(json_build_object(
        'name', name, 'kind', kind, 'built_from', built_from, 'dating_class', dating_class,
        'status', status, 'image_url', image_url, 'diocese', diocese_name,
        'lat', lat, 'lng', lng, 'patron_saint', patron_saint) ORDER BY built_from NULLS LAST), '[]'::json) FROM ch),
    'history', (SELECT coalesce(json_agg(row_to_json(hh)), '[]'::json) FROM (
        SELECT DISTINCT d.name AS diocese, h.from_year, h.to_year, h.note
        FROM public.church_diocese_history h JOIN public.dioceses d ON d.id = h.diocese_id
        WHERE h.church_id IN (SELECT id FROM ch) ORDER BY h.from_year) hh),
    'leadership', (SELECT coalesce(json_agg(row_to_json(ll)), '[]'::json) FROM (
        SELECT l.person_name, l.role, l.from_year, l.to_year, d.name AS diocese
        FROM public.ecclesiastical_leadership l JOIN public.dioceses d ON d.id = l.diocese_id
        WHERE l.diocese_id IN (SELECT DISTINCT diocese_id FROM ch WHERE diocese_id IS NOT NULL)
        ORDER BY l.from_year NULLS LAST) ll)
  );
$function$;
GRANT EXECUTE ON FUNCTION public.parish_governance(text, text) TO anon, authenticated;
