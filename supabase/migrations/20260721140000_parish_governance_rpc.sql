-- Socken-styrpanel-RPC. Applicerad via MCP; fil = proveniens.
-- Returnerar {churches, history, leadership} för en socken (kyrkor + stiftshistorik + stiftets ledare).
CREATE OR REPLACE FUNCTION public.parish_governance(p_socken text)
RETURNS json LANGUAGE sql STABLE SET search_path = public AS $$
  WITH ch AS (
    SELECT e.id, e.name, e.kind, e.built_from, e.dating_class, e.status, e.image_url, e.diocese_id,
           d.name AS diocese_name
    FROM public.ecclesiastical_sites e
    JOIN public.parishes p ON p.id = e.parish_id
    LEFT JOIN public.dioceses d ON d.id = e.diocese_id
    WHERE lower(p.name) = lower(p_socken) AND p.parish_type = 'socken'
  )
  SELECT json_build_object(
    'churches', (SELECT coalesce(json_agg(json_build_object(
        'name', name, 'kind', kind, 'built_from', built_from, 'dating_class', dating_class,
        'status', status, 'image_url', image_url, 'diocese', diocese_name) ORDER BY built_from NULLS LAST), '[]'::json) FROM ch),
    'history', (SELECT coalesce(json_agg(row_to_json(hh)), '[]'::json) FROM (
        SELECT DISTINCT d.name AS diocese, h.from_year, h.to_year, h.note
        FROM public.church_diocese_history h JOIN public.dioceses d ON d.id = h.diocese_id
        WHERE h.church_id IN (SELECT id FROM ch)
        ORDER BY h.from_year) hh),
    'leadership', (SELECT coalesce(json_agg(row_to_json(ll)), '[]'::json) FROM (
        SELECT l.person_name, l.role, l.from_year, l.to_year, d.name AS diocese
        FROM public.ecclesiastical_leadership l JOIN public.dioceses d ON d.id = l.diocese_id
        WHERE l.diocese_id IN (SELECT DISTINCT diocese_id FROM ch WHERE diocese_id IS NOT NULL)
        ORDER BY l.from_year NULLS LAST) ll)
  );
$$;
GRANT EXECUTE ON FUNCTION public.parish_governance(text) TO anon, authenticated;
