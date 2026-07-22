-- Husaby-orter som estates (typ 'husaby') ur place_names — det tidiga kungliga
-- förvaltnings-/gästningsskiktet (Uppsala öd-proxy). Koordinater finns i place_names.
-- Ägande/tid EJ fastställt per gård (läggs som holdings vid belägg). Idempotent.
DELETE FROM public.estates WHERE estate_type='husaby';
INSERT INTO public.estates (name, estate_type, lat, lng, description, source, confidence)
SELECT DISTINCT ON (round(lat::numeric,4), round(lng::numeric,4))
  name, 'husaby', lat, lng,
  'Husaby-ortnamn — tidig kunglig förvaltnings-/gästningsgård (Uppsala öd-proxy). Härlett ur place_names; ägande/tid ej fastställt per gård.',
  'place_names (ortnamn)', 'probable'
FROM public.place_names
WHERE (name ~* '(^|\s)husby($|\s)|huseby|husaby') AND lat IS NOT NULL
  AND name !~* 'husagård|husalt|husahage';
