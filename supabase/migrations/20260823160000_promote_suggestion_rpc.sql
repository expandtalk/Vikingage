-- (b) Befordran: godkänn ett platsförslag → skapa en KANONISK, RENDERBAR nod och reindexera i ETT steg.
-- Målet är heritage_sites med place_slug → renderas på /sv/plats/:slug (PlacePage) OCH är indexerat som
-- entity_type 'heritage_site'. Koordinaten MÅSTE anges av admin (verifierad) — aldrig ur minnet.
-- Noden märks som UGC (raa_type + source_uri) så den inte förväxlas med RAÄ-lagret. SECURITY DEFINER
-- (content_pages/heritage_sites saknar publik insert-policy) med is_admin()-grind. Reindex körs server-side.

CREATE OR REPLACE FUNCTION public.promote_suggestion_to_place(
  p_suggestion_id uuid,
  p_lat double precision,
  p_lng double precision
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s        public.place_suggestions;
  v_slug   text;
  v_base   text;
  v_n      int := 1;
  v_id     uuid;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Endast admin får befordra förslag'; END IF;
  IF p_lat IS NULL OR p_lng IS NULL THEN RAISE EXCEPTION 'Koordinat krävs (verifierad, aldrig ur minnet)'; END IF;

  SELECT * INTO s FROM public.place_suggestions WHERE id = p_suggestion_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Förslaget finns inte'; END IF;

  -- slug ur namnet, unik mot befintliga place_slug
  v_slug := trim(both '-' from regexp_replace(
              lower(translate(s.name, 'åäöÅÄÖéèüøæ', 'aaoaaoeuoa')), '[^a-z0-9]+', '-', 'g'));
  IF v_slug = '' THEN v_slug := 'plats'; END IF;
  v_base := v_slug;
  WHILE EXISTS (SELECT 1 FROM public.heritage_sites WHERE place_slug = v_slug) LOOP
    v_n := v_n + 1; v_slug := v_base || '-' || v_n;
  END LOOP;

  -- geom är en GENERERAD kolumn (auto ur lat/lng) — sätts INTE här.
  INSERT INTO public.heritage_sites (name, description, lat, lng, raa_type, source_uri, place_slug, evidence_class)
  VALUES (
    s.name, s.note, p_lat, p_lng,
    'UGC-nod (obekräftad)',
    'ugc:place_suggestion:' || s.id::text,
    v_slug, 'ugc'
  ) RETURNING id INTO v_id;

  UPDATE public.place_suggestions
     SET status = 'accepted',
         admin_notes = concat_ws(' · ', admin_notes, 'befordrad → /sv/plats/' || v_slug)
   WHERE id = p_suggestion_id;

  PERFORM public.rebuild_search_document('heritage_site', v_id);  -- indexera direkt → sökbart
  RETURN v_slug;
END;
$$;

GRANT EXECUTE ON FUNCTION public.promote_suggestion_to_place(uuid, double precision, double precision) TO authenticated;
