-- Exponera runic_inscriptions.coord_confidence + coord_source via vyn
-- runic_with_coordinates, så kartan kan tona osäkra markörer (verifierat vs
-- approximativt). Vyns befintliga `confidence`/`coordinate_source` kommer från
-- additional_coordinates-joinen (numera ~tom → NULL för nästan alla), så de dög
-- inte. Lägger till TVÅ nya kolumner sist (coord_confidence, coord_source) från
-- huvudtabellen — CREATE OR REPLACE tillåter tillägg sist, ändrar inget befintligt.
-- Kör i SQL-editorn, sedan: supabase migration repair --status applied 20260718150000

create or replace view public.runic_with_coordinates as
 SELECT r.id,
    r.signum,
    r.transliteration,
    r.location,
    r.parish,
    r.province,
    r.country,
    r.municipality,
    r.county,
    r.landscape,
    r.translation_en,
    r.translation_sv,
    r.object_type,
    r.period_start,
    r.period_end,
    r.dating_text,
    r.created_at,
    r.coordinates AS original_coordinates,
    c.latitude AS coordinates_latitude,
    c.longitude AS coordinates_longitude,
    ac.latitude AS additional_latitude,
    ac.longitude AS additional_longitude,
    ac.source AS coordinate_source,
    ac.confidence,
        CASE
            WHEN r.coordinates IS NOT NULL THEN 'original_coordinates'::text
            WHEN c.latitude IS NOT NULL THEN 'coordinates_table'::text
            WHEN ac.latitude IS NOT NULL THEN 'additional_coordinates'::text
            ELSE 'no_coordinates'::text
        END AS coordinate_status,
        CASE
            WHEN r.coordinates IS NOT NULL OR c.latitude IS NOT NULL OR ac.latitude IS NOT NULL THEN 'has_coordinates'::text
            WHEN r.location IS NOT NULL AND r.parish IS NOT NULL THEN 'high_geocoding_potential'::text
            WHEN r.location IS NOT NULL THEN 'medium_geocoding_potential'::text
            ELSE 'low_geocoding_potential'::text
        END AS geocoding_priority,
    r.coord_confidence,
    r.coord_source
   FROM runic_inscriptions r
     LEFT JOIN coordinates c ON r.id::text = c.object_id AND c.current_flag = 1
     LEFT JOIN additional_coordinates ac ON r.signum = ac.signum;
