-- Öppna city_radius_overview för alla 290 kommuner (admin_boundaries kommun-centroid som center-fallback).
CREATE OR REPLACE FUNCTION public.city_radius_overview(p_name text, p_radius_m double precision DEFAULT 25000)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
WITH ctr AS (
  SELECT lat, lng FROM (
    SELECT ST_Y(ST_Centroid(cp.geom)) lat, ST_X(ST_Centroid(cp.geom)) lng, 1 pri
      FROM content_pages cp WHERE (lower(cp.title_sv)=lower(p_name) OR lower(cp.slug)=lower(p_name)) AND cp.geom IS NOT NULL AND cp.kind='region'
    UNION ALL
    SELECT avg(h.lat), avg(h.lng), 2 FROM heritage_sites h WHERE h.municipality ILIKE p_name AND h.lat IS NOT NULL
      HAVING count(*) >= 5
    UNION ALL
    SELECT ST_Y(ab.centroid), ST_X(ab.centroid), 3 FROM admin_boundaries ab WHERE ab.level='kommun' AND lower(ab.name)=lower(p_name) AND ab.centroid IS NOT NULL
  ) z WHERE lat IS NOT NULL ORDER BY pri LIMIT 1
),
g AS (SELECT ST_SetSRID(ST_MakePoint((SELECT lng FROM ctr),(SELECT lat FROM ctr)),4326)::geography gc)
SELECT CASE WHEN (SELECT lat FROM ctr) IS NULL THEN NULL ELSE jsonb_build_object(
  'name', p_name,
  'center', jsonb_build_object('lat', round((SELECT lat FROM ctr)::numeric,5), 'lng', round((SELECT lng FROM ctr)::numeric,5)),
  'radius_m', p_radius_m, 'bbox', NULL, 'local_sources', '[]'::jsonb,
  'svamp', jsonb_build_object('status','prepared','note','Plockplatser förbereds — inga påhittade lägen.'),
  'categories', (
    SELECT jsonb_agg(c ORDER BY (c->>'count')::int DESC) FROM (
      SELECT jsonb_build_object('key','bathing','link_kind','experience','group','adventure','label_sv','Badplatser','label_en','Bathing spots',
        'count',(SELECT count(*) FROM experiences e, g WHERE e.category='badplats' AND e.lat IS NOT NULL AND ST_DWithin(ST_SetSRID(ST_MakePoint(e.lng,e.lat),4326)::geography, g.gc, p_radius_m)),
        'items',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'label',name,'lat',lat,'lng',lng)),'[]'::jsonb) FROM (SELECT e.id, e.name, e.lat, e.lng FROM experiences e, g WHERE e.category='badplats' AND e.lat IS NOT NULL AND ST_DWithin(ST_SetSRID(ST_MakePoint(e.lng,e.lat),4326)::geography, g.gc, p_radius_m) ORDER BY ST_Distance(ST_SetSRID(ST_MakePoint(e.lng,e.lat),4326)::geography,g.gc) LIMIT 12) x)) c
      UNION ALL
      SELECT jsonb_build_object('key','runestones','link_kind','inscription','group','core','label_sv','Runstenar','label_en','Runestones',
        'count',(SELECT count(*) FROM runic_inscriptions r, g WHERE r.coordinates IS NOT NULL AND ST_DWithin(ST_SetSRID(ST_MakePoint(r.coordinates[0],r.coordinates[1]),4326)::geography, g.gc, p_radius_m)),
        'items',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'label',label,'signum',signum,'lat',lat,'lng',lng)),'[]'::jsonb) FROM (SELECT r.id, coalesce(nullif(r.name,''),r.signum) label, r.signum, r.coordinates[1] lat, r.coordinates[0] lng FROM runic_inscriptions r, g WHERE r.coordinates IS NOT NULL AND ST_DWithin(ST_SetSRID(ST_MakePoint(r.coordinates[0],r.coordinates[1]),4326)::geography, g.gc, p_radius_m) ORDER BY ST_Distance(ST_SetSRID(ST_MakePoint(r.coordinates[0],r.coordinates[1]),4326)::geography,g.gc) LIMIT 12) x))
      UNION ALL
      SELECT jsonb_build_object('key','churches','link_kind','church','group','core','label_sv','Medeltidskyrkor','label_en','Medieval churches',
        'count',(SELECT count(*) FROM ecclesiastical_sites e, g WHERE e.lat IS NOT NULL AND ST_DWithin(ST_SetSRID(ST_MakePoint(e.lng,e.lat),4326)::geography, g.gc, p_radius_m)),
        'items',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'label',name,'lat',lat,'lng',lng)),'[]'::jsonb) FROM (SELECT e.id, e.name, e.lat, e.lng FROM ecclesiastical_sites e, g WHERE e.lat IS NOT NULL AND ST_DWithin(ST_SetSRID(ST_MakePoint(e.lng,e.lat),4326)::geography, g.gc, p_radius_m) ORDER BY ST_Distance(ST_SetSRID(ST_MakePoint(e.lng,e.lat),4326)::geography,g.gc) LIMIT 12) x))
      UNION ALL
      SELECT jsonb_build_object('key','coins','link_kind','coin','group','core','label_sv','Mynt & skatter','label_en','Coins & hoards',
        'count',(SELECT count(*) FROM coins co, g WHERE co.coordinates IS NOT NULL AND ST_DWithin(ST_SetSRID(ST_MakePoint(co.coordinates[0],co.coordinates[1]),4326)::geography, g.gc, p_radius_m)),
        'items',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'label',label,'lat',lat,'lng',lng)),'[]'::jsonb) FROM (SELECT co.id, coalesce(co.name, co.id::text) label, co.coordinates[1] lat, co.coordinates[0] lng FROM coins co, g WHERE co.coordinates IS NOT NULL AND ST_DWithin(ST_SetSRID(ST_MakePoint(co.coordinates[0],co.coordinates[1]),4326)::geography, g.gc, p_radius_m) ORDER BY ST_Distance(ST_SetSRID(ST_MakePoint(co.coordinates[0],co.coordinates[1]),4326)::geography,g.gc) LIMIT 12) x))
      UNION ALL
      SELECT jsonb_build_object('key','gravefields','link_kind','heritage','group','monuments','label_sv','Gravfält','label_en','Grave fields',
        'count',(SELECT count(*) FROM heritage_sites h, g WHERE h.lat IS NOT NULL AND h.raa_type ILIKE '%gravfält%' AND ST_DWithin(ST_SetSRID(ST_MakePoint(h.lng,h.lat),4326)::geography, g.gc, p_radius_m)),
        'items',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'label',name,'lat',lat,'lng',lng)),'[]'::jsonb) FROM (SELECT h.id, h.name, h.lat, h.lng FROM heritage_sites h, g WHERE h.lat IS NOT NULL AND h.raa_type ILIKE '%gravfält%' AND ST_DWithin(ST_SetSRID(ST_MakePoint(h.lng,h.lat),4326)::geography, g.gc, p_radius_m) ORDER BY ST_Distance(ST_SetSRID(ST_MakePoint(h.lng,h.lat),4326)::geography,g.gc) LIMIT 12) x))
      UNION ALL
      SELECT jsonb_build_object('key','stone_monuments','link_kind','heritage','group','monuments','label_sv','Stenmonument','label_en','Stone monuments',
        'count',(SELECT count(*) FROM heritage_sites h, g WHERE h.lat IS NOT NULL AND (h.raa_type ILIKE '%rest sten%' OR h.raa_type ILIKE '%domarring%' OR h.raa_type ILIKE '%skeppssättning%' OR h.raa_type ILIKE '%stenkrets%') AND ST_DWithin(ST_SetSRID(ST_MakePoint(h.lng,h.lat),4326)::geography, g.gc, p_radius_m)),
        'items',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'label',name,'lat',lat,'lng',lng)),'[]'::jsonb) FROM (SELECT h.id, h.name, h.lat, h.lng FROM heritage_sites h, g WHERE h.lat IS NOT NULL AND (h.raa_type ILIKE '%rest sten%' OR h.raa_type ILIKE '%domarring%' OR h.raa_type ILIKE '%skeppssättning%' OR h.raa_type ILIKE '%stenkrets%') AND ST_DWithin(ST_SetSRID(ST_MakePoint(h.lng,h.lat),4326)::geography, g.gc, p_radius_m) ORDER BY ST_Distance(ST_SetSRID(ST_MakePoint(h.lng,h.lat),4326)::geography,g.gc) LIMIT 12) x))
      UNION ALL
      SELECT jsonb_build_object('key','rock_art','link_kind','heritage','group','monuments','label_sv','Hällristningar','label_en','Rock carvings',
        'count',(SELECT count(*) FROM heritage_sites h, g WHERE h.lat IS NOT NULL AND h.raa_type ILIKE '%hällristning%' AND ST_DWithin(ST_SetSRID(ST_MakePoint(h.lng,h.lat),4326)::geography, g.gc, p_radius_m)),
        'items',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'label',name,'lat',lat,'lng',lng)),'[]'::jsonb) FROM (SELECT h.id, h.name, h.lat, h.lng FROM heritage_sites h, g WHERE h.lat IS NOT NULL AND h.raa_type ILIKE '%hällristning%' AND ST_DWithin(ST_SetSRID(ST_MakePoint(h.lng,h.lat),4326)::geography, g.gc, p_radius_m) ORDER BY ST_Distance(ST_SetSRID(ST_MakePoint(h.lng,h.lat),4326)::geography,g.gc) LIMIT 12) x))
      UNION ALL
      SELECT jsonb_build_object('key','wrecks','link_kind','heritage','group','history','label_sv','Skeppsvrak','label_en','Shipwrecks',
        'count',(SELECT count(*) FROM shipwrecks s, g WHERE s.geom IS NOT NULL AND ST_DWithin(s.geom::geography, g.gc, p_radius_m)),
        'items',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'label',name,'lat',lat,'lng',lng)),'[]'::jsonb) FROM (SELECT s.id, s.name, ST_Y(s.geom) lat, ST_X(s.geom) lng FROM shipwrecks s, g WHERE s.geom IS NOT NULL AND ST_DWithin(s.geom::geography, g.gc, p_radius_m) ORDER BY ST_Distance(s.geom::geography,g.gc) LIMIT 12) x))
      UNION ALL
      SELECT jsonb_build_object('key','events','link_kind','event','group','history','label_sv','Händelser','label_en','Events',
        'count',(SELECT count(*) FROM historical_events ev, g WHERE ev.lat IS NOT NULL AND ST_DWithin(ST_SetSRID(ST_MakePoint(ev.lng,ev.lat),4326)::geography, g.gc, p_radius_m)),
        'items',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'label',event_name,'sub',year_start,'lat',lat,'lng',lng)),'[]'::jsonb) FROM (SELECT ev.id, ev.event_name, ev.year_start, ev.lat, ev.lng FROM historical_events ev, g WHERE ev.lat IS NOT NULL AND ST_DWithin(ST_SetSRID(ST_MakePoint(ev.lng,ev.lat),4326)::geography, g.gc, p_radius_m) ORDER BY ST_Distance(ST_SetSRID(ST_MakePoint(ev.lng,ev.lat),4326)::geography,g.gc) LIMIT 12) x))
    ) cc(c) WHERE (c->>'count')::int > 0
  )
) END;
$function$
;
