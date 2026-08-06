-- Söderköpings medeltida kyrkor → koppling till socknen (samma buggmönster som Sigtuna/Norrköping).
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
-- Söderköping parish_id = 97f0bff1-ba4b-4176-a4e7-d035129a885d (parish_type='other'/stad).
-- OBS faktarättelse: Hans Brask var biskop i LINKÖPING (ej Skara); hans tryckeri i Söderköping
-- (1520-tal) var tidigt men inte Sveriges första (Stockholm 1483).
UPDATE public.ecclesiastical_sites SET
  parish_id = '97f0bff1-ba4b-4176-a4e7-d035129a885d', curated = true,
  historical_notes = COALESCE(historical_notes,
    'Söderköpings medeltida stadskyrka (Sankt Laurentius/Lars), i Linköpings stift. Söderköping var en betydande hansestad. Biskop Hans Brask — biskop i LINKÖPING 1513-1527 (ej Skara) — drev ett tidigt boktryckeri i Söderköping på 1520-talet; det var dock inte Sveriges första tryckeri (det stod i Stockholm 1483). Källa: Wikipedia/Bebyggelseregistret (fakta).')
WHERE id = '0578711a-b0c9-4cb2-a4f6-176bf08daead';
UPDATE public.ecclesiastical_sites SET
  parish_id = '97f0bff1-ba4b-4176-a4e7-d035129a885d', curated = true,
  historical_notes = COALESCE(historical_notes,
    'Franciskankonvent (gråbröder) i Söderköping under medeltiden. Upplöst vid reformationen. Källa: Wikipedia (fakta).')
WHERE id = '8f47b4e4-cef9-4f46-b72f-7087f0154f09';
