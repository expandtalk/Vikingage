-- 20260723150300_kg_edges_king_dynasty.sql
-- Kung -> dynasti ur historical_kings.dynasty_id.
-- OBS: dynasti-noder är dubbeltypade (dynasty + source) MEDVETET (se dynasty-as-source-intent).
-- Kräver därför bara att dynasti-noden FINNS (valfri typ), inte entity_type='dynasty'.
-- belongs_to_dynasty.object_type sattes till '*' i 20260723150150 för att trigger-typecheck
-- ska tillåta detta.
INSERT INTO relationship (subject_id, predicate, object_id, source_ref, confidence)
SELECT k.id, 'belongs_to_dynasty', k.dynasty_id, 'historical_kings.dynasty_id', 'certain'
FROM historical_kings k
WHERE k.dynasty_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM entity_registry er WHERE er.id = k.dynasty_id)
  AND EXISTS (SELECT 1 FROM entity_registry er WHERE er.id = k.id AND er.entity_type = 'king')
ON CONFLICT DO NOTHING;
