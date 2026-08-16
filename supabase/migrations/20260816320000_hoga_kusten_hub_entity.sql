-- Höga kusten-hubb: kurerad spatial nod (content_pages, kind='region') så sök "höga kusten" landar
-- på hubben i st.f. att dead-enda. Sök-indexeras som entity_type='content_page'. Frontend: /sv/hoga-kusten.
insert into public.content_pages (slug, url, title_sv, title_en, kind, teaser_sv, teaser_en, verb_sv, verb_en, geom, geom_approx, priority)
select 'hoga-kusten', '/sv/hoga-kusten', 'Höga kusten', 'The High Coast', 'region',
  'Kustlandskapet i Ångermanland med världens största landhöjning — kyrkor, fornlämningar och berättelser från Härnösand, Kramfors/Ådalen, Sollefteå och Örnsköldsvik.',
  'The Ångermanland coast with the world''s greatest post-glacial land uplift — churches, ancient remains and stories from Härnösand, Kramfors/Ådalen, Sollefteå and Örnsköldsvik.',
  'Utforska', 'Explore',
  ST_SetSRID(ST_MakePoint(18.4, 62.9), 4326), true, 60
where not exists (select 1 from public.content_pages where slug = 'hoga-kusten');

-- content_pages indexeras via rebuild_search_document_x (entity_id = md5('content_page:'||id)::uuid).
-- Scopa till den nya raden (funktionen INSERTar utan delete → full körning ger dubblettnyckel).
select public.rebuild_search_document_x('content_page', md5('content_page:'||id::text)::uuid)
from public.content_pages where slug = 'hoga-kusten';
