-- Korrekt stiftshistorik för Öland + Möre/Kalmar: Linköping (medeltid) → Kalmar stift (1603)
-- → Växjö stift (1915). Körd via MCP 2026-07-21. Ersätter tidigare förenklad Öland-historik.
-- Primär diocese_id på kyrkorna = linkoping (medeltida); epokerna bärs i church_diocese_history.

INSERT INTO public.dioceses (code,name,name_en,seat,realm,founded_year,dissolved_year,source) VALUES
 ('kalmar','Kalmar stift','Diocese of Kalmar','Kalmar','sverige',1603,1915,'Kalmar stift grundat 1603, uppgick i Växjö stift 1915')
ON CONFLICT (code) DO NOTHING;

-- Rensa ev. tidigare (förenklad) stiftsindelnings-historik för Öland-bboxen.
DELETE FROM public.church_diocese_history h USING public.ecclesiastical_sites e
WHERE h.church_id=e.id AND h.source='stiftsindelning'
  AND e.lat BETWEEN 56.1 AND 57.45 AND e.lng BETWEEN 16.35 AND 17.15;

WITH churches AS (
  SELECT id FROM public.ecclesiastical_sites
  WHERE kind IN ('parish_church','chapel','cathedral')
    AND ((lat BETWEEN 56.1 AND 57.45 AND lng BETWEEN 16.35 AND 17.15)      -- Öland
      OR name IN ('Hossmo kyrka','Kläckeberga kyrka','Hagby kyrka'))        -- Möre/Kalmar-fastland
)
INSERT INTO public.church_diocese_history (church_id, diocese_id, from_year, to_year, note, source)
SELECT c.id, d.id, v.f, v.t, v.note, 'stiftsindelning'
FROM churches c
CROSS JOIN (VALUES
  ('linkoping',1200,1603,'Under Linköpings stift (medeltiden–1603)'),
  ('kalmar',1603,1915,'Kalmar stift 1603–1915'),
  ('vaxjo',1915,NULL,'Överfört till Växjö stift 1915')
) AS v(code,f,t,note)
JOIN public.dioceses d ON d.code=v.code;
