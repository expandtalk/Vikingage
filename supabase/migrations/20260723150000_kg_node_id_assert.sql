-- 20260723150000_kg_node_id_assert.sql
-- Verifierar att king/dynasty-noder delar id med sina källtabeller. Ingen datamutation.
DO $$
DECLARE
  king_mismatch int;
  dyn_mismatch int;
BEGIN
  SELECT count(*) INTO king_mismatch
  FROM entity_registry er
  WHERE er.entity_type = 'king'
    AND NOT EXISTS (SELECT 1 FROM historical_kings k WHERE k.id = er.id);

  SELECT count(*) INTO dyn_mismatch
  FROM entity_registry er
  WHERE er.entity_type = 'dynasty'
    AND NOT EXISTS (SELECT 1 FROM royal_dynasties d WHERE d.id = er.id);

  IF king_mismatch > 0 THEN
    RAISE EXCEPTION 'Nod-id-konvention bruten: % king-noder saknar matchande historical_kings.id', king_mismatch;
  END IF;
  IF dyn_mismatch > 0 THEN
    RAISE EXCEPTION 'Nod-id-konvention bruten: % dynasty-noder saknar matchande royal_dynasties.id', dyn_mismatch;
  END IF;
  RAISE NOTICE 'OK: king/dynasty-noder följer id-konventionen.';
END $$;
