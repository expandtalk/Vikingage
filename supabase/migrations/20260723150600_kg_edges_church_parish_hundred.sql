-- 20260723150600_kg_edges_church_parish_hundred.sql
-- Kyrka -> socken (befintlig FK parish_id). belongs_to_parish subject_type='*' (church OK), object 'parish'.
INSERT INTO relationship (subject_id, predicate, object_id, source_ref, confidence)
SELECT c.id, 'belongs_to_parish', c.parish_id, 'ecclesiastical_sites.parish_id', 'certain'
FROM ecclesiastical_sites c
WHERE c.parish_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM entity_registry er WHERE er.id = c.parish_id AND er.entity_type = 'parish')
ON CONFLICT DO NOTHING;

-- Socken -> härad (semantiskt korrekt part_of_hundred: subject 'parish', object 'hundred').
-- Via parishes.hundred_external_id -> hundreds.external_id. Ger kyrka->socken->härad som 2-hopp.
INSERT INTO relationship (subject_id, predicate, object_id, source_ref, confidence)
SELECT p.id, 'part_of_hundred', h.id, 'parishes.hundred_external_id', 'certain'
FROM parishes p
JOIN hundreds h ON h.external_id = p.hundred_external_id
WHERE p.hundred_external_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM entity_registry er WHERE er.id = p.id AND er.entity_type = 'parish')
  AND EXISTS (SELECT 1 FROM entity_registry er WHERE er.id = h.id AND er.entity_type = 'hundred')
ON CONFLICT DO NOTHING;
