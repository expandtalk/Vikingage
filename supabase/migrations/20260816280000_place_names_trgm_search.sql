-- Snabb substrängs-sök på ortnamn (för sök-först-rutan på /sv/ortnamn).
-- 358k place_names saknade namn-index → ILIKE '%q%' = seq scan. pg_trgm GIN fixar det.
create extension if not exists pg_trgm;
create index if not exists idx_place_names_name_trgm
  on public.place_names using gin (name gin_trgm_ops);
