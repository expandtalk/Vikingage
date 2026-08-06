-- SDHK karantän-staging för extraktionstestet (medeltidsbrev, 44 264 poster). 2026-08-06.
-- Applicerad i prod via MCP (denna fil = repo-spegling). Isolerat schema `sdhk`,
-- INGA FK till plattformstabeller — normaliseringen sker senare in i befintlig
-- ontologi (charter → historical_sources source_type='charter'; akt → historical_events;
-- deltagarroller → predikaten issued/received/sealed/witnessed/land_witness/consented/
-- guarantor_of/mentioned_in; mentions → name_authority; SDHK/DS-nr → external_ids).
--
-- Import via psql KLIENT-side \copy (hostad Supabase saknar serverfilsystem →
-- server-side COPY FROM '/path' funkar inte). psql transkodar CP1252→UTF-8 på plats:
--   \copy sdhk.letters_raw (sdhk_id,title,author_raw,date_raw,place_raw,lang_raw,
--     summary,comments,additional,seals,original_ref,medieval_copy,postmedieval_copy,
--     medieval_reg,postmedieval_reg,photocopy,print_ref,print_reg,facsimile,
--     translation_ref,edition_text)
--   FROM 'sdhk_export.csv'
--   WITH (FORMAT csv, DELIMITER ';', QUOTE '"', HEADER true, ENCODING 'WIN1252');
-- VERIFIERA: count(*) = 44264; SELECT title FROM sdhk.letters_raw WHERE sdhk_id=1 → 'Söderköping'.

CREATE SCHEMA IF NOT EXISTS sdhk;

CREATE TABLE IF NOT EXISTS sdhk.letters_raw (
  sdhk_id            integer PRIMARY KEY,
  title              text, author_raw text, date_raw text, place_raw text, lang_raw text,
  summary            text, comments text, additional text, seals text,
  original_ref       text, medieval_copy text, postmedieval_copy text,
  medieval_reg       text, postmedieval_reg text, photocopy text,
  print_ref          text, print_reg text, facsimile text, translation_ref text, edition_text text,
  imported_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sdhk.pass1_results (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sdhk_id        integer NOT NULL REFERENCES sdhk.letters_raw(sdhk_id),
  date_earliest  date, date_latest date, date_qualifier text,
  date_uncertain boolean NOT NULL DEFAULT false,
  issuer_raw     text, issue_place_raw text,
  sdhk_crossrefs integer[] NOT NULL DEFAULT '{}',
  ds_refs        text[]    NOT NULL DEFAULT '{}',
  socken_patterns jsonb    NOT NULL DEFAULT '[]',
  extracted_at   timestamptz NOT NULL,
  UNIQUE (sdhk_id, extracted_at)
);

CREATE TABLE IF NOT EXISTS sdhk.pass2_results (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sdhk_id        integer NOT NULL REFERENCES sdhk.letters_raw(sdhk_id),
  model          text NOT NULL, prompt_version text NOT NULL,
  extraction     jsonb, error text,
  extracted_at   timestamptz NOT NULL,
  UNIQUE (sdhk_id, model, prompt_version, extracted_at)
);

CREATE INDEX IF NOT EXISTS idx_pass2_act_type ON sdhk.pass2_results ((extraction->>'act_type'));
CREATE INDEX IF NOT EXISTS idx_pass2_extraction_gin ON sdhk.pass2_results USING gin (extraction jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_pass1_dates ON sdhk.pass1_results (date_earliest, date_latest);
