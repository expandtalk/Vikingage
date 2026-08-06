-- Skeppsvrak: kartlager-vy, sökbarhet, admin-skrivrättigheter + geom-RPC. 2026-08-06.
-- Applicerad i prod via MCP (denna fil = repo-spegling).

-- 1. Vy som exponerar lat/lng (PostgREST kan ej läsa rå PostGIS-geom) — driver kartlagret
--    (useMapShipwrecks) OCH admin-listan (useShipwrecks). security_invoker → respekterar bas-RLS.
DROP VIEW IF EXISTS public.shipwrecks_map;
CREATE VIEW public.shipwrecks_map WITH (security_invoker=on) AS
SELECT id, name, also_known_as, survey_label, vessel_type, identification, identification_confidence,
       construction, wood_species, length_m, beam_m, water_depth_m,
       dating_summary, dating_earliest, dating_latest, dating_method, dating_confidence,
       sinking_year, sinking_event, raa_number, fornreg_ref, parish, municipality, landscape,
       coord_source, coord_precision_m, source_ref, source_license, source_attribution, notes,
       ST_Y(geom) AS lat, ST_X(geom) AS lng
FROM public.shipwrecks
WHERE geom IS NOT NULL;
GRANT SELECT ON public.shipwrecks     TO anon, authenticated;
GRANT SELECT ON public.shipwrecks_map TO anon, authenticated;

-- 2. Skrivrättigheter (admin/editor) — RLS hade bara SELECT
DROP POLICY IF EXISTS shipwrecks_write ON public.shipwrecks;
CREATE POLICY shipwrecks_write ON public.shipwrecks FOR ALL
  USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());

-- 3. Sätt geom ur lat/lng (SECURITY INVOKER → RLS-skrivpolicyn gäller). Admin-formuläret
--    skriver skalära fält direkt och kallar denna för punkten (undviker EWKT i PostgREST).
CREATE OR REPLACE FUNCTION public.set_shipwreck_point(p_id uuid, p_lat double precision, p_lng double precision)
RETURNS void LANGUAGE sql SET search_path TO 'public' AS $$
  UPDATE public.shipwrecks SET geom = ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326) WHERE id = p_id;
$$;
GRANT EXECUTE ON FUNCTION public.set_shipwreck_point(uuid, double precision, double precision) TO authenticated;

-- 4. Sökbarhet: rebuild_search_document fick en 'shipwreck'-gren (applicerad via MCP —
--    hela funktionen är för lång för att spegla här). Grenen:
--    insert into search_document (entity_type, entity_id, label, sublabel, body_sv)
--    select 'shipwreck', s.id, s.name,
--      concat_ws(' · ','skeppsvrak', s.vessel_type, s.parish, s.landscape),
--      concat_ws(' ', array_to_string(s.also_known_as,' '), s.identification, s.construction,
--                     s.dating_summary, s.sinking_event, s.raa_number, s.notes)
--    from shipwrecks s ...;
SELECT public.rebuild_search_document('shipwreck');
