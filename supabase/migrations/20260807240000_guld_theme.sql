-- Guldtema (fixar "guld/gold → no matches"). Teman auto-syncas till search_document via trg_search_refresh
-- → sökbart direkt. Länkar guldmynt/solidi/brakteater (som är registrerade i entity_registry) via theme_links.
-- OBS engelska "gold" faller under sök-golvet (fts-only + label-ankar 0.28); EN-förslagschippet bytt till
-- 'guld'. Djupare engelsk-tema-matchning = liten relevans-tweak (TODO). Applicerad via MCP; fil = spegling.
insert into public.themes (name, name_en, slug, keywords, description, description_en, icon)
select 'Guld', 'Gold', 'guld',
  ARRAY['guld','gold','guldfynd','guldmynt','guldbrakteat','brakteat','solidus','solidi','guldhalsring','guldskatt','guldålder','guldgubbe','gullgubbe'],
  'Guld i äldre järnålder och vikingatid: solidi (romerska/bysantinska guldmynt), guldbrakteater, guldhalsringar, guldgubbar och guldskatter. Guldets vägar speglar handel, makt och kult.',
  'Gold in the Iron Age and Viking Age: solidi (Roman/Byzantine gold coins), gold bracteates, gold neck-rings, gold-foil figures and gold hoards — reflecting trade, power and cult.',
  'coins'
where not exists (select 1 from public.themes where slug='guld');

insert into public.theme_links (theme_id, entity_type, entity_id, notes)
select (select id from public.themes where slug='guld'), 'coin', c.id, c.name
from public.coins c
where (c.name ilike '%guld%' or c.name ilike '%solid%' or c.name ilike '%brakteat%')
  and exists (select 1 from public.entity_registry er where er.id = c.id)
  and not exists (select 1 from public.theme_links tl
                  where tl.theme_id=(select id from public.themes where slug='guld') and tl.entity_id=c.id);
