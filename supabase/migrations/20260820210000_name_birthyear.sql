-- Förnamn per födelseår (SCB TAB615, levande folkbokförda 2021-12-31, topp-100 kvinnor+män, 1922–2021).
-- FAKTA. Överlevnadsbias (äldre årgångar tunnare pga dödlighet) — trendsignal, ej födelsefrekvens.
CREATE TABLE IF NOT EXISTS public.name_birthyear_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  birth_year int NOT NULL,
  count int NOT NULL,
  source text NOT NULL DEFAULT 'SCB TAB615 (levande folkbokförda 2021-12-31, per födelseår)',
  created_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS name_birthyear_uniq ON public.name_birthyear_stats (lower(name), birth_year);
CREATE INDEX IF NOT EXISTS name_birthyear_name ON public.name_birthyear_stats (lower(name));
ALTER TABLE public.name_birthyear_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "name_birthyear public read" ON public.name_birthyear_stats;
CREATE POLICY "name_birthyear public read" ON public.name_birthyear_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "name_birthyear admin write" ON public.name_birthyear_stats;
CREATE POLICY "name_birthyear admin write" ON public.name_birthyear_stats FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE public.name_authority
  ADD COLUMN IF NOT EXISTS birthyear_peak_decade text,
  ADD COLUMN IF NOT EXISTS birthyear_peak_count int,
  ADD COLUMN IF NOT EXISTS birthyear_total int;
