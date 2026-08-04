-- Koordinat-snabbvinst: fyll saknade koordinater med SOCKEN-CENTROID (medelvärde av andra
-- inskrifter i samma socken som har koord). Endast för poster med känd socken. Märks tydligt
-- approximativt (coord_source='parish_centroid', coord_confidence='approximate') — ingen gissning,
-- en härledd approximation ur befintlig verifierad data. Fyller bara NULL (idempotent).
WITH parish_coords AS (
  SELECT lower(parish) AS p, avg((coordinates)[0]) lng, avg((coordinates)[1]) lat
  FROM runic_inscriptions WHERE coordinates IS NOT NULL AND parish IS NOT NULL
  GROUP BY lower(parish)
)
UPDATE runic_inscriptions ri
SET coordinates = point(pc.lng, pc.lat),
    coord_source = 'parish_centroid (sockensyskon)',
    coord_confidence = 'approximate'
FROM parish_coords pc
WHERE ri.coordinates IS NULL AND ri.parish IS NOT NULL
  AND ri.parish NOT ILIKE '%okänd%' AND ri.parish NOT ILIKE '%unknown%'
  AND lower(ri.parish) = pc.p;
