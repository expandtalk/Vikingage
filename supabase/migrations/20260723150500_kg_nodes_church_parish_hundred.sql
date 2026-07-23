-- 20260723150500_kg_nodes_church_parish_hundred.sql
INSERT INTO entity_registry (id, entity_type, label)
SELECT c.id, 'church', c.name FROM ecclesiastical_sites c
ON CONFLICT (id) DO NOTHING;

INSERT INTO entity_registry (id, entity_type, label)
SELECT p.id, 'parish', p.name FROM parishes p
ON CONFLICT (id) DO NOTHING;

INSERT INTO entity_registry (id, entity_type, label)
SELECT h.id, 'hundred', h.name FROM hundreds h
ON CONFLICT (id) DO NOTHING;
