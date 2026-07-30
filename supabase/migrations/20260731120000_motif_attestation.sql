-- motif_attestation: strukturerad ikonografisk attestering (ristning ↔ motiv) med INBYGGDA
-- skyddsräcken mot vetenskaplig kritik (jfr sessionens diskussion):
--   * confidence, source OCH interpreter är OBLIGATORISKA (vem tolkade, varifrån)
--   * is_hypothesis-flagga: en motividentifiering markeras som hypotes tills den är belagd
--     (etablerade identifikationer = false; spekulativa = true). KLUSTRING/tradition
--     presenteras ALLTID som hypotes i frontend, oavsett per-motiv-confidence.
--   * skiljer lämning (inscription/lämning) från observation (dokumentation) och tolkning.
-- Applicerad mot fjärr-DB via pooler; denna fil = proveniens. RLS: publik läs / admin skriv.

CREATE TABLE IF NOT EXISTS public.motif_attestation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inscription_id uuid REFERENCES public.runic_inscriptions(id) ON DELETE CASCADE,
  heritage_source_uri text,                       -- hällristnings-lämningar utanför runic_inscriptions
  motif_cycle text NOT NULL,                        -- fingeravtrycks-grupp, t.ex. 'sigurd','thors_fiske'
  motif_key text NOT NULL,                          -- t.ex. 'dragon_as_runeband','thumb_sucking'
  motif_label_sv text,
  motif_label_en text,
  motif_id uuid REFERENCES public.iconographic_motifs(motif_id),        -- valfri koppling till katalog
  confidence text NOT NULL CHECK (confidence IN ('certain','probable','possible','disputed')),
  is_hypothesis boolean NOT NULL DEFAULT true,
  interpreter text NOT NULL,
  source text NOT NULL,
  observation_id uuid REFERENCES public.observation(observation_id),    -- valfri dokumentations-grundning
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT motif_subject_present CHECK (inscription_id IS NOT NULL OR heritage_source_uri IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_motif_att_inscription ON public.motif_attestation(inscription_id);
CREATE INDEX IF NOT EXISTS idx_motif_att_cycle ON public.motif_attestation(motif_cycle);
CREATE INDEX IF NOT EXISTS idx_motif_att_key ON public.motif_attestation(motif_key);

ALTER TABLE public.motif_attestation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS motif_att_read ON public.motif_attestation;
CREATE POLICY motif_att_read ON public.motif_attestation FOR SELECT USING (true);
DROP POLICY IF EXISTS motif_att_write ON public.motif_attestation;
CREATE POLICY motif_att_write ON public.motif_attestation FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
GRANT SELECT ON public.motif_attestation TO anon, authenticated;

-- SEED: tre verifierade figurstenar (Ramsund/Drävle: foto + Sigurd stones-litteratur;
-- Altuna: foto + Altuna Runestone/Wikipedia). Etablerade identifikationer → is_hypothesis=false.
INSERT INTO public.motif_attestation
  (inscription_id, motif_cycle, motif_key, motif_label_sv, motif_label_en, confidence, is_hypothesis, interpreter, source)
SELECT ri.id, x.cyc, x.key, x.sv, x.en, x.conf, x.hyp, x.interp, x.src
FROM (VALUES
  -- Ramsund Sö 101 (Sigurdscykeln)
  ('Sö 101','sigurd','dragon_as_runeband','Draken Fafnir som runband','Dragon Fáfnir as the rune-band','certain',false,'Standardrunologi (UR/Rundata)','Sigurd stones (Wikipedia); foto Ramsundsberget'),
  ('Sö 101','sigurd','sigurd_stabs_from_below','Sigurd stinger draken underifrån','Sigurd stabs the dragon from below','certain',false,'Standardrunologi','Sigurd stones (Wikipedia)'),
  ('Sö 101','sigurd','regin_beheaded','Den halshuggne Regin','Regin beheaded','certain',false,'Standardrunologi','foto + Sigurd stones (Wikipedia)'),
  ('Sö 101','sigurd','smiths_tools','Smedens verktyg (tång, hammare, städ, bälg)','Smith''s tools','certain',false,'Standardrunologi','foto Ramsund'),
  ('Sö 101','sigurd','thumb_sucking','Sigurd suger på tummen','Sigurd sucking his thumb','certain',false,'Standardrunologi','Sigurd stones (Wikipedia)'),
  ('Sö 101','sigurd','roasting_heart','Fafnirs hjärta steks på spett','Fáfnir''s heart roasting on a spit','certain',false,'Standardrunologi','Sigurd stones (Wikipedia)'),
  ('Sö 101','sigurd','talking_birds','De talande fåglarna','The talking birds','certain',false,'Standardrunologi','foto + Sigurd stones (Wikipedia)'),
  ('Sö 101','sigurd','grani_treasure','Hästen Grane med skatten','Grani the horse with the treasure','certain',false,'Standardrunologi','Sigurd stones (Wikipedia)'),
  -- Drävle U 1163 (Sigurdscykeln)
  ('U 1163','sigurd','sigurd_stabs_from_below','Sigurd med svärdet','Sigurd with his sword','certain',false,'Standardrunologi','Sigurd stones (Wikipedia): Drävle'),
  ('U 1163','sigurd','sigrdrifa_horn','Sigrdriva räcker dryckeshorn','Sigrdrífa offering a drinking horn','certain',false,'Standardrunologi','Sigurd stones (Wikipedia): Drävle'),
  ('U 1163','sigurd','andvari_ring','Andvari med ringen','Andvari with the ring','probable',false,'Standardrunologi','Sigurd stones (Wikipedia): Drävle'),
  -- Altuna U 1161 (Tors fiskefärd)
  ('U 1161','thors_fiske','thor_with_mjolnir','Tor med hammaren Mjölner','Thor with the hammer Mjölnir','probable',false,'Standardrunologi','Altuna Runestone (Wikipedia); foto'),
  ('U 1161','thors_fiske','foot_through_boat','Tors fot genom båtbottnen','Thor''s foot through the boat hull','certain',false,'Standardrunologi','Altuna Runestone (Wikipedia); foto'),
  ('U 1161','thors_fiske','ox_head_bait','Oxhuvud som bete','Ox-head as bait','certain',false,'Standardrunologi','Altuna Runestone (Wikipedia)'),
  ('U 1161','thors_fiske','midgard_serpent','Midgårdsormen','The Midgard Serpent','certain',false,'Standardrunologi','Altuna Runestone (Wikipedia)')
) AS x(signum, cyc, key, sv, en, conf, hyp, interp, src)
JOIN public.runic_inscriptions ri ON ri.signum = x.signum
WHERE NOT EXISTS (
  SELECT 1 FROM public.motif_attestation m WHERE m.inscription_id = ri.id AND m.motif_key = x.key AND m.motif_cycle = x.cyc
);
