-- Vig-uroxen (Danmark): nästan komplett uroxeskelett, tidig-holocen (mesolitikum),
-- funnen i kärr vid Vig, Odsherred (Själland). Skador/flinta i revbenen → jagad, undkom,
-- dog i mossen. Klassisk parallell till Vesa/Rockneby-uroxen (Kalmar stads historia).
-- Koord = Vig, Odsherred (approx). Källa: Nationalmuseet (DK), "Uroksen fra Vig".
INSERT INTO public.species_introductions
  (entity, category, proxy_type, site_name, region, landscape, lat, lng, date_text, date_from, date_to, uncertainty, confidence, source, note)
SELECT 'Uroxe (Bos primigenius)', 'fauna', 'zooarchaeology',
  'Vig mose (Odsherred)', 'Själland', 'Danmark', 55.8500, 11.5800,
  'ca 7500 f.Kr.', -7500, -7000, 'koord approx Vig, Odsherred; tidig-holocen (boreal)',
  'hög', 'Nationalmuseet (Danmark) — Uroksen fra Vig',
  'Nästan komplett uroxeskelett med skador/flintpilspetsar vid revbenen — jagad men undkom och dog i kärret. Tidig-holocent mesolitiskt nyckelfynd. Jfr Vesa/Rockneby-uroxen (Kalmar stads historia, pollendatering Königsson).'
WHERE NOT EXISTS (
  SELECT 1 FROM public.species_introductions
  WHERE entity ILIKE '%Bos primigenius%' AND site_name ILIKE '%Vig%');
