-- Offerbrunn vid Gamla Uppsala kyrka. Källa: Ernst Klein, Bilder ur Sveriges historia (1931) s. 95
-- (ritning av brunnens konstruktion/storlek; trätrumma ca 5 m). Källkritik: offer-/kultkontinuitets-
-- tolkningen är omtvistad; brunnen låg VID kyrkan (jfr Edestad), ej nödvändigtvis under. Koordinat =
-- kyrkans verifierade läge (ur ecclesiastical_sites), markerad approximativ.
-- Typad som 'Källa med tradition' → ansluter till det befintliga offerkälle-lagret.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
INSERT INTO public.heritage_sites (name, raa_type, period, parish, landscape, lat, lng, description)
SELECT 'Offerbrunn vid Gamla Uppsala kyrka', 'Källa med tradition',
  'förkristen–medeltid (kultkontinuitet, omtvistat)', 'Gamla Uppsala', 'Uppland',
  59.8995, 17.6319,
  'Utgrävd brunn vid Gamla Uppsala kyrka (enligt uppgift 1916). Själva trätrumman ca 5 m djup; konstruktion och storlek avbildade i Ernst Klein, Bilder ur Sveriges historia (1931), s. 95. KÄLLKRITIK: traditionellt tolkad som en förkristen offerbrunn med kultkontinuitet — tolkningen är omtvistad. Låg i anknytning till kyrkan (jfr Edestad, där den heliga källan ligger vid kyrkan). Koordinat = kyrkans läge (approx; brunnen intill).'
WHERE NOT EXISTS (SELECT 1 FROM public.heritage_sites h WHERE h.name = 'Offerbrunn vid Gamla Uppsala kyrka');
