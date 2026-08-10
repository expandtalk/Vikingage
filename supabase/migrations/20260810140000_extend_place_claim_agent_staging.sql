-- (c) Claim-ledgern som staging OCH kanon (Daniel: mindre yta, en sanningskälla).
-- place_claim.verification_status modellerar redan livscykeln:
--   needs_verification = FÖRESLAGET (agent) → verified | rejected | disputed | unpublished_hypothesis.
-- Lägg bara till agent-proveniens, auto-befordran-flagga och gransknings-audit. Additivt.
-- Applicerad på prod via MCP apply_migration (extend_place_claim_agent_staging); denna fil = repo-spegel.

ALTER TABLE public.place_claim
  ADD COLUMN IF NOT EXISTS proposed_by_agent text,
  ADD COLUMN IF NOT EXISTS machine_verifiable boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reviewed_by text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

COMMENT ON COLUMN public.place_claim.proposed_by_agent IS 'Agent som föreslog claimet (t.ex. forntidsforensiker); NULL = ej agent-genererat. Konvention: agent-INSERT sätter verification_status=needs_verification (eller unpublished_hypothesis för tolkning) + confidence + källa.';
COMMENT ON COLUMN public.place_claim.machine_verifiable IS 'true = maskinellt verifierbart (Wikidata P625, DB-count, RAÄ-URI) → får auto-befordras (verification_status=verified) MED proveniens; annars kräver människa/verifierar-agent.';
COMMENT ON COLUMN public.place_claim.reviewed_by IS 'Människa eller verifierar-agent som satte verified/rejected/disputed.';
COMMENT ON COLUMN public.place_claim.reviewed_at IS 'Tidpunkt för granskning/befordran.';

-- Konvention (ingen kod): agent-fynd → INSERT place_claim (verification_status='needs_verification',
--   proposed_by_agent='<agent>', confidence, source_id/source_locator). Befordran: UPDATE
--   verification_status='verified', reviewed_by/reviewed_at. Endast machine_verifiable får auto-befordras.
-- RLS-skärpning (framtida): agent-roll får INSERT men bara verification_status IN
--   ('needs_verification','unpublished_hypothesis'); UPDATE till 'verified' endast admin/verifierare.
