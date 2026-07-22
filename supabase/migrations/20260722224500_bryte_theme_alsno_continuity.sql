-- Alsnö stadga (1280) in i bryte/förvaltnings-temat + plats-kontinuiteten Hovgården/Adelsö.
-- Daniel 2026-07-22: Alsnö stadga är ~10 år äldre än Östgötalagen (1290) och utfärdades i
-- Alsnö hus på Adelsö — SAMMA plats som U 11 (Håkanstenen, ca 1065). Det ger den försvarbara
-- kontinuitetstesen: ett kungssäte i 215 år (ledungens fogde -> frälsets grundande), förankrad
-- i plats + källor, till skillnad fran den obelagda folkvandringstida linjen. Frälse = skattefrihet
-- mot rusttjänst = vändpunkten där sjöbaserad ledungsskatt börjar bli landbaserad frälseadel.

DO $$
DECLARE tid uuid;
BEGIN
  SELECT id INTO tid FROM themes WHERE slug='bryte-forvaltningsorganisation';
  IF tid IS NULL THEN RAISE NOTICE 'temat saknas — kör 20260722223000 först'; RETURN; END IF;

  INSERT INTO theme_links(theme_id, entity_type, entity_id, notes)
  SELECT tid, 'source', 'e8ac9f66-23a3-40e6-98b8-e5f263995eeb',
    'Alsnö stadga (1280, Magnus Ladulås) — utfärdad i Alsnö hus på Adelsö, SAMMA plats som U 11 (~215 års kontinuitet). Grundar frälset: skattefrihet mot rusttjänst = vändpunkten där sjöbaserad ledungsskatt börjar bli landbaserad frälseadel.'
  WHERE NOT EXISTS (
    SELECT 1 FROM theme_links tl WHERE tl.theme_id=tid AND tl.entity_id='e8ac9f66-23a3-40e6-98b8-e5f263995eeb'
  );

  UPDATE themes SET description = description ||
    ' Platskontinuitet: samma kungssäte, Hovgården på Adelsö, är där U 11 restes (ca 1065) OCH där Magnus Ladulås utfärdade Alsnö stadga (1280) — 215 år, från ledungens fogde till frälsets grundande. Det är den försvarbara kontinuiteten (förankrad i plats och källor), till skillnad från den obelagda folkvandringstida linjen.'
  WHERE id=tid AND description NOT LIKE '%Platskontinuitet%';
END $$;
