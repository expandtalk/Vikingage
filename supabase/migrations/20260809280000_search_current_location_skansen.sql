-- Sökbugg: runstenar FLYTTADE till museer (current_location, t.ex. "Skansen") gav falskt
-- "utanför täckning" — current_location indexerades inte + rankades under tröskel.
-- Fix i två delar (applicerade i prod):
-- (1) DATA: lägg current_location i search_document.body_simple för de 346 flyttade stenarna
--     (tsv_simple uppdateras av trg_search_refresh; signaler bevaras — ingen full rebuild).
update search_document sd
set body_simple = sd.body_simple || ' ' || r.current_location, updated_at = now()
from runic_inscriptions r
where sd.entity_type='inscription' and sd.entity_id = r.id
  and r.current_location is not null and r.current_location <> ''
  and position(lower(r.current_location) in lower(coalesce(sd.body_simple,''))) = 0;

-- (2) RANKING: search_v1 fick en ny label-faktor-gren som krediterar träff i inskriftens
--     current_location (högsignal-fält) med 0.9 (som en label-träff), så flyttade stenar
--     passerar score-tröskeln. Full CREATE OR REPLACE applicerad via MCP-migration
--     'search_v1_credit_current_location'. Nyckelklausul:
--       when d.entity_type='inscription' and ri.current_location is not null
--            and position(lower(q.raw) in lower(ri.current_location)) > 0 then 0.9
--     + left join runic_inscriptions ri on ri.id=d.entity_id and d.entity_type='inscription'.
