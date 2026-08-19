-- Standardisering av staging-proveniens (verifierarens fynd: place_claim.proposed_by_agent NULL överallt;
-- parallella ledgrar saknar machine_verifiable/proposed_by_agent → auto- vs människo-kö går ej att skilja).
-- Additivt/nullbart, bryter inget. place_claim hade redan båda kolumnerna.
alter table fort_hypothesis     add column if not exists proposed_by_agent text;
alter table fort_hypothesis     add column if not exists machine_verifiable boolean;
alter table interpretation_claim add column if not exists proposed_by_agent text;
alter table interpretation_claim add column if not exists machine_verifiable boolean;
alter table staging_inscriptions add column if not exists proposed_by_agent text;
alter table staging_inscriptions add column if not exists machine_verifiable boolean;

-- Granskningsbar rekoncilierings-/körhistorik (drift-vakt, invariant 4) — vilken agent körde vilket pass,
-- vad samplades, hur många befordrades/flaggades.
create table if not exists verification_run (
  id bigint generated always as identity primary key,
  agent text, pass text, ledger text,
  sampled_n int, promoted_n int, flagged_n int,
  note text, ran_at timestamptz not null default now());
alter table verification_run enable row level security;
drop policy if exists vr_read on verification_run;
create policy vr_read on verification_run for select using (true);
