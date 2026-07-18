-- Utökar den flexibla söket till att även träffa forskarkommentarer
-- (scholarly_notes), paleografiska noteringar och normalisering. Övrigt oförändrat:
-- söket matchar redan nya + gamla signum (alternative_signum), namn, ort/socken/härad/
-- landskap, translitteration och översättningar.
CREATE OR REPLACE FUNCTION public.search_inscriptions_flexible(p_search_term text)
 RETURNS TABLE(id uuid, signum text, transliteration text, normalization text, translation_en text, translation_sv text, dating_text text, period_start integer, period_end integer, dating_confidence double precision, location text, parish text, province text, country text, coordinates point, object_type text, material text, dimensions text, current_location text, rune_type text, rune_variant text, style_group text, uncertainty_level text, condition_notes text, bibliography jsonb, k_samsok_uri text, rundata_signum text, created_at timestamp with time zone, updated_at timestamp with time zone, embedding vector, text_segments jsonb, complexity_level text, scholarly_notes text, paleographic_notes text, historical_context text, raa_number text, lamningsnumber text, cultural_classification text, data_source text, inscription_group text, municipality text, county text, landscape text, name text, name_en text, also_known_as text[], alternative_signum text[], primary_signum text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_landscape_search boolean := false;
  landscape_signums text[];
BEGIN
  -- Landskapssökning (prefix-baserad)
  IF LOWER(p_search_term) IN ('gotland', 'småland', 'uppland', 'östergötland', 'västergötland', 'sörmland', 'närke', 'västmanland') THEN
    is_landscape_search := true;
    landscape_signums := CASE LOWER(p_search_term)
      WHEN 'gotland' THEN ARRAY['G']
      WHEN 'småland' THEN ARRAY['Sm', 'SM']
      WHEN 'uppland' THEN ARRAY['U']
      WHEN 'östergötland' THEN ARRAY['Ög', 'ÖG']
      WHEN 'västergötland' THEN ARRAY['Vg', 'VG']
      WHEN 'sörmland' THEN ARRAY['Sö', 'SÖ']
      WHEN 'närke' THEN ARRAY['Nä', 'NÄ']
      WHEN 'västmanland' THEN ARRAY['Vs', 'VS']
      ELSE ARRAY[]::text[]
    END;
  END IF;

  RETURN QUERY
  SELECT
    ri.id,
    COALESCE(ri.primary_signum, ri.signum) as signum,
    ri.transliteration, ri.normalization,
    ri.translation_en, ri.translation_sv, ri.dating_text,
    ri.period_start, ri.period_end, ri.dating_confidence,
    ri.location, ri.parish, ri.province, ri.country, ri.coordinates,
    ri.object_type, ri.material, ri.dimensions, ri.current_location,
    ri.rune_type, ri.rune_variant, ri.style_group, ri.uncertainty_level,
    ri.condition_notes, ri.bibliography, ri.k_samsok_uri, ri.rundata_signum,
    ri.created_at, ri.updated_at, ri.embedding, ri.text_segments,
    ri.complexity_level, ri.scholarly_notes, ri.paleographic_notes,
    ri.historical_context, ri.raa_number, ri.lamningsnumber,
    ri.cultural_classification, ri.data_source, ri.inscription_group,
    ri.municipality, ri.county, ri.landscape,
    ri.name, ri.name_en, ri.also_known_as, ri.alternative_signum,
    ri.primary_signum
  FROM runic_inscriptions ri
  WHERE
    CASE
      WHEN is_landscape_search THEN (
        EXISTS (
          SELECT 1 FROM unnest(landscape_signums) AS prefix
          WHERE COALESCE(ri.primary_signum, ri.signum) ~ ('^' || prefix || '\s*\d+')
        ) OR
        LOWER(ri.landscape) LIKE LOWER('%' || p_search_term || '%')
      )
      ELSE (
        LOWER(COALESCE(ri.primary_signum, ri.signum)) LIKE LOWER('%' || p_search_term || '%') OR
        EXISTS (
          SELECT 1 FROM unnest(ri.alternative_signum) AS alt_sig
          WHERE LOWER(alt_sig) LIKE LOWER('%' || p_search_term || '%')
        ) OR
        LOWER(ri.name) LIKE LOWER('%' || p_search_term || '%') OR
        LOWER(ri.name_en) LIKE LOWER('%' || p_search_term || '%') OR
        EXISTS (
          SELECT 1 FROM unnest(ri.also_known_as) AS alt_name
          WHERE LOWER(alt_name) LIKE LOWER('%' || p_search_term || '%')
        ) OR
        LOWER(ri.location) LIKE LOWER('%' || p_search_term || '%') OR
        LOWER(ri.municipality) LIKE LOWER('%' || p_search_term || '%') OR
        LOWER(ri.parish) LIKE LOWER('%' || p_search_term || '%') OR
        LOWER(ri.socken) LIKE LOWER('%' || p_search_term || '%') OR
        LOWER(ri.harad) LIKE LOWER('%' || p_search_term || '%') OR
        LOWER(ri.province) LIKE LOWER('%' || p_search_term || '%') OR
        LOWER(ri.county) LIKE LOWER('%' || p_search_term || '%') OR
        LOWER(ri.landscape) LIKE LOWER('%' || p_search_term || '%') OR
        LOWER(ri.transliteration) LIKE LOWER('%' || p_search_term || '%') OR
        LOWER(ri.normalization) LIKE LOWER('%' || p_search_term || '%') OR
        LOWER(ri.translation_en) LIKE LOWER('%' || p_search_term || '%') OR
        LOWER(ri.translation_sv) LIKE LOWER('%' || p_search_term || '%') OR
        LOWER(ri.historical_context) LIKE LOWER('%' || p_search_term || '%') OR
        -- NYTT: forskarkommentarer + paleografi
        LOWER(ri.scholarly_notes) LIKE LOWER('%' || p_search_term || '%') OR
        LOWER(ri.paleographic_notes) LIKE LOWER('%' || p_search_term || '%')
      )
    END
  ORDER BY
    CASE
      WHEN LOWER(COALESCE(ri.primary_signum, ri.signum)) = LOWER(p_search_term) THEN 1
      WHEN EXISTS (SELECT 1 FROM unnest(ri.alternative_signum) AS alt_sig WHERE LOWER(alt_sig) = LOWER(p_search_term)) THEN 2
      WHEN LOWER(ri.name) = LOWER(p_search_term) THEN 3
      WHEN LOWER(ri.location) = LOWER(p_search_term) THEN 4
      ELSE 5
    END,
    (regexp_match(COALESCE(ri.primary_signum, ri.signum), '^([A-ZÄÖÅ]+)'))[1],
    COALESCE(
      (regexp_match(COALESCE(ri.primary_signum, ri.signum), '\s*(\d+)'))[1]::integer,
      0
    ) ASC;
END;
$function$;
