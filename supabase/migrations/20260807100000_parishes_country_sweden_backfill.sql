-- 30 svenska socknar saknade country → visades som "okänd"/Danmark i söket. Sätt Sweden.
-- Applicerad i prod via MCP (repo-spegling). 2026-08-07.
UPDATE public.parishes SET country='Sweden'
WHERE country IS NULL OR country='' OR lower(country) IN ('unknown','okänd');
