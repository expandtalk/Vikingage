-- entity_answer_context: bildgalleriet bär nu licens + attribuering, och OKÄNDA licenser
-- utesluts (visas aldrig). Delta mot 20260807460000 (full funktion i prod via pg_get_functiondef):
--   img-CTE:  + m.license_code, coalesce(nullif(m.photographer,''), m.copyright_info) AS credit
--             + WHERE ... AND coalesce(m.license_code,'unknown') <> 'unknown'
--   images-output: jsonb_build_object(..., 'license', license_code, 'credit', credit)
-- Frontend (AnswerContext.tsx) renderar credit + licenslänk i lightboxen (CC BY kräver attribuering).
-- Applicerad i prod via MCP 2026-08-08; denna fil = delta-spegling.
SELECT 'entity_answer_context: bild-licens + credit + unknown-filter tillagt' AS note;
