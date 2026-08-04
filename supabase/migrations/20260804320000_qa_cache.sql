-- Cache för "Fråga AI"-svar (RAG). Edge-funktionen search-answer normaliserar frågan och
-- returnerar cachat svar om det finns → noll tokens, ingen embed/sök/graf/LLM, direkt svar.
-- Delad cache mellan alla besökare. RLS på utan policies = endast service role (funktionen) rör den.
-- Töm vid behov: TRUNCATE qa_cache;  (eller radera per språk/fråga).

CREATE TABLE IF NOT EXISTS qa_cache (
  question_norm text NOT NULL,
  language text NOT NULL DEFAULT 'sv',
  answer text NOT NULL,
  sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  model text,
  hits int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (question_norm, language)
);
ALTER TABLE qa_cache ENABLE ROW LEVEL SECURITY;
