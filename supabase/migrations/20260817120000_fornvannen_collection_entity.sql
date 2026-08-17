-- Fornvännen-samlingsentitet i sök-indexet. Problem: search_v1 har ett diversitets-tak
-- (type_rn <= 20 per entity_type) → en tidskrift med 3604 artiklar kan aldrig visas systematiskt;
-- sökning på "fornvännen" gav bara ~20 tidskrifts-metarader, inte beståndet. Lösning: EN
-- content_page "Fornvännen" med hög prominence som rankas överst och leder till /sv/fornvannen
-- (bläddringsbar artikellista). content_pages.geom är NOT NULL → RAÄ/Fornvännen-redaktionen i
-- Stockholm som representativ (geom_approx=true). Indexeras via rebuild_search_document_x.

insert into public.content_pages (slug, url, title_sv, title_en, kind, teaser_sv, teaser_en, geom, geom_approx, priority)
select 'fornvannen', '/sv/fornvannen',
  'Fornvännen', 'Fornvännen', 'collection',
  'Sveriges äldsta arkeologiska tidskrift — hela beståndet: 3 604 artiklar ur DiVA (openAccess), filtrerbara på ämne, med PDF per artikel.',
  'Sweden''s oldest archaeology journal — the full run: 3,604 openAccess articles from DiVA, filterable by subject, PDF per article.',
  ST_SetSRID(ST_MakePoint(18.0686, 59.3293), 4326), true, 8
where not exists (select 1 from public.content_pages c where c.slug = 'fornvannen');

-- Bygg sök-dokument för samlingssidan (scopa till nya raden). Hög prominence sätts nedan så den
-- vinner "fornvännen"-sökningen över de enskilda tidskrifts-metaraderna.
select public.rebuild_search_document_x('content_page', md5('content_page:'||id::text)::uuid)
from public.content_pages where slug = 'fornvannen';

-- Höj prominence (tsv_* är generated → uppdateras EJ direkt; body räcker för matchning).
update public.search_document
set prominence = 3.0
where entity_type = 'content_page'
  and entity_id = md5('content_page:'||(select id::text from public.content_pages where slug='fornvannen'))::uuid;
