-- Gods-FAQ: "Vanliga frågor om [gud]" ur Ahrefs-sökvolym (on-topic Folklore-kategori).
-- Seedad via scripts/data/ingest-god-questions.mjs (96 frågor). 2026-08-06.
-- Applicerad i prod via MCP (denna fil = repo-spegling).

CREATE TABLE IF NOT EXISTS public.god_common_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  god_id uuid NOT NULL REFERENCES public.gods(id) ON DELETE CASCADE,
  question text NOT NULL,
  volume integer,
  source text DEFAULT 'Ahrefs',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (god_id, question)
);
ALTER TABLE public.god_common_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS gcq_read ON public.god_common_questions;
CREATE POLICY gcq_read ON public.god_common_questions FOR SELECT USING (true);
GRANT SELECT ON public.god_common_questions TO anon, authenticated;
