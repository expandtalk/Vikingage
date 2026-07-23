-- 20260723150700_kg_nodes_edges_god_cultsite.sql
-- cult_sites.id är en text-slug (ej uuid) → deterministisk uuid via md5 (landskaps-konventionen).
-- Not: cult_site-nodens id är syntetiskt; vägvisaren renderar god→kultplats via cult_sites.deity
-- direkt (lat/lng), grafkanterna är för graf-traversering/brainstorming-map.
INSERT INTO entity_registry (id, entity_type, label)
SELECT md5('cult_site:' || cs.id)::uuid, 'cult_site', cs.name
FROM cult_sites cs
ON CONFLICT (id) DO NOTHING;

-- Gud -> kultplats. cult_sites.deity är engelsk kod (odin/frey/thor/njord/frigg/ull);
-- gods.name är svensk → explicit mappning. 'other'/'christian' är inga fornnordiska gudar.
WITH deity_map(code, god_name) AS (
  VALUES ('odin','Oden'), ('frey','Frej'), ('thor','Tor'),
         ('njord','Njörd'), ('frigg','Frigg'), ('ull','Ull')
)
INSERT INTO relationship (subject_id, predicate, object_id, source_ref, confidence)
SELECT g.id, 'has_cult_site', md5('cult_site:' || cs.id)::uuid, 'cult_sites.deity', 'possible'
FROM cult_sites cs
JOIN deity_map dm ON lower(trim(cs.deity)) = dm.code
JOIN gods g ON g.name = dm.god_name
WHERE cs.deity IS NOT NULL
ON CONFLICT DO NOTHING;
