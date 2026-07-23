-- 20260723150200_kg_nodes_dynasty_estate.sql
-- Dynasti-noder (fyller de 7 som saknas; ON CONFLICT skyddar de 23 befintliga).
INSERT INTO entity_registry (id, entity_type, label)
SELECT d.id, 'dynasty', d.name
FROM royal_dynasties d
ON CONFLICT (id) DO NOTHING;

-- Estate-noder (ny typ).
INSERT INTO entity_registry (id, entity_type, label)
SELECT e.id, 'estate', e.name
FROM estates e
ON CONFLICT (id) DO NOTHING;
