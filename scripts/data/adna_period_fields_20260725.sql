-- aDNA: numeriska periodfält på genetic_individuals så aDNA-lagret kan
-- periodfiltreras (samma overlapsPeriod som övriga lager). Inga påhittade värden —
-- härledda ur individens radiocarbon där det finns, annars platsens datering:
--   als001  radiocarbon 540/550–610/620 CE      -> 540..620
--   als007  radiocarbon 950–1000 CE             -> 950..1000
--   sal002  radiocarbon 950–1000 CE             -> 950..1000
--   kro006/kro009  Kronan sjönk 1676            -> 1676..1676
--   snb017/snb018  Sandby borg, sen 400-tal (400–550 CE, massaker ~480) -> 400..550
BEGIN;

ALTER TABLE genetic_individuals ADD COLUMN IF NOT EXISTS period_from integer;
ALTER TABLE genetic_individuals ADD COLUMN IF NOT EXISTS period_to   integer;

UPDATE genetic_individuals SET period_from=540,  period_to=620  WHERE sample_id='als001';
UPDATE genetic_individuals SET period_from=950,  period_to=1000 WHERE sample_id='als007';
UPDATE genetic_individuals SET period_from=950,  period_to=1000 WHERE sample_id='sal002';
UPDATE genetic_individuals SET period_from=1676, period_to=1676 WHERE sample_id IN ('kro006','kro009');
UPDATE genetic_individuals SET period_from=400,  period_to=550  WHERE sample_id IN ('snb017','snb018');

COMMIT;
