-- Namndomän lager 2+3: Skatteverkets namnstatistik (myndighetsdata = FAKTA, fritt användbart med källa).
-- Rena fakta, ingen tolkning, ingen SA-prosa. Källa anges per rad.
--   given_name_stats  — tilltalsnamn på nyfödda (Skatteverket, per år; riket + kommun + län)
--   surname_stats     — Skatteverkets "fria efternamn"-lista med antal bärare
-- Koppling till name_authority sker via lower(name)=lower(canonical) vid behov (ej hård FK — namnmängderna skiljer sig).

-- ---------------------------------------------------------------------------
-- Tilltalsnamn på nyfödda
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.given_name_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('flicka','pojke')),
  birth_year int NOT NULL,
  rank int,                    -- Skatteverkets rangordning (delade placeringar förekommer)
  count int NOT NULL,          -- antal barn som fått namnet
  area_type text NOT NULL DEFAULT 'riket' CHECK (area_type IN ('riket','kommun','län')),
  area_name text,              -- kommun-/länsnamn när area_type <> 'riket'; NULL för riket
  source text NOT NULL DEFAULT 'Skatteverket',
  source_date date,            -- Skatteverkets datauttagsdatum (t.ex. 2026-01-16)
  created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.given_name_stats IS 'Tilltalsnamn på nyfödda per födelseår (Skatteverket). FAKTA/myndighetsdata. Riket + topp-50 per kommun + per län. Namnmängd = fullständig fördelning, ej bara topp-1000.';
COMMENT ON COLUMN public.given_name_stats.count IS 'Antal barn (av angivet kön, födda birth_year, inom area) som fått namnet som tilltalsnamn.';

CREATE UNIQUE INDEX IF NOT EXISTS given_name_stats_uniq
  ON public.given_name_stats (lower(name), gender, birth_year, area_type, coalesce(area_name,''));
CREATE INDEX IF NOT EXISTS given_name_stats_lookup ON public.given_name_stats (birth_year, gender, area_type);
CREATE INDEX IF NOT EXISTS given_name_stats_name ON public.given_name_stats (lower(name));
CREATE INDEX IF NOT EXISTS given_name_stats_area ON public.given_name_stats (area_type, area_name);

ALTER TABLE public.given_name_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "given_name_stats public read" ON public.given_name_stats;
CREATE POLICY "given_name_stats public read" ON public.given_name_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "given_name_stats admin write" ON public.given_name_stats;
CREATE POLICY "given_name_stats admin write" ON public.given_name_stats FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- Efternamn (Skatteverkets "fria efternamn"-lista, med antal bärare)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.surname_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bearer_count int NOT NULL,   -- antal personer som bär efternamnet
  rank int,                    -- rangordning efter bärarantal
  reference_year int NOT NULL, -- år listan avser (2026)
  is_free_to_adopt boolean,    -- källfilen = Skatteverkets "fria efternamn"; exakt lagtröskel EJ verifierad än
  source text NOT NULL DEFAULT 'Skatteverket',
  created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.surname_stats IS 'Efternamn med antal bärare (Skatteverket, Fria_efternamn-fil). FAKTA/myndighetsdata. is_free_to_adopt speglar källfilens urval; den exakta lagtröskeln (namnlagen) är ej oberoende verifierad.';

CREATE UNIQUE INDEX IF NOT EXISTS surname_stats_uniq ON public.surname_stats (lower(name), reference_year);
CREATE INDEX IF NOT EXISTS surname_stats_count ON public.surname_stats (bearer_count DESC);
CREATE INDEX IF NOT EXISTS surname_stats_name ON public.surname_stats (lower(name));

ALTER TABLE public.surname_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "surname_stats public read" ON public.surname_stats;
CREATE POLICY "surname_stats public read" ON public.surname_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "surname_stats admin write" ON public.surname_stats;
CREATE POLICY "surname_stats admin write" ON public.surname_stats FOR ALL USING (is_admin()) WITH CHECK (is_admin());
