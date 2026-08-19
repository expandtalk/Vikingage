-- Gör svamparna sökbara. "kantarell" gav 0 träffar — svamp.art/giftsvamp låg inte i search_document.
-- Två delar: (1) search_thumbs utökas med svampbilder (nedan, körbar), (2) ett 'mushroom'-block läggs
-- till i rebuild_search_document_x (md5-uuid, samma mönster som saint/content_page) — det applicerades
-- via scripts/data/patch-search-mushroom.mjs (funktionen är maskingenererad/stor; patchas med
-- pg_get_functiondef + regexp, repo-konvention). Populeras med: select rebuild_search_document('mushroom').

create or replace function public.search_thumbs(p_ids uuid[])
 returns table(entity_id uuid, thumb_url text)
 language sql stable security definer set search_path to 'public','svamp'
as $function$
  ( select distinct on (m.inscription_id) m.inscription_id, m.media_url
    from inscription_media m
    where m.inscription_id = any(p_ids) and m.media_url is not null and m.media_url <> ''
      and coalesce(m.media_type,'image') not in ('video','3d','model')
    order by m.inscription_id,
      (m.media_url ~* '\.(jpe?g|png|webp|gif)(\?|$)' or m.media_url ilike '%wikimedia%') desc,
      m.created_at asc nulls last )
  union all
  select md5('mushroom:'||a.id)::uuid, a.bild_url from svamp.art a
    where a.bild_url is not null and md5('mushroom:'||a.id)::uuid = any(p_ids)
  union all
  select md5('mushroom:'||g.id)::uuid, g.bild_url from svamp.giftsvamp g
    where g.bild_url is not null and md5('mushroom:'||g.id)::uuid = any(p_ids);
$function$;

-- Mushroom-block som lades till i rebuild_search_document_x (dokumentation — se patch-scriptet):
--   if p_type is null or p_type = 'mushroom' then
--     insert into search_document (entity_type, entity_id, label, sublabel, body_sv, body_en)
--     select 'mushroom', md5('mushroom:'||a.id)::uuid, a.svenskt_namn,
--       concat_ws(' · ', 'ätlig matsvamp', nullif(a.vetenskapligt_namn,'')),
--       concat_ws(' ', a.vetenskapligt_namn, a.kannetecken, 'svamp matsvamp ätlig plocka'),
--       coalesce(a.vetenskapligt_namn,'') from svamp.art a where (p_id is null or md5('mushroom:'||a.id)::uuid = p_id);
--     insert ... svamp.giftsvamp g  (sublabel 'giftig förväxlingssvamp', body: toxin/kanne_pa/symtom)
--   end if;
