-- Göta landsväg hade 3 ändpunkter (bör vara 2). Skanstull (order 2, "infart Södermalm") var ingen
-- terminus utan en befäst kontrollpunkt vid stadsgränsen — namnet "Skans-tull" (skans + tull) belägger
-- det. Omklassad endpoint→fort → 2 ändpunkter (Björns trädgård start, Södertälje slut).
UPDATE road_waypoints w SET kind='fort'
FROM viking_roads r
WHERE w.road_id=r.id AND r.name='Göta landsväg' AND w.name ILIKE 'Skanstull%' AND w.kind='endpoint';
