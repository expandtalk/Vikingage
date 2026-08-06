-- Tematisk surfning: boken "Bondenöd och stormaktsdröm" handlar om bönder + stormaktstiden
-- (nationellt, EJ Smålandsspecifikt) → documents-länka till teman, inte en kung. Teman auto-
-- registreras i entity_registry (trigger), så documents-länken resolvar.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
INSERT INTO public.themes (name, name_en, slug, description, keywords)
SELECT v.name, v.name_en, v.slug, v.description, v.keywords FROM (VALUES
  ('Stormaktstiden', 'The Swedish Empire', 'stormaktstiden',
   'Sveriges stormaktstid (ca 1611–1718): expansion, ständiga krig och det inrikes trycket på allmogen genom skatter och utskrivningar.',
   ARRAY['stormaktstid','stormaktstiden','1600-tal','krig','utskrivning']),
  ('Bönder & allmoge', 'Peasantry', 'bonder-allmoge',
   'Böndernas och allmogens villkor: skatter, utskrivningar, uppror och vardagsliv.',
   ARRAY['bönder','bonde','allmoge','bondeuppror','klasskamp'])
) AS v(name,name_en,slug,description,keywords)
WHERE NOT EXISTS (SELECT 1 FROM public.themes t WHERE t.slug = v.slug);

INSERT INTO public.relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence, created_by)
SELECT s.id, 'documents', th.id, jsonb_build_object('note', th.name),
       'Metadata (Axel Strindberg, Bondenöd och stormaktsdröm, 1630–1718) 2026-08-06', 'certain', 'curation:test-book'
FROM public.historical_sources s
JOIN public.themes th ON th.slug IN ('stormaktstiden','bonder-allmoge')
WHERE s.isbn = '9789178430031'
  AND NOT EXISTS (
    SELECT 1 FROM public.relationship r
    WHERE r.subject_id = s.id AND r.predicate = 'documents' AND r.object_id = th.id);
