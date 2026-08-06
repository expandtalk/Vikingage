-- Norrköping: koppla stadskyrkorna till socknen + RPC för fornborgar i regionen.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
-- Svar på "har inte Norrköping en borg och tidig kyrka?" — kyrkorna saknade parish_id
-- (samma mönster som Sigtuna); fornborgarna fanns men bara i hillfort-lagret.
-- Norrköping parish_id = 55851032-e921-4682-89a4-880bd302bddb (parish_type='other'/stad).

UPDATE public.ecclesiastical_sites SET
  parish_id = '55851032-e921-4682-89a4-880bd302bddb',
  curated = true,
  historical_notes = COALESCE(historical_notes,
    'Norrköpings huvudkyrka. Nuvarande barockkyrka invigd 1767, men platsen/församlingen har medeltida ursprung — S:t Olai var en av stadens medeltida kyrkor (Norrköping fick stadsprivilegier 1384). Källa: Wikipedia/Bebyggelseregistret (fakta).')
WHERE id = 'c4d45e59-00d6-4d6b-92c9-29410215ac88';  -- Sankt Olai

UPDATE public.ecclesiastical_sites SET
  parish_id = '55851032-e921-4682-89a4-880bd302bddb'
WHERE id = '6ba9b689-1662-40ec-9161-893713002641';  -- Hedvigs kyrka (Tyska kyrkan, 1673)

-- Fornborgar för en region/socken → RegionFindsView. Matchar parish = socken ELLER
-- municipality = socken (stad; borgarna ligger ofta i kringsocknar men samma kommun).
-- coordinates = point(lng,lat).
CREATE OR REPLACE FUNCTION public.region_forts(p_socken text)
RETURNS json LANGUAGE sql STABLE SET search_path TO 'public' AS $function$
  SELECT coalesce(json_agg(json_build_object(
    'name', name,
    'lat', coordinates[1], 'lng', coordinates[0],
    'fortress_type', fortress_type, 'period', period,
    'dating_basis', dating_basis, 'raa_number', raa_number) ORDER BY name), '[]'::json)
  FROM public.swedish_hillforts
  WHERE coordinates IS NOT NULL
    AND (lower(parish) = lower(p_socken)
      OR lower(municipality) = lower(p_socken)
      OR lower(municipality) = lower(p_socken) || ' kommun');
$function$;
GRANT EXECUTE ON FUNCTION public.region_forts(text) TO anon, authenticated;
