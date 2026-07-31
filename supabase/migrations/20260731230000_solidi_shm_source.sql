-- Stabil källnyckel på solidi för idempotent SHM-upsert.
ALTER TABLE public.solidi ADD COLUMN IF NOT EXISTS source_uri text;
CREATE UNIQUE INDEX IF NOT EXISTS uq_solidi_source_uri ON public.solidi(source_uri);
COMMENT ON COLUMN public.solidi.source_uri IS 'Stabil källnyckel för upsert (t.ex. shm:<Föremålsnummer>). SHM samlingar = CC BY 4.0.';
