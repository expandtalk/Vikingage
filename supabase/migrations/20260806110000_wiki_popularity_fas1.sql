-- Sök Fas 1: entitets-populariteten drivs av Ahrefs sökvolym per Wikipedia-entitet.
-- Applicerad i prod 2026-08-06 via MCP (denna fil = repo-spegling).

CREATE TABLE IF NOT EXISTS public.wiki_popularity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name text NOT NULL,
  wikipedia_url text,
  volume integer,
  source text DEFAULT 'Ahrefs',
  note text,
  updated_at timestamptz DEFAULT now()
);

-- Seed: läsbara huvud-entiteter ur första Ahrefs-exporten (head-keywordens volym).
-- 'thor' 177K = Marvel (en.wikipedia/Thor) ≠ vår gud Tor → utelämnas medvetet.
INSERT INTO public.wiki_popularity (entity_name, wikipedia_url, volume, note) VALUES
 ('Öland','https://sv.wikipedia.org/wiki/Öland',33000,NULL),
 ('Gotland','https://sv.wikipedia.org/wiki/Gotland',41000,NULL),
 ('Birka','https://sv.wikipedia.org/wiki/Birka',11000,NULL),
 ('Oden','https://sv.wikipedia.org/wiki/Oden',5400,'odens bror 5.7K')
ON CONFLICT DO NOTHING;

-- Denormalisera in i indexet (kolumnläsning vid sökning → oberoende av tabellstorlek).
UPDATE public.search_document sd
   SET popularity = greatest(coalesce(sd.popularity,0), wp.volume)
  FROM public.wiki_popularity wp
 WHERE lower(sd.label) = lower(wp.entity_name);

-- Snabb ingest/backfill när full CSV kommer.
CREATE INDEX IF NOT EXISTS idx_wiki_popularity_name        ON public.wiki_popularity (lower(entity_name));
CREATE INDEX IF NOT EXISTS idx_wiki_popularity_url         ON public.wiki_popularity (wikipedia_url);
CREATE INDEX IF NOT EXISTS idx_search_document_lower_label ON public.search_document (lower(label));
