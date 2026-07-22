-- P0 snabbfixar (docs/kunskapsgraf-arkitektur.md):
-- 1) pg_trgm — trigram-index för stavfelstålig sök (P4) och gazetteer-fuzzy-matchning (P1).
-- 2) ANALYZE — planner-statistiken var kraftigt inaktuell (n_live_tup=0 på fulla,
--    bulk-importerade tabeller; autovacuum hade aldrig kört ANALYZE på dem).
create extension if not exists pg_trgm;

analyze;
