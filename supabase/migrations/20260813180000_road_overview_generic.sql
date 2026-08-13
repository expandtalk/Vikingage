-- Generisk vägrenderare (A): slug på viking_roads + road_overview(slug)-RPC → RoadPage ritar VILKEN
-- väg som helst (linje genom waypoints + waypoint-/landmark-markörer). Ersätter Eriksgata-specifik logik.
ALTER TABLE public.viking_roads ADD COLUMN IF NOT EXISTS slug text;
UPDATE public.viking_roads
SET slug = trim(both '-' from lower(regexp_replace(unaccent(name), '[^a-zA-Z0-9]+', '-', 'g')))
WHERE slug IS NULL OR slug='';
CREATE UNIQUE INDEX IF NOT EXISTS viking_roads_slug_uniq ON public.viking_roads (slug);

CREATE OR REPLACE FUNCTION public.road_overview(p_slug text)
 RETURNS jsonb LANGUAGE sql STABLE SET search_path TO 'public'
AS $function$
  SELECT jsonb_build_object(
    'name', r.name,
    'type', r.road_type,
    'description', r.description,
    'slug', r.slug,
    'waypoints', (SELECT coalesce(jsonb_agg(jsonb_build_object(
        'name',w.name,'type',w.waypoint_type,'lat',(w.coordinates)[1],'lng',(w.coordinates)[0],'ord',w.waypoint_order)
        ORDER BY w.waypoint_order),'[]'::jsonb) FROM road_waypoints w WHERE w.road_id=r.id),
    'landmarks', (SELECT coalesce(jsonb_agg(jsonb_build_object(
        'name',l.name,'type',l.landmark_type,'lat',(l.coordinates)[1],'lng',(l.coordinates)[0],
        'description',l.description,'significance',l.historical_significance)),'[]'::jsonb)
        FROM road_landmarks l WHERE l.road_id=r.id)
  )
  FROM viking_roads r WHERE r.slug = p_slug LIMIT 1;
$function$;
GRANT EXECUTE ON FUNCTION public.road_overview(text) TO anon, authenticated;
