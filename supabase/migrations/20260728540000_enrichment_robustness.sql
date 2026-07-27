-- Utökar anrikningsresultatet med robusthet (kvot med BARA de säkra leden tor/frö/sal) + per-led-bidrag,
-- så forskarvyn kan visa om signalen håller när omtvistade led (härn/ross) tas bort.
begin;
alter table public.ortnamn_enrichment_results
  add column if not exists ratio_core numeric,
  add column if not exists cult_core_n int,
  add column if not exists per_element jsonb;
commit;
