-- Totalt antal folkbokförda bärare per förnamn ("hur många heter X i Sverige"). FAKTA (Skatteverket/SCB).
-- Bulk-fylls ur nedladdad namnstatistik-fil; per-namn-sök seedar enstaka tills dess.
ALTER TABLE public.name_authority
  ADD COLUMN IF NOT EXISTS total_bearers int,
  ADD COLUMN IF NOT EXISTS total_bearers_source text,
  ADD COLUMN IF NOT EXISTS total_bearers_asof date;
