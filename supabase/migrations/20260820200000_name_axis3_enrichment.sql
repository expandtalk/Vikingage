-- Berika axel 1+3 för name_authority. Fler korpusar → tidslinje "när kom namnet i svenskt bruk".
ALTER TABLE public.name_authority
  ADD COLUMN IF NOT EXISTS origin_language text,          -- axel 1 (filolog)
  ADD COLUMN IF NOT EXISTS theophoric boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS first_attestation_year int,    -- tidigaste daterade belägg i våra korpusar
  ADD COLUMN IF NOT EXISTS first_attestation_source text, -- 'runsten'|'SDHK'|'persons'|'modern'
  ADD COLUMN IF NOT EXISTS sdhk_first_year int,           -- första SDHK-brev (medeltid ~1160–1530)
  ADD COLUMN IF NOT EXISTS sdhk_charter_count int,        -- antal SDHK-brev (ordgränsmatch, versal)
  ADD COLUMN IF NOT EXISTS persons_first_year int;        -- tidigaste birth_year i persons (fyller 1530–1900-glappet, notabilitet)
