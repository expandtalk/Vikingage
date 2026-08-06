-- 446 fornborgar hette generiskt "Fornborg (kommun)" → oskiljbara på kartan/i listor.
-- Ge unika, informativa namn via RAÄ-numret. Applicerad i prod via MCP (repo-spegling). 2026-08-07.
UPDATE public.swedish_hillforts
SET name = 'Fornborg ' || raa_number
WHERE (name ILIKE 'Fornborg (%' OR name = 'Fornborg') AND raa_number IS NOT NULL AND raa_number <> '';
