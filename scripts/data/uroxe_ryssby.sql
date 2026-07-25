-- Uroxe (Bos primigenius), Vesa vid Rockneby skans, Ryssby sn, Kalmar. Mesolitikum.
-- Källa: Kalmar stads historia; pollenanalys L.-K. Königsson (gyttja ur kraniets hålrum,
-- strandnära, havtorn i pollen), daterad ~7000 f.Kr. Koord = Rockneby (place_names);
-- fyndplatsen Vesa ligger några hundra m SV därom (approx).
INSERT INTO public.species_introductions
  (entity, category, proxy_type, site_name, region, landscape, lat, lng, date_text, date_from, date_to, uncertainty, confidence, source, note)
SELECT 'Uroxe (Bos primigenius)', 'fauna', 'zooarchaeology',
  'Vesa, Rockneby (Ryssby sn)', 'Kalmar', 'Småland', 56.8043, 16.3491,
  'ca 7000 f.Kr.', -7000, -7000, 'pollendatering av gyttja i kraniet (Königsson); koord approx Rockneby',
  'medel', 'Kalmar stads historia; pollenanalys L.-K. Königsson',
  'Uroxeskelett i torvdy vid Vesa, några hundra m SV om Rockneby skans. Strandnära läge; havtorn i pollenproverna. Jfr Vig mosse (Odsherred, Själland): nästan komplett uroxeskelett med tre flintpilspetsar vid bröstrevbenen — troligen jagade ut i kärr. Sista kända uroxen dödad i Polen 1627.'
WHERE NOT EXISTS (SELECT 1 FROM public.species_introductions WHERE entity ILIKE '%Bos primigenius%' AND site_name ILIKE '%Rockneby%');
