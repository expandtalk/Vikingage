-- Nivå 1: gör vägpunkter (road_waypoints) sökbara. 118 namngivna punkter längs de historiska
-- vägarna (Göta landsväg, Eriksgatan …) — t.ex. "Brännkyrka kyrka" på Göta landsväg — fanns EJ i
-- söket. Indexeras som entity_type='road_waypoint' i search_document. Route via signum (=explore-URL,
-- samma mönster som content_page). tsv_* genereras från label+body_sv. geom ur coordinates (lng,lat).
-- Idempotent: rensa befintliga road_waypoint-rader först.

delete from public.search_document where entity_type = 'road_waypoint';

insert into public.search_document (entity_type, entity_id, signum, label, sublabel, body_sv, body_en, geom, prominence)
select
  'road_waypoint', rw.id,
  '/explore?center=' || (rw.coordinates[1])::text || ',' || (rw.coordinates[0])::text || '&zoom=14',
  rw.name,
  coalesce(vr.name, 'Historisk väg') || coalesce(' · ' || rw.waypoint_type, ''),
  -- Sökbar text: punktens namn + vägens namn + typ + beskrivning → hittas på både ort och väg.
  concat_ws(' ', rw.name, vr.name, rw.waypoint_type, rw.description),
  concat_ws(' ', coalesce(rw.name_en, rw.name), vr.name_en, rw.waypoint_type),
  ST_SetSRID(ST_MakePoint(rw.coordinates[0], rw.coordinates[1]), 4326),
  0.35   -- vägpunkter är mindre noder → låg men ej noll prominence
from public.road_waypoints rw
left join public.viking_roads vr on vr.id = rw.road_id
where rw.name is not null and rw.coordinates is not null;
