-- Tre-axel-modell för name_authority (jfr ortnamnens tvåaxel: belägg ≠ namnålder).
--   Axel 1: ursprung/etymologi (befintliga meaning/etymology) — absolut.
--   Axel 2: tradition_layer (fornnordiskt/bibliskt-kristet/lågtyskt/klassiskt/modernt) — FILOLOGISK, ej gissad (null tills belagt).
--   Axel 3: swedish_usage_layer — EMPIRISK, beräknad ur vilka korpusar namnet förekommer i.
-- Evidens-flaggor bär underlaget för axel 3 (spårbart, ej gissat).
ALTER TABLE public.name_authority
  ADD COLUMN IF NOT EXISTS tradition_layer text,           -- axel 2 (filolog; null = ej klassificerat)
  ADD COLUMN IF NOT EXISTS swedish_usage_layer text,       -- axel 3 (beräknad)
  ADD COLUMN IF NOT EXISTS on_runestone boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS runestone_inscriptions int,     -- max n_inscriptions bland matchande runformer
  ADD COLUMN IF NOT EXISTS in_carvers boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS in_kings boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS in_modern_use boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS modern_birth_count int,         -- antal nyfödda (given_name_stats riket, senaste år)
  ADD COLUMN IF NOT EXISTS harvest_sources text[],         -- proveniens: vilka källor bidrog
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

COMMENT ON COLUMN public.name_authority.tradition_layer IS 'Axel 2: språklig/kulturell tradition. FILOLOGISK — null tills källbelagt, gissas ALDRIG.';
COMMENT ON COLUMN public.name_authority.swedish_usage_layer IS 'Axel 3: när namnet kom i svenskt bruk, HÄRLETT ur korpus-förekomst (runsvenskt/medeltida/modernt). Runsten=terminus ~1100.';
COMMENT ON COLUMN public.name_authority.on_runestone IS 'Belagt på runsten (runic_name_attestations, fold-match). OBS: undervärderat för namn vars runform avviker från modern lemma (Sven→Sveinn) tills variant-layer/filolog-pass körts.';

CREATE INDEX IF NOT EXISTS name_authority_canonical_lc ON public.name_authority (lower(canonical));
CREATE INDEX IF NOT EXISTS name_authority_usage_layer ON public.name_authority (swedish_usage_layer);
