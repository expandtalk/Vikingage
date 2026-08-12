-- Härledd "sevärdhet" ur signaler vi HAR (INGEN GISSNING): RAÄ-typ-vikt (kyrka/borg/runsten/
-- skeppssättning tunga; röse/stensättning/färdväg mellan; fornlämningsliknande/vägmärke/milstolpe
-- lätta) + prominence + popularity + kurerad-slug-boost. Ersätter prominence>0-golvet i
-- entity_answer_context så tunna orter (Lidingö) surfar sina EGNA lokala lämningar.
CREATE OR REPLACE FUNCTION public.heritage_significance(
  p_raa_type text, p_prominence numeric, p_popularity numeric, p_has_slug boolean
) RETURNS numeric
LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $function$
  SELECT
    (CASE
       WHEN p_raa_type ILIKE '%kyrk%' OR p_raa_type ILIKE '%kloster%' OR p_raa_type ILIKE '%borg%'
         OR p_raa_type ILIKE '%runsten%' OR p_raa_type ILIKE '%runristning%' OR p_raa_type ILIKE '%skeppssättning%'
         OR p_raa_type ILIKE '%hällristning%' OR p_raa_type ILIKE '%slott%' OR p_raa_type ILIKE '%fornborg%' THEN 5.0
       WHEN p_raa_type ILIKE '%gravfält%' OR p_raa_type ILIKE '%domarring%' OR p_raa_type ILIKE '%bildsten%'
         OR p_raa_type ILIKE '%offer%' OR p_raa_type ILIKE '%hög%' OR p_raa_type ILIKE '%bro%' THEN 3.5
       WHEN p_raa_type ILIKE '%röse%' OR p_raa_type ILIKE '%stensättning%' OR p_raa_type ILIKE '%färdväg%'
         OR p_raa_type ILIKE '%hålväg%' OR p_raa_type ILIKE '%husgrund%' OR p_raa_type ILIKE '%milstolpe%' THEN 2.0
       WHEN p_raa_type ILIKE '%fornlämningsliknande%' OR p_raa_type ILIKE '%vägmärke%'
         OR p_raa_type ILIKE '%väghållnings%' OR p_raa_type ILIKE '%uppgift%' THEN 0.4
       ELSE 1.0
     END)
    + coalesce(p_prominence,0) * 2.0
    + least(coalesce(p_popularity,0), 5) * 0.4
    + (CASE WHEN p_has_slug THEN 3.0 ELSE 0 END)
$function$;
