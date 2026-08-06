-- Vindklimatologi (SMHI) → vindros på farleds-/marinvyerna. 2026-08-06.
-- Seedad via scripts/data/ingest-smhi-wind.mjs (SMHI metobs param 3, deterministisk
-- 8-sektors-bin). Kalmarsund: station Kalmar (66430), 82427 obs 1927–1996.
-- Applicerad i prod via MCP (denna fil = repo-spegling).

CREATE TABLE IF NOT EXISTS public.wind_climatology (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  station text, station_id text,
  lat double precision, lng double precision,
  sector text NOT NULL,          -- N/NO/O/SO/S/SV/V/NV
  sector_deg integer NOT NULL,   -- centrumgrad 0/45/…/315
  frequency_pct numeric,
  n_obs integer,
  period_from date, period_to date,
  source text DEFAULT 'SMHI', source_license text DEFAULT 'CC BY 4.0',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (location, sector)
);
ALTER TABLE public.wind_climatology ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wind_climatology_read ON public.wind_climatology;
CREATE POLICY wind_climatology_read ON public.wind_climatology FOR SELECT USING (true);
GRANT SELECT ON public.wind_climatology TO anon, authenticated;
