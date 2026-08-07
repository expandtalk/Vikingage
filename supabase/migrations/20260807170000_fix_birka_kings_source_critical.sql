-- Källkritisk rättelse av Birka-kungarna (Björn/Olof/Anund). De är belagda genom RIMBERTS
-- Vita Ansgarii (~865–875, samtida frankisk hagiografi) — INTE Ynglingatal/Ynglingasagan (där står de
-- inte) och INGEN samtida källa anger ätt. Tidigare data hade fel: dynasty=Ynglingar, sources=saga,
-- arch=true. Applicerad i prod via MCP; denna fil = repo-spegling. 2026-08-07.
update public.historical_kings set
  dynasty_id = null,
  archaeological_evidence = false,
  external_attestation = array['frankisk'],
  sources = 'Rimbert, Vita Ansgarii (~865–875) — samtida frankisk/karolingisk primärkälla',
  description = description || ' Källkritik: belagd genom Rimberts Vita Ansgarii (~865–875), ej arkeologiskt. Ingen samtida källa anger ätt — Ynglinga-/Munsö-tillskrivningen är senare sagotradition (obelagd); ej Bjälboätten (anakronism, ätten uppträder först på 1100-talet).'
where id in (
  '1c8ca81d-a90b-400f-a3b0-ff6e26de874b',  -- Kung Björn
  'f5ea4292-6583-4e22-908b-08bb0027e3ee',  -- Kung Olof
  'e21c8682-8498-4ee9-95b7-4d4b11e2aad5'   -- Kung Anund
);
