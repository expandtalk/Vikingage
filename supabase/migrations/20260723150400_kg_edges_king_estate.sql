-- 20260723150400_kg_edges_king_estate.sql
-- Kung -> kungsgård ur estate_holdings.king_id. Kvalificera med roll/period/förvärvssätt.
INSERT INTO relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence)
SELECT h.king_id,
       'has_estate',
       h.estate_id,
       jsonb_strip_nulls(jsonb_build_object(
         'role', h.role,
         'period_start', h.period_start,
         'period_end', h.period_end,
         'acquired_via', h.acquired_via,
         'fiscal_system', h.fiscal_system
       )),
       'estate_holdings',
       COALESCE(h.confidence, 'possible')  -- 'uncertain' är ej tillåtet av relationship_confidence_check
FROM estate_holdings h
WHERE h.king_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM entity_registry er WHERE er.id = h.king_id AND er.entity_type = 'king')
  AND EXISTS (SELECT 1 FROM entity_registry er WHERE er.id = h.estate_id AND er.entity_type = 'estate')
ON CONFLICT DO NOTHING;
