-- Lägg till r.meter i vyn runic_with_coordinates så versmåttet når frontend.
-- (En select-*-vy fryser kolumnlistan vid skapandet; denna vy räknar dessutom upp
--  kolumner explicit — därför måste den återskapas. Ny kolumn läggs SIST för att
--  CREATE OR REPLACE VIEW ska tillåtas.)
create or replace view public.runic_with_coordinates as
 select r.id,
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
    r.coordinates as original_coordinates,
    c.latitude as coordinates_latitude,
    c.longitude as coordinates_longitude,
    ac.latitude as additional_latitude,
    ac.longitude as additional_longitude,
    ac.source as coordinate_source,
    ac.confidence,
        case
            when r.coordinates is not null then 'original_coordinates'::text
            when c.latitude is not null then 'coordinates_table'::text
            when ac.latitude is not null then 'additional_coordinates'::text
            else 'no_coordinates'::text
        end as coordinate_status,
        case
            when r.coordinates is not null or c.latitude is not null or ac.latitude is not null then 'has_coordinates'::text
            when r.location is not null and r.parish is not null then 'high_geocoding_potential'::text
            when r.location is not null then 'medium_geocoding_potential'::text
            else 'low_geocoding_potential'::text
        end as geocoding_priority,
    r.coord_confidence,
    r.coord_source,
    r.socken,
    r.harad,
    r.meter
   from runic_inscriptions r
     left join coordinates c on r.id::text = c.object_id and c.current_flag = 1
     left join additional_coordinates ac on r.signum = ac.signum;
