-- christian_sites: Wikidata-QID för reconciliering (P625-verifierad ingest av
-- hospital/helgeandshus m.fl.). Unikt index (ej partiellt) så PostgREST/ON CONFLICT
-- kan upserta idempotent på wikidata_qid; null tillåts (befintliga 86 rader utan QID),
-- och NULL är distinkt i unika index så flera null-rader är OK.
alter table public.christian_sites add column if not exists wikidata_qid text;
create unique index if not exists christian_sites_wikidata_qid_key
  on public.christian_sites (wikidata_qid);
comment on column public.christian_sites.wikidata_qid is
  'Wikidata QID (P625-verifierad reconciliering). Unik där ej null.';
